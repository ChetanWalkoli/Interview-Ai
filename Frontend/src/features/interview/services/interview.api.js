import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
});

/**
 * Format raw technical & behavioral questions into a flat ordered list
 */
export function formatQuestionsFromReport(report) {
    if (!report) return [];
    const flattened = [];

    if (Array.isArray(report.technicalQuestions)) {
        report.technicalQuestions.forEach((q, idx) => {
            flattened.push({
                id: `tech-${idx}`,
                category: "Technical",
                question: q.questions || q.question || "",
                intent: q.intentation || q.intent || "",
                sampleAnswer: q.answer || ""
            });
        });
    }

    if (Array.isArray(report.behavioralQuestions)) {
        report.behavioralQuestions.forEach((q, idx) => {
            flattened.push({
                id: `beh-${idx}`,
                category: "Behavioral",
                question: q.questions || q.question || "",
                intent: q.intentation || q.intent || "",
                sampleAnswer: q.answer || ""
            });
        });
    }

    return flattened;
}

/**
 * 1. Generate Interview
 * Generates an interview using the AI backend
 * @param {Object} config
 * @param {string} [config.jobDescription]
 * @param {string} [config.selfDescription]
 * @param {File} [config.resumeFile]
 * @param {string} [config.resume]
 */
export async function generateInterview(config = {}) {
    const { jobDescription = "", selfDescription = "", resumeFile = null, resume = "" } = config;

    if (!jobDescription.trim() && !selfDescription.trim() && !resumeFile && !resume.trim()) {
        throw new Error("Validation Error: Please provide a job description, self description, or resume.");
    }

    try {
        let response;
        if (resumeFile) {
            const formData = new FormData();
            formData.append("resume", resumeFile);
            if (selfDescription) formData.append("selfDescription", selfDescription);
            if (jobDescription) formData.append("jobDescription", jobDescription);

            response = await api.post("/api/interview", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
        } else {
            response = await api.post("/api/interview", {
                resume,
                selfDescription,
                jobDescription
            });
        }

        const report = response.data?.interviewReport;
        const questions = formatQuestionsFromReport(report);

        return {
            success: true,
            interviewId: report?._id || null,
            interviewReport: report,
            questions,
            message: response.data?.message || "Interview generated successfully."
        };
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to generate interview";
        throw new Error(message, { cause: err });
    }
}

/**
 * 2. Get Interview by ID
 * Retrieves an individual interview using its unique ID
 * @param {string} interviewId
 */
export async function getInterviewById(interviewId) {
    if (!interviewId || typeof interviewId !== "string" || !interviewId.trim()) {
        throw new Error("Validation Error: A valid interview ID is required.");
    }

    try {
        const response = await api.get(`/api/interview/${interviewId.trim()}`);
        const report = response.data?.report || null;
        const questions = formatQuestionsFromReport(report);

        return {
            success: true,
            interviewId: report?._id || interviewId,
            interviewReport: report,
            questions
        };
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to fetch interview by ID";
        throw new Error(message, { cause: err });
    }
}

/**
 * 3. Get All Interview Reports
 * Retrieves all interview reports belonging to the authenticated user
 */
export async function getAllInterviewReports() {
    try {
        const response = await api.get("/api/interview/reports");
        return response.data?.reports || [];
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to fetch interview reports";
        throw new Error(message, { cause: err });
    }
}

/**
 * 4. Evaluate Interview Answers & Finalize Report
 * Sends candidate answers to Gemini AI for evaluation and score generation
 * @param {Object} payload
 * @param {string} payload.interviewId
 * @param {Object} payload.answers
 */
export async function evaluateInterview({ interviewId, answers }) {
    if (!interviewId || typeof interviewId !== "string" || !interviewId.trim()) {
        throw new Error("Validation Error: Interview ID is required for evaluation.");
    }

    try {
        const response = await api.post(`/api/interview/${interviewId.trim()}/evaluate`, { answers });
        return response.data?.report || null;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to evaluate interview answers";
        throw new Error(message, { cause: err });
    }
}

/**
 * 5. Download Generated Resume PDF
 * Sends validated resume details to backend and downloads the resulting binary PDF
 * @param {Object} resumeData
 */
export async function downloadResumePdf(resumeData) {
    if (!resumeData || !resumeData.fullName || !resumeData.email) {
        throw new Error("Validation Error: Full name and email are required to generate resume PDF.");
    }

    try {
        const response = await api.post("/api/resume/pdf", resumeData, {
            responseType: "blob"
        });

        // Create Blob from binary response
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const safeName = (resumeData.fullName || "Candidate").replace(/[^a-zA-Z0-9]/g, "_");
        link.download = `${safeName}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke temporary object URL after download trigger
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);

        return true;
    } catch (err) {
        let message = "Failed to generate and download resume PDF.";
        if (err.response && err.response.data instanceof Blob) {
            try {
                const text = await err.response.data.text();
                const json = JSON.parse(text);
                message = json.message || message;
            } catch {
                // Keep default message
            }
        } else if (err.message) {
            message = err.message;
        }
        throw new Error(message, { cause: err });
    }
}

// Aliases for compatibility
export const generateInterviewReport = generateInterview;
export const getInterviewReportById = getInterviewById;

export default api;
