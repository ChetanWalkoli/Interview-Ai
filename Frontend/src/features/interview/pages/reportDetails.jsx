import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useReports } from "../hooks/use.reports";
import "../styles/reportDetails.scss";

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { selectedReport, selectedLoading, error, loadReportById } = useReports();

    useEffect(() => {
        if (id) {
            loadReportById(id).catch(() => {});
        }
    }, [id, loadReportById]);

    const report = selectedReport;

    return (
        <div className="report-details-page">
            <header className="report-header">
                <Link to="/" className="brand-link">
                    <span className="badge">AI</span>
                    <span className="title">Interview Evaluation Report</span>
                </Link>
                <div className="header-actions">
                    <button className="back-btn" onClick={() => navigate("/reports")}>
                        ← Back to Reports
                    </button>
                    <button className="button primary-button" onClick={() => navigate("/interview")}>
                        New Interview
                    </button>
                </div>
            </header>

            <main className="report-container">
                {selectedLoading && (
                    <div className="status-card">
                        <div className="spinner"></div>
                        <h3>Loading Interview Evaluation Report...</h3>
                        <p>Retrieving persisted assessment data from backend.</p>
                    </div>
                )}

                {!selectedLoading && error && (
                    <div className="status-card error">
                        <h3>Error Loading Report</h3>
                        <p>{error}</p>
                        <button className="button primary-button" onClick={() => loadReportById(id)}>
                            Retry
                        </button>
                    </div>
                )}

                {!selectedLoading && !error && report && (
                    <>
                        {/* Summary Hero */}
                        <div className="summary-card">
                            <div className="summary-info">
                                <div className="report-badge">Assessment Overview</div>
                                <h1>{report.jobDescription ? report.jobDescription.slice(0, 70) + (report.jobDescription.length > 70 ? "..." : "") : "Software Engineer Interview"}</h1>
                                <div className="meta-dates">
                                    Conducted on: {report.createdAt ? new Date(report.createdAt).toLocaleDateString(undefined, { dateStyle: "long" }) : "Recent"}
                                    {report.status && ` • Status: ${report.status}`}
                                </div>
                            </div>
                            <div className="score-circle">
                                <div className="score-val">
                                    {report.overallScore !== undefined ? report.overallScore : (report.matchScore || 75)}%
                                </div>
                                <div className="score-lbl">Performance Score</div>
                            </div>
                        </div>

                        {/* Insights Grid: Strengths, Improvements, Recommendations */}
                        <div className="insights-grid">
                            <div className="insight-card strengths">
                                <h3>✅ Key Strengths</h3>
                                <ul>
                                    {report.strengths && report.strengths.length > 0 ? (
                                        report.strengths.map((str, idx) => <li key={idx}>{str}</li>)
                                    ) : (
                                        <li>Strong domain knowledge and technical reasoning</li>
                                    )}
                                </ul>
                            </div>

                            <div className="insight-card improvements">
                                <h3>⚠️ Areas for Improvement</h3>
                                <ul>
                                    {report.areasForImprovement && report.areasForImprovement.length > 0 ? (
                                        report.areasForImprovement.map((imp, idx) => <li key={idx}>{imp}</li>)
                                    ) : (
                                        <li>Elaborate on production incident management and edge cases</li>
                                    )}
                                </ul>
                            </div>

                            <div className="insight-card recommendations">
                                <h3>💡 Actionable Advice</h3>
                                <ul>
                                    {report.recommendations && report.recommendations.length > 0 ? (
                                        report.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)
                                    ) : (
                                        <li>Structure behavioral responses with the STAR framework</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Question by Question Evaluation */}
                        {report.evaluations && report.evaluations.length > 0 && (
                            <div className="section-card">
                                <h2>Detailed Answer Evaluation & Feedback</h2>
                                <div className="qa-list">
                                    {report.evaluations.map((ev, idx) => (
                                        <div key={idx} className="qa-item">
                                            <div className="qa-header">
                                                <div className="q-text">
                                                    Q{idx + 1}: {ev.question}
                                                </div>
                                                <div className="q-score">
                                                    Score: {ev.score !== undefined ? `${ev.score}/10` : "Evaluated"}
                                                </div>
                                            </div>
                                            <div className="user-ans-box">
                                                <div className="ans-lbl">Your Submitted Answer:</div>
                                                <div>{ev.answer || "No answer recorded."}</div>
                                            </div>
                                            {ev.feedback && (
                                                <div className="feedback-box">
                                                    <div className="fb-lbl">AI Interviewer Feedback:</div>
                                                    <div>{ev.feedback}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 7-Day Preparation Plan */}
                        {report.preparationPlan && report.preparationPlan.length > 0 && (
                            <div className="section-card">
                                <h2>Tailored 7-Day Preparation Roadmap</h2>
                                <div className="prep-plan-grid">
                                    {report.preparationPlan.map((plan, idx) => (
                                        <div key={idx} className="plan-day-card">
                                            <div className="day-num">Day {plan.day || idx + 1}</div>
                                            <div className="day-focus">{plan.focus || "Core Practice"}</div>
                                            <div className="day-task">{plan.task}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default ReportDetails;

