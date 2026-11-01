import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useReports } from "../hooks/use.reports";
import "../styles/reports.scss";

const Reports = () => {
    const navigate = useNavigate();
    const { reports, loading, error, loadReports } = useReports();

    useEffect(() => {
        loadReports().catch(() => {});
    }, [loadReports]);

    return (
        <div className="reports-page">
            <header className="reports-header">
                <Link to="/" className="brand-link">
                    <span className="badge">AI</span>
                    <span className="title">Interview History & Reports</span>
                </Link>
                <div className="header-actions">
                    <button className="home-btn" onClick={() => navigate("/")}>
                        ← Back to Home
                    </button>
                    <button className="button primary-button" onClick={() => navigate("/interview")}>
                        Start New Interview
                    </button>
                </div>
            </header>

            <main className="reports-container">
                <div className="page-intro">
                    <div>
                        <h1>Your Interview Assessments</h1>
                        <p>Track your evaluation scores, skill gaps, and AI feedback over time.</p>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                        <h3>Loading all reports...</h3>
                    </div>
                )}

                {!loading && error && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#f87171" }}>
                        <h3>{error}</h3>
                        <button className="button primary-button" onClick={() => loadReports(true)} style={{ marginTop: "1rem" }}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && reports && reports.length === 0 && (
                    <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "#151515", borderRadius: "1rem", border: "1px dashed #282828" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                        <h2>No Interview Reports Available</h2>
                        <p style={{ color: "#9ca3af", maxWidth: "450px", margin: "0.5rem auto 1.5rem" }}>
                            You have not participated in any mock interviews yet. Launch an interview session to get started.
                        </p>
                        <button className="button primary-button" onClick={() => navigate("/interview")}>
                            Launch Mock Interview
                        </button>
                    </div>
                )}

                {!loading && !error && reports && reports.length > 0 && (
                    <div className="all-reports-grid">
                        {reports.map((report) => {
                            const title = report.jobDescription
                                ? (report.jobDescription.length > 60 ? report.jobDescription.slice(0, 60) + "..." : report.jobDescription)
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
            </main>
        </div>
    );
};

export default Reports;

