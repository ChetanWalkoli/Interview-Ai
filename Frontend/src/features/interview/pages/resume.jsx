import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { downloadResumePdf } from "../services/interview.api";
import "../styles/resume.scss";

// Reusable zero-dependency stroke-based Lucide-inspired SVG icon components
const IconWrapper = ({ children, size = 18, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        focusable="false"
    >
        {children}
    </svg>
);

const ArrowLeftIcon = ({ size = 15, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </IconWrapper>
);

const ArrowRightIcon = ({ size = 14, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </IconWrapper>
);

const DownloadIcon = ({ size = 16, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
    </IconWrapper>
);

const SparklesIcon = ({ size = 14, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </IconWrapper>
);

const PlusIcon = ({ size = 14, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <line x1="12" x2="12" y1="5" y2="19" />
        <line x1="5" x2="19" y1="12" y2="12" />
    </IconWrapper>
);

const Trash2Icon = ({ size = 13, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
    </IconWrapper>
);

const CheckCircleIcon = ({ size = 18, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
    </IconWrapper>
);

const AlertCircleIcon = ({ size = 18, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
    </IconWrapper>
);

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
                name: "interview-ai",
                technologies: "React, Node.js, Express, Gemini AI",
                link: "https://interview-ai.app",
                description: "Full-stack assessment platform generating real-time technical questions and personalized evaluation roadmaps."
            }
        ]);
        setCertifications("AWS Certified Solutions Architect, MongoDB Certified Developer");
        setErrorMsg(null);
        setSuccessMsg(null);
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
            setSuccessMsg("Resume PDF exported and downloaded successfully.");
        } catch (err) {
            setErrorMsg(err.message || "Failed to generate resume PDF. Please verify backend connection.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="resume-page">
            <header className="resume-header">
                <Link to="/" className="brand-link">
                    <span className="title">interview-ai</span>
                    <span className="session-divider">/</span>
                    <span className="session-sub">Resume Builder</span>
                </Link>
                <div className="header-actions">
                    <button className="home-btn" onClick={() => navigate("/")}>
                        <ArrowLeftIcon size={14} className="nav-icon" /> Home
                    </button>
                    <button className="button primary-button" onClick={() => navigate("/interview")}>
                        Start Session <ArrowRightIcon size={13} className="inline-arrow" />
                    </button>
                </div>
            </header>

            <main className="resume-container">
                <div className="page-intro">
                    <div>
                        <h1>Standardized Resume Builder</h1>
                        <p>Build and export a clean, ATS-compliant resume PDF from your professional credentials.</p>
                    </div>
                    <button type="button" className="prefill-btn" onClick={handlePrefillSample}>
                        <SparklesIcon size={14} className="sparkle-icon" /> Load Demo Data
                    </button>
                </div>

                {/* Notifications */}
                {errorMsg && (
                    <div className="notification-card error">
                        <AlertCircleIcon size={18} className="notif-icon" />
                        <div>
                            <strong>Notice:</strong> {errorMsg}
                        </div>
                    </div>
                )}

                {successMsg && (
                    <div className="notification-card success">
                        <CheckCircleIcon size={18} className="notif-icon" />
                        <div>
                            <strong>Success:</strong> {successMsg}
                        </div>
                    </div>
                )}

                <form className="resume-form" onSubmit={handleGeneratePdf}>
                    {/* 1. Contact Information */}
                    <div className="form-section">
                        <div className="section-header">1. Contact & Identity</div>
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
                                <label>LinkedIn / GitHub URL</label>
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
                        <div className="section-header">2. Executive Summary</div>
                        <div className="form-group">
                            <label>Professional Summary Statement</label>
                            <textarea
                                rows="3"
                                placeholder="Highlight primary technical strengths, domain expertise, and quantifiable track record..."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 3. Technical Skills */}
                    <div className="form-section">
                        <div className="section-header">3. Technical Competencies</div>
                        <div className="form-group">
                            <label>Core Skills & Technologies (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="e.g. React, Node.js, TypeScript, PostgreSQL, Docker, AWS, System Design"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 4. Work Experience */}
                    <div className="form-section">
                        <div className="section-header">4. Professional Experience</div>
                        {experience.map((exp, idx) => (
                            <div key={idx} className="item-card">
                                <div className="item-header">
                                    <span className="item-index">Position #{idx + 1}</span>
                                    {experience.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeExperience(idx)}
                                        >
                                            <Trash2Icon size={12} className="remove-icon" /> Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Role Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Senior Full-Stack Engineer"
                                            value={exp.title}
                                            onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Company / Organization</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CloudScale Technologies"
                                            value={exp.company}
                                            onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Employment Period</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2022 - Present"
                                        value={exp.period}
                                        onChange={(e) => handleExperienceChange(idx, "period", e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Responsibilities & Technical Impact</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Key architectural contributions, metrics, and technologies utilized..."
                                        value={exp.description}
                                        onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={addExperience}>
                            <PlusIcon size={14} className="plus-icon" /> Add Position
                        </button>
                    </div>

                    {/* 5. Key Projects */}
                    <div className="form-section">
                        <div className="section-header">5. Key Projects</div>
                        {projects.map((proj, idx) => (
                            <div key={idx} className="item-card">
                                <div className="item-header">
                                    <span className="item-index">Project #{idx + 1}</span>
                                    {projects.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeProject(idx)}
                                        >
                                            <Trash2Icon size={12} className="remove-icon" /> Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Project Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Distributed Cache Proxy"
                                            value={proj.name}
                                            onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Technologies Used</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Go, Redis, Docker, gRPC"
                                            value={proj.technologies}
                                            onChange={(e) => handleProjectChange(idx, "technologies", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Project Link / Repository (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. github.com/username/project"
                                        value={proj.link}
                                        onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Architectural Design & Impact</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Problem addressed, architectural decisions, and performance outcomes..."
                                        value={proj.description}
                                        onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={addProject}>
                            <PlusIcon size={14} className="plus-icon" /> Add Project
                        </button>
                    </div>

                    {/* 6. Education */}
                    <div className="form-section">
                        <div className="section-header">6. Education & Academic Background</div>
                        {education.map((edu, idx) => (
                            <div key={idx} className="item-card">
                                <div className="item-header">
                                    <span className="item-index">Degree #{idx + 1}</span>
                                    {education.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeEducation(idx)}
                                        >
                                            <Trash2Icon size={12} className="remove-icon" /> Remove
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
                                        <label>University / Institution</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. University of California, Berkeley"
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
                                        <label>GPA / Honors (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 3.8 / 4.0"
                                            value={edu.gpa}
                                            onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={addEducation}>
                            <PlusIcon size={14} className="plus-icon" /> Add Education
                        </button>
                    </div>

                    {/* 7. Certifications */}
                    <div className="form-section">
                        <div className="section-header">7. Certifications & Credentials</div>
                        <div className="form-group">
                            <label>Certificates & Licenses (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="e.g. AWS Certified Solutions Architect, Certified Kubernetes Administrator"
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
                            {generating ? (
                                "Exporting PDF Document..."
                            ) : (
                                <>
                                    <DownloadIcon size={16} className="download-icon" /> Export Resume PDF
                                </>
                            )}
                        </button>
                        <span className="hint-text">
                            Generates a standardized A4 PDF with clean selectable typography and ATS-optimized structure.
                        </span>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Resume;