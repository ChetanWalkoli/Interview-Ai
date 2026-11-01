import { useState, useCallback } from "react";
import { InterviewContext } from "./interview.context.def";
import {
    generateInterview,
    getInterviewById,
    getAllInterviewReports,
    evaluateInterview
} from "./services/interview.api";

export { InterviewContext };

const SESSION_STORAGE_KEY = "interview_active_id";

export const InterviewProvider = ({ children }) => {
    // Core state
    const [currentInterview, setCurrentInterview] = useState(null);
    const [interviewId, setInterviewId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [config, setConfig] = useState({
        jobDescription: "",
        selfDescription: "",
        resumeFile: null,
        resume: ""
    });
    const [loading, setLoading] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [allReports, setAllReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    // 1. Generate / Start new interview
    const startInterview = useCallback(async (customConfig) => {
        const interviewConfig = customConfig || config;
        setLoading(true);
        setError(null);

        try {
            const data = await generateInterview(interviewConfig);
            setCurrentInterview(data.interviewReport);
            setInterviewId(data.interviewId);
            setQuestions(data.questions || []);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setIsCompleted(false);
            if (customConfig) setConfig(customConfig);

            // Store in sessionStorage to enable seamless rehydration and avoid duplicate generation on refresh
            if (data.interviewId) {
                try {
                    sessionStorage.setItem(SESSION_STORAGE_KEY, data.interviewId);
                } catch {
                    // Safe fallback if sessionStorage is restricted
                }
            }
            return data;
        } catch (err) {
            setError(err.message || "Failed to start interview");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [config]);

    // 2. Load existing interview by ID (Rehydration)
    const loadInterview = useCallback(async (id) => {
        if (!id) return null;
        setLoading(true);
        setError(null);

        try {
            const data = await getInterviewById(id);
            const report = data.interviewReport;
            setCurrentInterview(report);
            setInterviewId(data.interviewId);
            setQuestions(data.questions || []);
            setCurrentQuestionIndex(0);

            // Restore answers if already persisted
            if (report?.answers && typeof report.answers === "object") {
                setAnswers(report.answers);
            }

            // Restore completion state if already evaluated
            if (report?.status === "completed" || report?.evaluations?.length > 0) {
                setIsCompleted(true);
            }

            return data;
        } catch (err) {
            // Remove invalid/expired interview from storage
            try {
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch {
                // Safe ignore
            }
            setError(err.message || "Failed to load interview");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Rehydrate session from storage when triggered
    const rehydrateSession = useCallback(async () => {
        try {
            const savedId = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (savedId && !interviewId) {
                return await loadInterview(savedId);
            }
        } catch {
            // Safe ignore
        }
        return null;
    }, [interviewId, loadInterview]);

    // 4. Evaluate completed interview responses
    const submitInterviewAnswers = useCallback(async (targetAnswers = null) => {
        const finalAnswers = targetAnswers || answers;
        if (!interviewId) {
            throw new Error("No active interview session to evaluate.");
        }

        setEvaluating(true);
        setError(null);

        try {
            const updatedReport = await evaluateInterview({
                interviewId,
                answers: finalAnswers
            });

            if (updatedReport) {
                setCurrentInterview(updatedReport);
            }
            setIsCompleted(true);
            return updatedReport;
        } catch (err) {
            setError(err.message || "Failed to evaluate interview answers");
            throw err;
        } finally {
            setEvaluating(false);
        }
    }, [interviewId, answers]);

    // 5. Fetch all reports for the user
    const fetchReports = useCallback(async () => {
        setReportsLoading(true);
        try {
            const reports = await getAllInterviewReports();
            setAllReports(reports || []);
            return reports;
        } catch (err) {
            console.error("Failed to fetch reports:", err.message);
            return [];
        } finally {
            setReportsLoading(false);
        }
    }, []);

    // 6. Save/update user answer for a question
    const saveAnswer = useCallback((answerText, questionIdx = null) => {
        setAnswers((prev) => {
            const targetIndex = questionIdx !== null ? questionIdx : currentQuestionIndex;
            return {
                ...prev,
                [targetIndex]: answerText
            };
        });
    }, [currentQuestionIndex]);

    // 7. Navigation
    const nextQuestion = useCallback(() => {
        setCurrentQuestionIndex((prev) => {
            if (prev < questions.length - 1) {
                return prev + 1;
            }
            setIsCompleted(true);
            return prev;
        });
    }, [questions.length]);

    const previousQuestion = useCallback(() => {
        setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }, []);

    const goToQuestion = useCallback((index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
        }
    }, [questions.length]);

    // 8. Reset interview state
    const resetInterview = useCallback(() => {
        setCurrentInterview(null);
        setInterviewId(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setError(null);
        setIsCompleted(false);
        try {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {
            // Safe ignore
        }
    }, []);

    const value = {
        // State
        currentInterview,
        interviewId,
        questions,
        currentQuestionIndex,
        answers,
        config,
        loading,
        evaluating,
        error,
        isCompleted,
        allReports,
        reportsLoading,

        // Setters
        setConfig,
        setError,

        // Actions
        startInterview,
        loadInterview,
        rehydrateSession,
        submitInterviewAnswers,
        fetchReports,
        saveAnswer,
        nextQuestion,
        previousQuestion,
        goToQuestion,
        completeInterview: () => setIsCompleted(true),
        resetInterview
    };

    return (
        <InterviewContext.Provider value={value}>
            {children}
        </InterviewContext.Provider>
    );
};
