const express =  require('express');
const authMiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require ("../middlewares/file.middleware");

const interviewRouter = express.Router();

/**
 *@route post/api/interview/generate-report
 *@description generate new report on the basis of self description, resume pdf and job description
 *@access private
 */

    interviewRouter.post("/", authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewReportController);

module.exports = interviewRouter;