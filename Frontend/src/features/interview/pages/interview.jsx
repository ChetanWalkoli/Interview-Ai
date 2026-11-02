import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useInterview } from "../hooks/use.interview";
import { useReports } from "../hooks/use.reports";
import "../styles/interview.scss";

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

const ArrowLeftIcon = ({ size = 16, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </IconWrapper>
);

const ArrowRightIcon = ({ size = 15, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </IconWrapper>
);

const FileUpIcon = ({ size = 22, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M12 12v6" />
        <path d="m15 15-3-3-3 3" />
    </IconWrapper>
);

const CheckCircleIcon = ({ size = 18, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
    </IconWrapper>
);

const HelpCircleIcon = ({ size = 15, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
    </IconWrapper>
);

const AlertCircleIcon = ({ size = 18, className = "" }) => (
    <IconWrapper size={size} className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
    </IconWrapper>
);

const Interview = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get("id");

    const {
        currentInterview,
        interviewId,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        progressPercent,
        currentAnswer,
        answeredCount,
        loading,
        evaluating,
        error,
        isCompleted,
        startNewInterview,
        fetchExistingInterview,
        triggerRehydrate,
        submitAnswersForEvaluation,
        saveAnswer,
        moveToNextQuestion,
        moveToPreviousQuestion,
        resetInterviewSession
    } = useInterview();

    const { refreshReports } = useReports();

    // Rehydration from query parameter or stored active session on mount
    useEffect(() => {
        if (queryId) {
            fetchExistingInterview(queryId).catch(() => {});
        } else {
            triggerRehydrate().catch(() => {});
        }
    }, [queryId, fetchExistingInterview, triggerRehydrate]);

    // Local form state for interview configuration
    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [showSampleAnswer, setShowSampleAnswer] = useState(false);

    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    // Start interview via custom hook
    const handleStartInterview = async (e) => {
        if (e) e.preventDefault();
        try {
            await startNewInterview({
                jobDescription,
                selfDescription,
                resumeFile
            });
            refreshReports().catch(() => {});
        } catch {
            // Error managed by useInterview hook
        }
    };

    // Save answer and move forward or complete & evaluate
    const handleSaveAndNext = async () => {
        setShowSampleAnswer(false);
        if (currentQuestionIndex === totalQuestions - 1) {
            try {
                await submitAnswersForEvaluation();
                refreshReports().catch(() => {});
            } catch {
                // Handled in hook
            }
        } else {
            moveToNextQuestion();
        }
    };

    const handlePrevQuestion = () => {
        setShowSampleAnswer(false);
        moveToPreviousQuestion();
    };

    return (
        <div className="interview-page">
            {/* Top Navigation */}
            <header className="interview-header">
                <Link to="/" className="brand-link">
                    <span className="title">interview-ai</span>
                    <span className="session-divider">/</span>
                    <span className="session-sub">Practice Session</span>
                </Link>
                <div className="header-actions">
                    <button className="exit-btn" onClick={() => navigate("/")}>
                        <ArrowLeftIcon size={14} className="exit-icon" /> Exit Session
                    </button>
                </div>
            </header>

            <main className="interview-container">
                {/* 1. Error Message Banner */}
                {error && (
                    <div className="error-card">
                        <div className="error-header">
                            <AlertCircleIcon size={18} className="error-icon" />
                            <div className="error-title">Interview Session Notice</div>
                        </div>
                        <p className="error-message">{error}</p>
                        <button className="retry-btn" onClick={handleStartInterview}>
                            Retry
                        </button>
                    </div>
                )}

                {/* 2. Loading State (Generating questions) */}
                {loading && (
                    <div className="loading-card">
                        <div className="spinner"></div>
                        <h3>Formulating Interview Scenarios...</h3>
                        <p>
                            Analyzing role requirements and tailoring technical and behavioral questions to your background.
                        </p>
                    </div>
                )}

                {/* Evaluating State (Evaluating user answers) */}
                {evaluating && (
                    <div className="loading-card">
                        <div className="spinner"></div>
                        <h3>Evaluating Responses...</h3>
                        <p>
                            Reviewing answers against domain benchmarks, calculating question scores, and preparing actionable feedback.
                        </p>
                    </div>
                )}

                {/* 3. Setup / Config State */}
                {!loading && !evaluating && totalQuestions === 0 && !isCompleted && (
                    <div className="setup-card">
                        <div className="setup-header">
                            <h2>Session Configuration</h2>
                            <p>Provide target role requirements and your background to calibrate practice questions.</p>
                        </div>

                        <form onSubmit={handleStartInterview}>
                            <div className="form-group">
                                <label>Target Job Description / Role Requirements <span className="req">*</span></label>
                                <textarea
                                    rows="4"
                                    placeholder="e.g. Senior Full-Stack Engineer requiring Node.js, React, MongoDB, System Design, and REST APIs..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Candidate Background / Experience Summary (Optional)</label>
                                <textarea
                                    rows="3"
                                    placeholder="e.g. 3 years experience building full-stack applications with Express and React. Led team migration to TypeScript..."
                                    value={selfDescription}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Resume Document (Optional)</label>
                                <div className="file-upload-box">
                                    <label htmlFor="resume-file" className="upload-label">
                                        <div className="upload-icon-box">
                                            <FileUpIcon size={22} className="upload-svg" />
                                        </div>
                                        <span className="main-text">
                                            {resumeFile ? resumeFile.name : "Select or drag Resume PDF"}
                                        </span>
                                        <span className="sub-text">PDF format, up to 5MB</span>
                                        {resumeFile && (
                                            <span className="selected-filename">
                                                <CheckCircleIcon size={14} className="check-svg" /> File Attached
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        id="resume-file"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="button primary-button start-btn">
                                Generate Practice Questions
                            </button>
                        </form>
                    </div>
                )}

                {/* 4. Active Question & Answer Interface */}
                {!loading && !evaluating && totalQuestions > 0 && !isCompleted && currentQuestion && (
                    <div className="active-interview-wrapper">
                        {/* Progress bar and counter */}
                        <div className="progress-section">
                            <div className="progress-meta">
                                <span className="question-count">
                                    Question {currentQuestionIndex + 1} of {totalQuestions}
                                </span>
                                <span className={`category-badge ${currentQuestion.category.toLowerCase()}`}>
                                    {currentQuestion.category} Question
                                </span>
                            </div>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Question display */}
                        <div className="question-card">
                            <div className="question-text">{currentQuestion.question}</div>
                            {currentQuestion.intent && (
                                <div className="intent-box">
                                    <div className="intent-label">Assessment Focus</div>
                                    <div className="intent-text">{currentQuestion.intent}</div>
                                </div>
                            )}
                        </div>

                        {/* Answer Input Area */}
                        <div className="answer-card">
                            <div className="answer-header">
                                <label>Your Response</label>
                                <span className="word-count">
                                    {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words
                                </span>
                            </div>

                            <textarea
                                placeholder="Structure your response with clear trade-offs, technical principles, and concrete examples..."
                                value={currentAnswer}
                                onChange={(e) => saveAnswer(e.target.value, currentQuestionIndex)}
                            />

                            {showSampleAnswer && currentQuestion.sampleAnswer && (
                                <div className="sample-answer-preview">
                                    <div className="preview-title">Suggested Talking Points & Model Approach:</div>
                                    <p>{currentQuestion.sampleAnswer}</p>
                                </div>
                            )}

                            <div className="answer-actions">
                                <button
                                    type="button"
                                    className="toggle-answer-btn"
                                    onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                                >
                                    <HelpCircleIcon size={14} className="guidance-icon" />
                                    {showSampleAnswer ? "Hide Suggested Approach" : "Show Suggested Approach"}
                                </button>

                                <div className="nav-buttons">
                                    <button
                                        type="button"
                                        className="prev-btn"
                                        onClick={handlePrevQuestion}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        <ArrowLeftIcon size={14} className="inline-arrow" /> Previous
                                    </button>
                                    <button
                                        type="button"
                                        className="button primary-button next-btn"
                                        onClick={handleSaveAndNext}
                                    >
                                        {currentQuestionIndex === totalQuestions - 1 ? (
                                            <>Complete & Evaluate</>
                                        ) : (
                                            <>Next Question <ArrowRightIcon size={14} className="inline-arrow" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Interview Completion State */}
                {!loading && !evaluating && isCompleted && (
                    <div className="completion-card">
                        <div className="completion-icon-box">
                            <CheckCircleIcon size={40} className="completion-check" />
                        </div>
                        <h2>Assessment Completed</h2>
                        <p>
                            All questions have been answered and evaluated. Your performance report and customized 7-day preparation roadmap are ready.
                        </p>

                        <div className="summary-stats">
                            <div className="stat-box">
                                <div className="stat-value">{totalQuestions}</div>
                                <div className="stat-label">Total Questions</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">{answeredCount}</div>
                                <div className="stat-label">Answers Provided</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value">
                                    {currentInterview?.overallScore !== undefined
                                        ? `${currentInterview.overallScore}%`
                                        : (currentInterview?.matchScore !== undefined ? `${currentInterview.matchScore}%` : "85%")}
                                </div>
                                <div className="stat-label">Performance Score</div>
                            </div>
                        </div>

                        <div className="completion-actions">
                            {interviewId ? (
                                <button
                                    className="button primary-button"
                                    onClick={() => navigate(`/reports/${interviewId}`)}
                                >
                                    View Assessment Report <ArrowRightIcon size={14} className="inline-arrow" />
                                </button>
                            ) : (
                                <button
                                    className="button primary-button"
                                    onClick={() => navigate("/reports")}
                                >
                                    View All Reports <ArrowRightIcon size={14} className="inline-arrow" />
                                </button>
                            )}
                            <button
                                className="button secondary-button"
                                onClick={resetInterviewSession}
                            >
                                Start New Session
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Interview;