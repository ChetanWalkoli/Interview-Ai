import { useContext, useMemo, useCallback } from "react";
import { InterviewContext } from "../interview.context.def";

/**
 * Custom hook to manage the lifecycle of an interview session
 */
export const useInterview = () => {
    const context = useContext(InterviewContext);

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const {
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
        setConfig,
        setError,
        startInterview,
        loadInterview,
        rehydrateSession,
        submitInterviewAnswers,
        saveAnswer,
        nextQuestion,
        previousQuestion,
        goToQuestion,
        completeInterview,
        resetInterview
    } = context;

    // Derived states
    const currentQuestion = useMemo(() => {
        return questions[currentQuestionIndex] || null;
    }, [questions, currentQuestionIndex]);

    const totalQuestions = questions.length;

    const progressPercent = useMemo(() => {
        if (!totalQuestions) return 0;
        return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
    }, [currentQuestionIndex, totalQuestions]);

    const currentAnswer = useMemo(() => {
        return answers[currentQuestionIndex] || "";
    }, [answers, currentQuestionIndex]);

    const answeredCount = useMemo(() => {
        return Object.values(answers).filter((val) => typeof val === "string" && val.trim().length > 0).length;
    }, [answers]);

    // Action handlers with validation and error wrapping
    const startNewInterview = useCallback(async (interviewConfig) => {
        return await startInterview(interviewConfig);
    }, [startInterview]);

    const fetchExistingInterview = useCallback(async (id) => {
        return await loadInterview(id);
    }, [loadInterview]);

    const triggerRehydrate = useCallback(async () => {
        return await rehydrateSession();
    }, [rehydrateSession]);

    const submitAnswersForEvaluation = useCallback(async (targetAnswers = null) => {
        return await submitInterviewAnswers(targetAnswers);
    }, [submitInterviewAnswers]);

    const handleSaveAnswer = useCallback((text, questionIdx = null) => {
        saveAnswer(text, questionIdx);
    }, [saveAnswer]);

    const moveToNextQuestion = useCallback(() => {
        nextQuestion();
    }, [nextQuestion]);

    const moveToPreviousQuestion = useCallback(() => {
        previousQuestion();
    }, [previousQuestion]);

    const jumpToQuestion = useCallback((index) => {
        goToQuestion(index);
    }, [goToQuestion]);

    const completeCurrentInterview = useCallback(() => {
        completeInterview();
    }, [completeInterview]);

    const resetInterviewSession = useCallback(() => {
        resetInterview();
    }, [resetInterview]);

    return {
        // State
        currentInterview,
        interviewId,
        questions,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        progressPercent,
        answers,
        currentAnswer,
        answeredCount,
        config,
        loading,
        evaluating,
        error,
        isCompleted,

        // Setters
        setConfig,
        setError,

        // Actions
        startNewInterview,
        fetchExistingInterview,
        triggerRehydrate,
        submitAnswersForEvaluation,
        saveAnswer: handleSaveAnswer,
        moveToNextQuestion,
        moveToPreviousQuestion,
        jumpToQuestion,
        completeCurrentInterview,
        resetInterviewSession
    };
};
