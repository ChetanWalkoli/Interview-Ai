const mongoose = require("mongoose");

const technicalQuestionSchema = new mongoose.Schema({
    questions: {
        type: String,
        required: [true, "Technical Question is required"]
    },
    intentation: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
});

const behavioralQuestionSchema = new mongoose.Schema({
    questions: {
        type: String,
        required: [true, "Behavioral Question is required"]
    },
    intentation: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
});

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "Low", "Medium", "High"],
        default: "medium"
    }
}, {
    _id: false
});

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    task: {
        type: String,
        required: [true, "Task is required"]
    },
    resources: {
        type: String
    },
    focus: {
        type: String
    }
}, {
    _id: false
});

const questionEvaluationSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    score: { type: Number, min: 0, max: 10, default: 0 },
    feedback: { type: String, default: "" }
}, {
    _id: false
});

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String
    },
    resume: {
        type: String
    },
    selfDescription: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 75
    },
    overallScore: {
        type: Number,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ["in-progress", "completed"],
        default: "in-progress"
    },
    answers: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    evaluations: [questionEvaluationSchema],
    strengths: [{ type: String }],
    areasForImprovement: [{ type: String }],
    recommendations: [{ type: String }],
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGap: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, {
    timestamps: true
});

const interviewReportModel = mongoose.model("interviewReport", interviewReportSchema);

module.exports = interviewReportModel;
