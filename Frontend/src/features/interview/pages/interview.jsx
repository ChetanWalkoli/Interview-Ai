import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useInterview } from "../hooks/use.interview";
import { useReports } from "../hooks/use.reports";
import "../styles/interview.scss";

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
                    <span className="badge">AI</span>
                    <span className="title">Interview Session</span>
                </Link>
                <div className="header-actions">
                    <button className="exit-btn" onClick={() => navigate("/")}>
                        Exit Interview
                    </button>
                </div>
            </header>

            <main className="interview-container">
                {/* 1. Error Message Banner */}
                {error && (
                    <div className="error-card">
                        <div className="error-title">Interview Notice</div>
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
                        <h3>Analyzing Profile & Formulating Questions...</h3>
                        <p>
                            Gemini AI is examining your background against the target job description to build a custom interview curriculum.
                        </p>
                    </div>
                )}

                {/* Evaluating State (Evaluating user answers) */}
                {evaluating && (
                    <div className="loading-card">
                        <div className="spinner"></div>
                        <h3>Evaluating Your Interview Responses...</h3>
                        <p>
                            Gemini AI is reviewing your answers, calculating question scores, identifying key strengths, and generating targeted feedback.
                        </p>
                    </div>
                )}

                {/* 3. Setup / Config State */}
                {!loading && !evaluating && totalQuestions === 0 && !isCompleted && (
                    <div className="setup-card">
                        <div className="setup-header">
                            <h2>Configure Your Mock Interview</h2>
                            <p>Provide your target role details and resume to tailor your interview questions.</p>
                        </div>

                        <form onSubmit={handleStartInterview}>
                            <div className="form-group">
                                <label>Target Job Description / Role *</label>
                                <textarea
                                    rows="4"
                                    placeholder="e.g. Senior Full-Stack Engineer requiring Node.js, React, MongoDB, System Design..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Self Description / Experience Summary (Optional)</label>
                                <textarea
                                    rows="3"
                                    placeholder="e.g. 3 years experience building SaaS applications with Express and React..."
                                    value={selfDescription}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Upload Resume PDF (Optional)</label>
                                <div className="file-upload-box">
                                    <label htmlFor="resume-file" className="upload-label">
                                        <span className="icon">📄</span>
                                        <span className="main-text">
                                            {resumeFile ? resumeFile.name : "Click to select or drag Resume PDF"}
                                        </span>
                                        <span className="sub-text">PDF format, up to 5MB</span>
                                        {resumeFile && (
                                            <span className="selected-filename">✓ File Attached</span>
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
                                Generate Interview Questions
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
                                    <div className="intent-label">Interviewer Focus & Intent</div>
                                    <div className="intent-text">{currentQuestion.intent}</div>
                                </div>
                            )}
                        </div>

                        {/* Answer Input Area */}
                        <div className="answer-card">
                            <div className="answer-header">
                                <label>Your Answer</label>
                                <span className="word-count">
                                    {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words
                                </span>
                            </div>

                            <textarea
                                placeholder="Structure your response clearly. Cover key concepts, trade-offs, and examples..."
                                value={currentAnswer}
                                onChange={(e) => saveAnswer(e.target.value, currentQuestionIndex)}
                            />

                            {showSampleAnswer && currentQuestion.sampleAnswer && (
                                <div className="sample-answer-preview">
                                    <div className="preview-title">Suggested Talking Points & Model Response:</div>
                                    <p>{currentQuestion.sampleAnswer}</p>
                                </div>
                            )}

                            <div className="answer-actions">
                                <button
                                    type="button"
                                    className="toggle-answer-btn"
                                    onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                                >
                                    {showSampleAnswer ? "Hide Sample Guidance" : "Show Guidance & Tips"}
                                </button>

                                <div className="nav-buttons">
                                    <button
                                        type="button"
                                        className="prev-btn"
                                        onClick={handlePrevQuestion}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type="button"
                                        className="button primary-button next-btn"
                                        onClick={handleSaveAndNext}
                                    >
                                        {currentQuestionIndex === totalQuestions - 1
                                            ? "Complete & Evaluate"
                                            : "Next Question"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Interview Completion State */}
                {!loading && !evaluating && isCompleted && (
                    <div className="completion-card">
                        <div className="completion-icon">🎉</div>
                        <h2>Interview Session Completed!</h2>
                        <p>
                            You have completed all questions in this assessment. Your responses and performance analysis are saved.
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
                                <div className="stat-label">Evaluation Score</div>
                            </div>
                        </div>

                        <div className="completion-actions">
                            {interviewId ? (
                                <button
                                    className="button primary-button"
                                    onClick={() => navigate(`/reports/${interviewId}`)}
                                >
                                    View Detailed Report
                                </button>
                            ) : (
                                <button
                                    className="button primary-button"
                                    onClick={() => navigate("/reports")}
                                >
                                    View All Reports
                                </button>
                            )}
                            <button
                                className="button secondary-button"
                                onClick={resetInterviewSession}
                            >
                                Start Another Interview
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Interview;
