const { PDFParse } = require("pdf-parse");
const { generatesIntrviewReport, evaluateInterviewAnswers } = require("../services/Ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function extractTextFromPdf(buffer) {
    if (!buffer) return "";
    try {
        const parser = new PDFParse({ data: buffer });
        await parser.load();
        const textResult = await parser.getText();
        await parser.destroy();
        return typeof textResult === "string" ? textResult : (textResult?.text || "");
    } catch (err) {
        console.warn("Could not parse PDF file, continuing with plain text:", err.message);
        return "";
    }
}

async function generateInterviewReportController(req, res) {
    try {
        let resumeContent = "";
        if (req.file && req.file.buffer) {
            resumeContent = await extractTextFromPdf(req.file.buffer);
        } else if (req.body.resume) {
            resumeContent = req.body.resume;
        }

        const selfDescription = req.body.selfDescription || req.body.selfDiscription || "";
        const jobDescription = req.body.jobDescription || req.body.jobDiscription || "";

        if (!jobDescription && !selfDescription && !resumeContent) {
            return res.status(400).json({
                success: false,
                message: "Please provide job description, self description, or upload a resume."
            });
        }

        const interviewReportByAi = await generatesIntrviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        });

        if (!interviewReportByAi) {
            return res.status(502).json({
                success: false,
                message: "Failed to generate report from AI service."
            });
        }

        const userId = req.user.id || req.user._id;

        const interviewReport = await interviewReportModel.create({
            user: userId,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            matchScore: interviewReportByAi.matchScore ?? 75,
            technicalQuestions: interviewReportByAi.technicalQuestions || [],
            behavioralQuestions: interviewReportByAi.behavioralQuestions || [],
            skillGap: interviewReportByAi.skillGap || [],
            preparationPlan: interviewReportByAi.preparationPlan || [],
            status: "in-progress"
        });

        return res.status(201).json({
            success: true,
            message: "Interview Report Generated Successfully",
            interviewReport
        });
    } catch (err) {
        console.error("Error in generateInterviewReportController:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error while generating interview report."
        });
    }
}

async function evaluateInterviewReportController(req, res) {
    try {
        const { id } = req.params;
        const { answers = {} } = req.body;
        const userId = req.user.id || req.user._id;

        const report = await interviewReportModel.findOne({
            _id: id,
            user: userId
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found."
            });
        }

        // Flatten questions for evaluation
        const questions = [];
        if (Array.isArray(report.technicalQuestions)) {
            report.technicalQuestions.forEach((q) => {
                questions.push({
                    category: "Technical",
                    question: q.questions,
                    intent: q.intentation,
                    sampleAnswer: q.answer
                });
            });
        }
        if (Array.isArray(report.behavioralQuestions)) {
            report.behavioralQuestions.forEach((q) => {
                questions.push({
                    category: "Behavioral",
                    question: q.questions,
                    intent: q.intentation,
                    sampleAnswer: q.answer
                });
            });
        }

        const evaluation = await evaluateInterviewAnswers({
            questions,
            answers,
            jobDescription: report.jobDescription
        });

        report.evaluations = evaluation.questionEvaluations || [];
        report.overallScore = evaluation.overallScore ?? report.matchScore ?? 75;
        report.strengths = evaluation.strengths || [];
        report.areasForImprovement = evaluation.areasForImprovement || [];
        report.recommendations = evaluation.recommendations || [];
        report.answers = answers;
        report.status = "completed";

        await report.save();

        return res.status(200).json({
            success: true,
            message: "Interview evaluated and report saved successfully.",
            report
        });
    } catch (err) {
        console.error("Error in evaluateInterviewReportController:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to evaluate interview report."
        });
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;

        const report = await interviewReportModel.findOne({
            _id: id,
            user: userId
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found."
            });
        }

        return res.status(200).json({
            success: true,
            report
        });
    } catch (err) {
        console.error("Error in getInterviewReportByIdController:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve interview report."
        });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const userId = req.user.id || req.user._id;

        const reports = await interviewReportModel.find({ user: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            reports: reports || []
        });
    } catch (err) {
        console.error("Error in getAllInterviewReportsController:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve interview reports."
        });
    }
}

module.exports = {
    generateInterviewReportController,
    evaluateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController
};
