const pdfparse = require("pdf-parse")
const genrateInterviewReport = require("../services/Ai.service")


async function generateInterviewReportController (req, res) {
    const resumeFile = req.file
}

const resumeContent = pdfparse(request.file.buffer)
const { selfDescription , jobDescription } = req.body

module.exports = {generateInterviewReportController}
