const express = require('express');
const { authUser } = require("../middlewares/auth.middleware");
const {
    generateInterviewReportController,
    evaluateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController
} = require("../controllers/interview.Controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description Generate new report on the basis of self description, resume pdf and job description
 * @access Private
 */
interviewRouter.post("/", authUser, upload.single("resume"), generateInterviewReportController);

/**
 * @route GET /api/interview/reports
 * @description Get all interview reports for authenticated user
 * @access Private
 */
interviewRouter.get("/reports", authUser, getAllInterviewReportsController);

/**
 * @route GET /api/interview/reports/:id
 * @description Get single interview report by ID
 * @access Private
 */
interviewRouter.get("/reports/:id", authUser, getInterviewReportByIdController);

/**
 * @route GET /api/interview/:id
 * @description Get single interview / report by ID
 * @access Private
 */
interviewRouter.get("/:id", authUser, getInterviewReportByIdController);

/**
 * @route POST /api/interview/:id/evaluate
 * @description Evaluate user answers and finalize interview report
 * @access Private
 */
interviewRouter.post("/:id/evaluate", authUser, evaluateInterviewReportController);
interviewRouter.post("/reports/:id/evaluate", authUser, evaluateInterviewReportController);

module.exports = interviewRouter;
