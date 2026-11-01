import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/use.auth";
import { useReports } from "../hooks/use.reports";
import "../styles/home.scss";

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
                    <span className="brand-badge">AI</span>
                    <span className="brand-title">InterviewPro</span>
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
                <div className="hero-badge">Powered by Gemini 3.6 AI</div>
                <h1 className="hero-title">
                    Master Technical & Behavioral Interviews with <span className="highlight">AI Precision</span>
                </h1>
                <p className="hero-subtitle">
                    Upload your resume and target job description. Our advanced AI analyzes your profile, identifies skill gaps, simulates realistic interview questions, and provides an actionable 7-day preparation roadmap.
                </p>
                <div className="hero-actions">
                    <button 
                        className="button primary-button hero-cta" 
                        onClick={() => navigate("/interview")}
                    >
                        Start Mock Interview
                    </button>
                    <button 
                        className="button secondary-button" 
                        onClick={() => navigate("/reports")}
                    >
                        View Past Reports
                    </button>
                </div>
            </section>

            {/* Recent Reports Section (PHASE 6) */}
            <section className="recent-reports-section">
                <div className="recent-header-row">
                    <h2 className="recent-title">Recent Interview Reports</h2>
                    {reports && reports.length > 0 && (
                        <Link to="/reports" className="view-all-link">
                            View All ({reports.length}) →
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
                        <div className="empty-icon">📊</div>
                        <h3>No Interview Reports Yet</h3>
                        <p>
                            You haven't conducted any mock interviews yet. Start your first session to receive in-depth AI evaluations and targeted preparation plans!
                        </p>
                        <button
                            className="button primary-button empty-cta-btn"
                            onClick={() => navigate("/interview")}
                        >
                            Launch First Interview
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
                                        View Full Report →
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle">Four streamlined steps to accelerate your interview preparation.</p>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <h3>Upload Profile</h3>
                        <p>Provide your resume PDF, self description, and the target role or job posting.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">02</div>
                        <h3>AI Skill Gap Analysis</h3>
                        <p>Our model evaluates alignment between your experience and requirements with a match score.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">03</div>
                        <h3>Simulated Interview</h3>
                        <p>Practice with targeted technical questions and behavioral scenarios with expert answers.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">04</div>
                        <h3>Actionable Roadmap</h3>
                        <p>Receive day-by-day practice tasks, study resources, and targeted feedback.</p>
                    </div>
                </div>
            </section>

            {/* Platform Features Section */}
            <section className="features-section">
                <h2 className="section-title">Platform Capabilities</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Targeted Technical Questions</h3>
                        <p>Tailored coding, architectural, and domain-specific questions probing your real skill depth.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Behavioral & STAR Coaching</h3>
                        <p>Learn how to present past projects, resolve team friction, and convey leadership effectively.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Detailed Match Scores</h3>
                        <p>Quantify your job fit percentage and uncover critical severity levels for missing skills.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📄</div>
                        <h3>Resume PDF Generator</h3>
                        <p>Export a polished, ATS-optimized professional resume PDF ready for job applications.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <p>© {new Date().getFullYear()} Interview AI Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
