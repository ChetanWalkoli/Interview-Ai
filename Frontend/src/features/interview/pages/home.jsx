import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/use.auth";
import { useReports } from "../hooks/use.reports";
import "../styles/home.scss";

// Reusable stroke-based Lucide-inspired SVG icon components
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

const ArrowRightIcon = ({ size = 15, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </IconWrapper>
);

const BarChartIcon = ({ size = 20, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
    </IconWrapper>
);

const CodeIcon = ({ size = 20, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="m16 18 6-6-6-6" />
        <path d="m8 6-6 6 6 6" />
    </IconWrapper>
);

const MessageSquareIcon = ({ size = 20, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </IconWrapper>
);

const FileTextIcon = ({ size = 20, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
    </IconWrapper>
);

const Home = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();
    const { reports, loading: reportsLoading, error: reportsError, loadReports } = useReports();

    useEffect(() => {
        loadReports().catch(() => {});
    }, [loadReports]);

    const recentReports = reports && Array.isArray(reports) ? reports.slice(0, 4) : [];

    return (
        <div className="home-container">
            {/* Top Navigation Bar */}
            <header className="home-header">
                <div className="brand">
                    <span className="brand-title">interview-ai</span>
                </div>
                <nav className="nav-links">
                    <Link to="/" className="nav-item active">Home</Link>
                    <Link to="/interview" className="nav-item">Start Interview</Link>
                    <Link to="/reports" className="nav-item">My Reports</Link>
                    <Link to="/resume" className="nav-item">Resume PDF</Link>
                </nav>
                <div className="user-section">
                    <span className="user-greeting">Hi, {user?.username || "Candidate"}</span>
                    <button className="button logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-badge">Technical Interview Preparation</div>
                <h1 className="hero-title">
                    Structured Technical & Behavioral <span className="highlight">Interview Practice</span>
                </h1>
                <p className="hero-subtitle">
                    Upload your target job description and profile to practice role-specific technical questions, identify skill gaps, and follow a concrete day-by-day roadmap.
                </p>
                <div className="hero-actions">
                    <button 
                        className="button primary-button hero-cta" 
                        onClick={() => navigate("/interview")}
                    >
                        Start Practice Session
                    </button>
                    <button 
                        className="button secondary-button" 
                        onClick={() => navigate("/reports")}
                    >
                        View Past Reports
                    </button>
                </div>
            </section>

            {/* Recent Reports Section */}
            <section className="recent-reports-section">
                <div className="recent-header-row">
                    <h2 className="recent-title">Recent Interview Reports</h2>
                    {reports && reports.length > 0 && (
                        <Link to="/reports" className="view-all-link">
                            View All ({reports.length}) <ArrowRightIcon size={14} className="inline-arrow" />
                        </Link>
                    )}
                </div>

                {reportsLoading && (
                    <div className="reports-loading">
                        <p>Loading your latest assessment reports...</p>
                    </div>
                )}

                {!reportsLoading && reportsError && (
                    <div className="reports-error">
                        <p>{reportsError}</p>
                    </div>
                )}

                {!reportsLoading && !reportsError && recentReports.length === 0 && (
                    <div className="empty-reports-card">
                        <div className="empty-icon-box">
                            <BarChartIcon size={28} className="empty-icon-svg" />
                        </div>
                        <h3>No Interview Sessions Yet</h3>
                        <p>
                            Start your first session to practice role-specific technical questions and receive a comprehensive preparation plan.
                        </p>
                        <button
                            className="button primary-button empty-cta-btn"
                            onClick={() => navigate("/interview")}
                        >
                            Start First Session
                        </button>
                    </div>
                )}

                {!reportsLoading && !reportsError && recentReports.length > 0 && (
                    <div className="reports-grid">
                        {recentReports.map((report) => {
                            const title = report.jobDescription
                                ? (report.jobDescription.length > 55 ? report.jobDescription.slice(0, 55) + "..." : report.jobDescription)
                                : "Technical Interview Assessment";
                            const score = report.overallScore !== undefined ? report.overallScore : (report.matchScore || 75);
                            const dateStr = report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                  })
                                : "Recent";
                            const isCompleted = report.status === "completed" || (report.evaluations && report.evaluations.length > 0);

                            return (
                                <div key={report._id} className="report-card">
                                    <div>
                                        <div className="card-top">
                                            <span className={`status-badge ${isCompleted ? "completed" : "in-progress"}`}>
                                                {isCompleted ? "Completed" : "In Progress"}
                                            </span>
                                            <span className="score-pill">
                                                {score}% Score
                                            </span>
                                        </div>
                                        <h3 className="card-title">{title}</h3>
                                        <div className="card-date">Date: {dateStr}</div>
                                    </div>
                                    <button
                                        className="view-report-btn"
                                        onClick={() => navigate(`/reports/${report._id}`)}
                                    >
                                        View Full Report <ArrowRightIcon size={13} className="btn-arrow" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <h2 className="section-title">Preparation Workflow</h2>
                <p className="section-subtitle">Four structured steps to evaluate your readiness and focus study time.</p>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <h3>Target Role & Background</h3>
                        <p>Provide your target job requirements and resume or experience summary.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">02</div>
                        <h3>Requirement Alignment</h3>
                        <p>Curriculum maps essential competencies and identifies primary skill gaps.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">03</div>
                        <h3>Targeted Practice</h3>
                        <p>Answer domain-specific technical scenarios and structured behavioral questions.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">04</div>
                        <h3>Actionable Roadmap</h3>
                        <p>Receive detailed answer evaluations and a prioritized 7-day study roadmap.</p>
                    </div>
                </div>
            </section>

            {/* Platform Features Section */}
            <section className="features-section">
                <h2 className="section-title">Core Capabilities</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <CodeIcon size={20} className="feature-svg" />
                        </div>
                        <h3>Targeted Technical Scenarios</h3>
                        <p>Language-specific depth, architecture principles, and system design challenges.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <MessageSquareIcon size={20} className="feature-svg" />
                        </div>
                        <h3>STAR Behavioral Coaching</h3>
                        <p>Practice situational frameworks for project ownership, team collaboration, and leadership.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <BarChartIcon size={20} className="feature-svg" />
                        </div>
                        <h3>Objective Match Scoring</h3>
                        <p>Detailed fit metrics and categorized severity assessments for identified technical gaps.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <FileTextIcon size={20} className="feature-svg" />
                        </div>
                        <h3>Standardized Resume Export</h3>
                        <p>Export an ATS-compliant, cleanly formatted A4 resume PDF ready for applications.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <p>© {new Date().getFullYear()} interview-ai. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;