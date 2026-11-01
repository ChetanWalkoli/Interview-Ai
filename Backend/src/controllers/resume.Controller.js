const PDFDocument = require("pdfkit");

/**
 * Sanitize string input to prevent control character injection
 */
function sanitize(val) {
    if (typeof val !== "string") return "";
    return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

/**
 * Controller to generate and download a professional resume PDF
 */
async function generateResumePdfController(req, res) {
    try {
        const body = req.body || {};

        const fullName = sanitize(body.fullName);
        const email = sanitize(body.email);
        const phone = sanitize(body.phone);
        const location = sanitize(body.location);
        const website = sanitize(body.website);
        const linkedin = sanitize(body.linkedin);
        const github = sanitize(body.github);
        const summary = sanitize(body.summary);

        // Validation
        if (!fullName || fullName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: Full name is required."
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: A valid email address is required."
            });
        }

        const skills = Array.isArray(body.skills)
            ? body.skills.map(sanitize).filter(Boolean)
            : (typeof body.skills === "string" ? body.skills.split(",").map(sanitize).filter(Boolean) : []);

        const experience = Array.isArray(body.experience) ? body.experience : [];
        const education = Array.isArray(body.education) ? body.education : [];
        const projects = Array.isArray(body.projects) ? body.projects : [];
        const certifications = Array.isArray(body.certifications) ? body.certifications : [];
        const achievements = Array.isArray(body.achievements) ? body.achievements : [];

        // PDF setup: standard A4, 40pt margins
        const doc = new PDFDocument({
            size: "A4",
            margins: { top: 40, bottom: 40, left: 40, right: 40 },
            bufferPages: true
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));

        // Colors
        const primaryColor = "#111827";   // Charcoal black
        const accentColor = "#e1034d";    // Brand crimson/pink
        const secondaryColor = "#4b5563"; // Slate gray
        const bodyColor = "#1f2937";      // Dark slate

        // Helper: Section Header
        const renderSectionHeader = (title) => {
            doc.moveDown(0.7);
            doc.fillColor(accentColor)
               .font("Helvetica-Bold")
               .fontSize(11)
               .text(title.toUpperCase(), { characterSpacing: 1 });

            // Accent underline
            const lineY = doc.y + 2;
            doc.strokeColor("#e5e7eb")
               .lineWidth(1)
               .moveTo(40, lineY)
               .lineTo(555, lineY)
               .stroke();

            doc.y = lineY + 6;
        };

        // --- 1. HEADER (Candidate Details) ---
        doc.fillColor(primaryColor)
           .font("Helvetica-Bold")
           .fontSize(22)
           .text(fullName, { align: "left" });

        // Contact bar
        const contactParts = [email, phone, location, website, linkedin, github].filter(Boolean);
        if (contactParts.length > 0) {
            doc.moveDown(0.25);
            doc.fillColor(secondaryColor)
               .font("Helvetica")
               .fontSize(9)
               .text(contactParts.join("  |  "), { align: "left" });
        }

        // --- 2. PROFESSIONAL SUMMARY ---
        if (summary) {
            renderSectionHeader("Professional Summary");
            doc.fillColor(bodyColor)
               .font("Helvetica")
               .fontSize(9.5)
               .lineGap(2)
               .text(summary, { align: "justify" });
        }

        // --- 3. TECHNICAL SKILLS ---
        if (skills.length > 0) {
            renderSectionHeader("Technical Skills");
            doc.fillColor(bodyColor)
               .font("Helvetica")
               .fontSize(9.5)
               .lineGap(2)
               .text(skills.join(" • "));
        }

        // --- 4. WORK EXPERIENCE ---
        if (experience.length > 0) {
            renderSectionHeader("Work Experience");

            experience.forEach((exp) => {
                const title = sanitize(exp.title || "Software Engineer");
                const company = sanitize(exp.company || "");
                const period = sanitize(exp.period || exp.duration || `${exp.startDate || ""} - ${exp.endDate || (exp.current ? "Present" : "")}`);
                const expLocation = sanitize(exp.location || "");

                doc.moveDown(0.4);
                // Title & Duration line
                const startY = doc.y;
                doc.fillColor(primaryColor)
                   .font("Helvetica-Bold")
                   .fontSize(10)
                   .text(title, 40, startY, { continued: false });

                if (period) {
                    doc.fillColor(secondaryColor)
                       .font("Helvetica")
                       .fontSize(9)
                       .text(period, 400, startY, { width: 155, align: "right" });
                }

                // Company & Location line
                const compLine = [company, expLocation].filter(Boolean).join(", ");
                if (compLine) {
                    doc.fillColor(secondaryColor)
                       .font("Helvetica-Oblique")
                       .fontSize(9)
                       .text(compLine, 40);
                }

                // Description or bullets
                if (exp.description) {
                    doc.moveDown(0.2);
                    doc.fillColor(bodyColor)
                       .font("Helvetica")
                       .fontSize(9)
                       .lineGap(1.5)
                       .text(sanitize(exp.description), 40, doc.y, { align: "justify" });
                }

                if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
                    doc.moveDown(0.2);
                    exp.bullets.forEach((b) => {
                        const cleanBullet = sanitize(b);
                        if (cleanBullet) {
                            doc.fillColor(bodyColor)
                               .font("Helvetica")
                               .fontSize(9)
                               .text(`•  ${cleanBullet}`, 48, doc.y, { align: "justify", lineGap: 1.5 });
                        }
                    });
                }
            });
        }

        // --- 5. PROJECTS ---
        if (projects.length > 0) {
            renderSectionHeader("Key Projects");

            projects.forEach((proj) => {
                const name = sanitize(proj.name || proj.title || "Project");
                const tech = sanitize(proj.technologies || proj.techStack || "");
                const link = sanitize(proj.link || proj.url || "");
                const desc = sanitize(proj.description || "");

                doc.moveDown(0.4);
                const pStartY = doc.y;

                doc.fillColor(primaryColor)
                   .font("Helvetica-Bold")
                   .fontSize(10)
                   .text(name, 40, pStartY, { continued: Boolean(tech) });

                if (tech) {
                    doc.fillColor(secondaryColor)
                       .font("Helvetica-Oblique")
                       .fontSize(8.5)
                       .text(`  |  ${tech}`);
                }

                if (link) {
                    doc.fillColor(accentColor)
                       .font("Helvetica")
                       .fontSize(8.5)
                       .text(link, 400, pStartY, { width: 155, align: "right" });
                }

                if (desc) {
                    doc.moveDown(0.15);
                    doc.fillColor(bodyColor)
                       .font("Helvetica")
                       .fontSize(9)
                       .text(desc, 40, doc.y, { align: "justify", lineGap: 1.5 });
                }
            });
        }

        // --- 6. EDUCATION ---
        if (education.length > 0) {
            renderSectionHeader("Education");

            education.forEach((edu) => {
                const degree = sanitize(edu.degree || "Bachelor of Science");
                const institution = sanitize(edu.institution || edu.school || "");
                const year = sanitize(edu.year || edu.graduationYear || "");
                const gpa = sanitize(edu.gpa ? `GPA: ${edu.gpa}` : "");

                doc.moveDown(0.3);
                const eStartY = doc.y;

                doc.fillColor(primaryColor)
                   .font("Helvetica-Bold")
                   .fontSize(9.5)
                   .text(degree, 40, eStartY);

                if (year) {
                    doc.fillColor(secondaryColor)
                       .font("Helvetica")
                       .fontSize(9)
                       .text(year, 400, eStartY, { width: 155, align: "right" });
                }

                const eduSub = [institution, gpa].filter(Boolean).join("  •  ");
                if (eduSub) {
                    doc.fillColor(secondaryColor)
                       .font("Helvetica")
                       .fontSize(9)
                       .text(eduSub, 40);
                }
            });
        }

        // --- 7. CERTIFICATIONS & ACHIEVEMENTS ---
        const certList = certifications.map((c) => (typeof c === "string" ? sanitize(c) : sanitize(c.name || c.title))).filter(Boolean);
        const achList = achievements.map((a) => (typeof a === "string" ? sanitize(a) : sanitize(a.title || a.name))).filter(Boolean);
        const combined = [...certList, ...achList];

        if (combined.length > 0) {
            renderSectionHeader("Certifications & Achievements");
            doc.moveDown(0.2);
            combined.forEach((item) => {
                doc.fillColor(bodyColor)
                   .font("Helvetica")
                   .fontSize(9)
                   .text(`•  ${item}`, 48, doc.y, { lineGap: 1.5 });
            });
        }

        // Finalize doc
        doc.end();

        doc.on("end", () => {
            const pdfBuffer = Buffer.concat(chunks);
            const safeName = fullName.replace(/[^a-zA-Z0-9]/g, "_");

            res.writeHead(200, {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${safeName}_Resume.pdf"`,
                "Content-Length": pdfBuffer.length
            });

            res.end(pdfBuffer);
        });
    } catch (err) {
        console.error("Error generating resume PDF:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error generating resume PDF."
        });
    }
}

module.exports = {
    generateResumePdfController
};

