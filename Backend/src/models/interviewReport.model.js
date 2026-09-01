const mongoose = require("mongoose");

const interviewReportSchema = new mongoose.Schema(
    {
        jobDescription: {
            type: String,
            required: [true, "Job description is required"],
        },
        resumeSchema: {
            type: String,
        },
        selfDescription: {
            type: String,
        },
        matchScore: {
            type: Number,
            min: 0,
            max: 100
        },

        technicalQuestions: [technicalQuestionSchema],
        behavioralQuestions: [behavioralQuestionSchema],
        skillGap: [skillGapSchema],
        prepratrionPlan: [prepratrionPlanSchema]
    }, {
    timestamps: true
})

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        tyepe: String,
        required: [true, "Technical Question is required"],
    },
    intension: {
        type: String,
        required: [true, "intension is required"],
    },
    answer: {
        type: String,
        require: [true, "answer is required"],
    }
}, {
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        tyepe: String,
        required: [true, "Technical Question is required"],
    },
    intension: {
        type: String,
        required: [true, "intension is required"],
    },
    answer: {
        type: String,
        require: [true, "answer is required"],
    }
}, {
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        tyepe: String,
        required: [true, "skills is required"]
    },
    sevarity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "severity are required"]
    }
}, {
    _id: false
})

const prepratrionPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "day is required"]
    },
    focus: {
        tyepe: String,
        required: [true, "focus is required"]
    },
    tasks: [{
        tyepe: String,
        required: [true, "Task is required"]
    }]
})


const interviewReportModel = mongoose.model("interviewReport",interviewReportSchema);

module.exports = interviewReportModel