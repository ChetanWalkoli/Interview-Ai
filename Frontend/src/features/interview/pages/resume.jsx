import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { downloadResumePdf } from "../services/interview.api";
import "../styles/resume.scss";

const Resume = () => {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [website, setWebsite] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [summary, setSummary] = useState("");
    const [skills, setSkills] = useState("");

    const [experience, setExperience] = useState([
        { title: "", company: "", period: "", description: "" }
    ]);

    const [education, setEducation] = useState([
        { degree: "", institution: "", year: "", gpa: "" }
    ]);

    const [projects, setProjects] = useState([
        { name: "", technologies: "", link: "", description: "" }
    ]);

    const [certifications, setCertifications] = useState("");

    // State for UI feedback
    const [generating, setGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Prefill sample data for fast testing
    const handlePrefillSample = () => {
        setFullName("Alex Johnson");
        setEmail("alex.johnson@example.com");
        setPhone("+1 (555) 234-5678");
        setLocation("San Francisco, CA");
        setWebsite("https://alexjohnson.dev");
        setLinkedin("linkedin.com/in/alexjohnson");
        setGithub("github.com/alexjohnson");
        setSummary("High-impact Full-Stack Software Engineer with 5+ years of experience designing scalable microservices, REST APIs, and responsive React web applications. Proven track record improving system latency by 35% and mentoring junior developers.");
        setSkills("JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, GraphQL, Git, CI/CD");
        setExperience([
            {
                title: "Senior Full-Stack Engineer",
                company: "CloudScale Technologies",
                period: "2022 - Present",
                description: "Architected distributed Node.js microservices handling 2M+ daily requests. Reduced p99 API latency by 30% through Redis caching."
            },
            {
                title: "Software Engineer",
                company: "NexGen Solutions",
                period: "2019 - 2022",
                description: "Developed modern client features with React and Redux. Collaborated with product designers to implement responsive accessibility standards."
            }
        ]);
        setEducation([
            {
                degree: "B.S. in Computer Science",
                institution: "University of California, Berkeley",
                year: "2019",
                gpa: "3.8 / 4.0"
            }
        ]);
        setProjects([
            {
                name: "AI Interview Coach",
                technologies: "React, Node.js, Express, Gemini AI",
                link: "https://interview-ai.app",
                description: "Full-stack AI assessment tool generating real-time technical questions and personalized evaluation roadmaps."
            }
        ]);
        setCertifications("AWS Certified Solutions Architect, MongoDB Certified Developer");
        setErrorMsg(null);
    };

    // Experience item helpers
    const handleExperienceChange = (index, field, value) => {
        const updated = [...experience];
        updated[index][field] = value;
        setExperience(updated);
    };

    const addExperience = () => {
        setExperience([...experience, { title: "", company: "", period: "", description: "" }]);
    };

    const removeExperience = (index) => {
        if (experience.length > 1) {
            setExperience(experience.filter((_, i) => i !== index));
        }
    };

    // Education item helpers
    const handleEducationChange = (index, field, value) => {
        const updated = [...education];
        updated[index][field] = value;
        setEducation(updated);
    };

    const addEducation = () => {
        setEducation([...education, { degree: "", institution: "", year: "", gpa: "" }]);
    };

    const removeEducation = (index) => {
        if (education.length > 1) {
            setEducation(education.filter((_, i) => i !== index));
        }
    };

    // Projects item helpers
    const handleProjectChange = (index, field, value) => {
        const updated = [...projects];
        updated[index][field] = value;
        setProjects(updated);
    };

    const addProject = () => {
        setProjects([...projects, { name: "", technologies: "", link: "", description: "" }]);
    };

    const removeProject = (index) => {
        if (projects.length > 1) {
            setProjects(projects.filter((_, i) => i !== index));
        }
    };

    // Generate & Download PDF
    const handleGeneratePdf = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        // Validation
        if (!fullName.trim()) {
            setErrorMsg("Please provide your full name.");
            return;
        }

        if (!email.trim() || !email.includes("@")) {
            setErrorMsg("Please provide a valid email address.");
            return;
        }

        setGenerating(true);

        const payload = {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            location: location.trim(),
            website: website.trim(),
            linkedin: linkedin.trim(),
            github: github.trim(),
            summary: summary.trim(),
            skills: skills.trim(),
            experience: experience.filter((exp) => exp.title || exp.company),
            education: education.filter((edu) => edu.degree || edu.institution),
            projects: projects.filter((p) => p.name),
            certifications: certifications.split(",").map((c) => c.trim()).filter(Boolean)
        };

        try {
            await downloadResumePdf(payload);
            setSuccessMsg("Resume PDF generated and downloaded successfully!");
        } catch (err) {
            setErrorMsg(err.message || "Failed to generate resume PDF. Please check server connection.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="resume-page">
            <header className="resume-header">
                <Link to="/" className="brand-link">
                    <span className="badge">AI</span>
                    <span className="title">Professional Resume Builder</span>
                </Link>
                <div className="header-actions">
                    <button className="home-btn" onClick={() => navigate("/")}>
                        ← Back to Home
                    </button>
                    <button className="button primary-button" onClick={() => navigate("/interview")}>
                        Start Interview
                    </button>
                </div>
            </header>

            <main className="resume-container">
                <div className="page-intro">
                    <div>
                        <h1>Generate ATS-Optimized Resume PDF</h1>
                        <p>Fill out your credentials below to generate a cleanly formatted, selectable A4 resume PDF.</p>
                    </div>
                    <button type="button" className="prefill-btn" onClick={handlePrefillSample}>
                        ⚡ Prefill Sample Data
                    </button>
                </div>

                {/* Notifications */}
                {errorMsg && (
                    <div className="notification-card error">
                        <strong>Error:</strong> {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="notification-card success">
                        <strong>Success:</strong> {successMsg}
                    </div>
                )}

                <form className="resume-form" onSubmit={handleGeneratePdf}>
                    {/* 1. Contact Information */}
                    <div className="form-section">
                        <div className="section-header">1. Contact & Personal Details</div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Full Name <span className="req">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Alex Johnson"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address <span className="req">*</span></label>
                                <input
                                    type="email"
                                    placeholder="e.g. alex@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. +1 (555) 019-2834"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. San Francisco, CA"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label>Portfolio / Website</label>
                                <input
                                    type="text"
                                    placeholder="e.g. https://alexjohnson.dev"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>LinkedIn / GitHub</label>
                                <input
                                    type="text"
                                    placeholder="e.g. linkedin.com/in/alexjohnson"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Professional Summary */}
                    <div className="form-section">
                        <div className="section-header">2. Professional Summary</div>
                        <div className="form-group">
                            <label>Summary Statement</label>
                            <textarea
                                rows="3"
                                placeholder="Highlight your core experience, key accomplishments, and main domain focus..."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 3. Technical Skills */}
                    <div className="form-section">
                        <div className="section-header">3. Technical Skills</div>
                        <div className="form-group">
                            <label>Skills & Technologies (comma separated)</label>
                            <input
                                type="text"
                                placeholder="e.g. React, Node.js, TypeScript, PostgreSQL, Docker, AWS"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 4. Work Experience */}
                    <div className="form-section">
                        <div className="section-header">4. Work Experience</div>
                        {experience.map((exp, idx) => (
                            <div key={idx} className="item-card">
                                <div className="item-header">
                                    <span>Position #{idx + 1}</span>
                                    {experience.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeExperience(idx)}
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Software Engineer"
                                            value={exp.title}
                                            onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Company / Organization</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. TechCorp"
                                            value={exp.company}
                                            onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Duration / Period</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2021 - Present"
                                        value={exp.period}
                                        onChange={(e) => handleExperienceChange(idx, "period", e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Responsibilities & Impact</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Key accomplishments, technologies utilized, and quantifiable results..."
                                        value={exp.description}
                                        onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={addExperience}>
                            + Add Another Position
                        </button>
                    </div>

                    {/* 5. Key Projects */}
                    <div className="form-section">
                        <div className="section-header">5. Key Projects</div>
                        {projects.map((proj, idx) => (
                            <div key={idx} className="item-card">
                                <div className="item-header">
                                    <span>Project #{idx + 1}</span>
                                    {projects.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeProject(idx)}
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Project Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Microservices Platform"
                                            value={proj.name}
                                            onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Technologies Used</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. React, Express, Redis"
                                            value={proj.technologies}
                                            onChange={(e) => handleProjectChange(idx, "technologies", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Problem solved, architectural design, and impact..."
                                        value={proj.description}
                                        onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={addProject}>
                            + Add Another Project
                        </button>
                    </div>

                    {/* 6. Education */}
                    <div className="form-section">
                        <div className="section-header">6. Education</div>
                        {education.map((edu, idx) => (
                            <div key={idx} className="item-card">
                                <div className="item-header">
                                    <span>Degree #{idx + 1}</span>
                                    {education.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeEducation(idx)}
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Degree / Major</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. B.S. in Computer Science"
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Institution / University</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Stanford University"
                                            value={edu.institution}
                                            onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Graduation Year</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 2020"
                                            value={edu.year}
                                            onChange={(e) => handleEducationChange(idx, "year", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>GPA (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 3.9 / 4.0"
                                            value={edu.gpa}
                                            onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={addEducation}>
                            + Add Education
                        </button>
                    </div>

                    {/* 7. Certifications */}
                    <div className="form-section">
                        <div className="section-header">7. Certifications & Achievements</div>
                        <div className="form-group">
                            <label>Certificates / Honors (comma separated)</label>
                            <input
                                type="text"
                                placeholder="e.g. AWS Certified Developer, Certified Kubernetes Administrator"
                                value={certifications}
                                onChange={(e) => setCertifications(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="submit-bar">
                        <button
                            type="submit"
                            className="button primary-button download-btn"
                            disabled={generating}
                        >
                            {generating ? "Generating Professional PDF..." : "📄 Download Resume PDF"}
                        </button>
                        <span className="hint-text">
                            Generates a standard A4 PDF formatted with clean selectable typography.
                        </span>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Resume;

