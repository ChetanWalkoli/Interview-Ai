const express = require('express');
const { authUser } = require("../middlewares/auth.middleware");
const { generateResumePdfController } = require("../Controllers/resume.Controller");

const resumeRouter = express.Router();

/**
 * @route POST /api/resume/pdf
 * @description Generates and returns a downloadable resume PDF
 * @access Private
 */
resumeRouter.post("/pdf", authUser, generateResumePdfController);

module.exports = resumeRouter;

