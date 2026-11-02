const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = {
    type: "object",
    properties: {
        matchScore: {
            type: "number",
            description: "Overall candidate match score percentage between 0 and 100 based on job description vs resume/skills"
        },
        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    questions: {
                        type: "string",
                        description: "The technical question that can be asked in the interview"
                    },
                    intentation: {
                        type: "string",
                        description: "The intention of the interviewer behind asking this question"
                    },
                    answer: {
                        type: "string",
                        description: "How to answer this question, key points to cover, and recommended approach"
                    }
                },
                required: ["questions", "intentation", "answer"]
            },
            description: "Technical questions tailored to the candidate's skills and target job."
        },
        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    questions: {
                        type: "string",
                        description: "Behavioral question to evaluate culture fit and communication"
                    },
                    intentation: {
                        type: "string",
                        description: "The intention of interviewer behind asking this question"
                    },
                    answer: {
                        type: "string",
                        description: "STAR method guidance, key talking points, and response tips"
                    }
                },
                required: ["questions", "intentation", "answer"]
            },
            description: "Behavioral and situational questions."
        },
        skillGap: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: {
                        type: "string",
                        description: "The skill or technology area where the candidate has a gap"
                    },
                    severity: {
                        type: "string",
                        description: "Severity of the gap: Low, Medium, or High"
                    }
                },
                required: ["skill", "severity"]
            },
            description: "Identified gaps between requirements and candidate profile."
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: {
                        type: "number",
                        description: "Day number of the prep plan (e.g. 1 to 7)"
                    },
                    task: {
                        type: "string",
                        description: "Specific learning or practice task for the day"
                    },
                    resources: {
                        type: "string",
                        description: "Suggested resources, documentation, or practice materials"
                    },
                    focus: {
                        type: "string",
                        description: "Key topic or focal area for the day"
                    }
                },
                required: ["day", "task", "resources", "focus"]
            },
            description: "Structured day-by-day interview preparation roadmap."
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGap", "preparationPlan"]
};

const interviewEvaluationSchema = {
    type: "object",
    properties: {
        overallScore: {
            type: "number",
            description: "Overall interview performance score from 0 to 100 based on quality and completeness of answers."
        },
        questionEvaluations: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description: "The interview question evaluated"
                    },
                    answer: {
                        type: "string",
                        description: "The candidate's provided answer"
                    },
                    score: {
                        type: "number",
                        description: "Score out of 10 for this answer"
                    },
                    feedback: {
                        type: "string",
                        description: "Specific strengths and improvement points for this answer"
                    }
                },
                required: ["question", "answer", "score", "feedback"]
            },
            description: "Detailed evaluation per question"
        },
        strengths: {
            type: "array",
            items: { type: "string" },
            description: "Top 3-5 demonstrated candidate strengths"
        },
        areasForImprovement: {
            type: "array",
            items: { type: "string" },
            description: "Top 3-5 constructive areas for candidate to improve"
        },
        recommendations: {
            type: "array",
            items: { type: "string" },
            description: "Actionable advice for upcoming real interviews"
        }
    },
    required: ["overallScore", "questionEvaluations", "strengths", "areasForImprovement", "recommendations"]
};

/**
 * Retries transient network / rate-limiting errors automatically
 */
async function callGeminiWithRetry(fn, maxRetries = 2, delayMs = 1500) {
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const errMsg = err?.message || "";
            const errCode = err?.cause?.code || "";
            const isTransient = errMsg.includes("fetch failed") ||
                                errCode === "ECONNRESET" ||
                                errCode === "ETIMEDOUT" ||
                                errCode === "ENOTFOUND" ||
                                err?.status === 503 ||
                                err?.status === 429;

            if (attempt <= maxRetries && isTransient) {
                console.warn(`[Gemini AI] Temporary connection issue (${errMsg}). Retrying in ${delayMs * attempt}ms (attempt ${attempt}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
            } else {
                throw err;
            }
        }
    }
}

async function invokeGeminiAi(prompt = "Say hello") {
    try {
        const response = await callGeminiWithRetry(() =>
            ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt,
                config: { responseMimeType: "text/plain" }
            })
        );
        console.log("Gemini response:", response.text);
        return response.text;
    } catch (err) {
        console.error("Error invoking Gemini:", err?.cause?.message || err.message);
        return null;
    }
}

async function generatesIntrviewReport({ resume = "", selfDescription = "", selfDiscription = "", jobDescription = "", jobDiscription = "" } = {}) {
    const finalSelfDesc = selfDescription || selfDiscription || "";
    const finalJobDesc = jobDescription || jobDiscription || "";

    if (!resume && !finalSelfDesc && !finalJobDesc) {
        return null;
    }

    const prompt = `You are an expert technical interviewer and career coach.
Generate a comprehensive interview preparation report for a candidate with the following background:

Job Description:
${finalJobDesc || "Software Engineer role"}

Candidate Resume / Background:
${resume || "Not provided"}

Candidate Self Description / Experience Summary:
${finalSelfDesc || "Not provided"}

Produce detailed technical questions, behavioral questions, skill gap analysis, day-by-day preparation plan, and an estimated matchScore (0-100).
`;

    try {
        const response = await callGeminiWithRetry(() =>
            ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: interviewReportSchema
                }
            })
        );

        const data = JSON.parse(response.text);
        return data;
    } catch (err) {
        console.error("Error generating interview report:", err?.cause?.message || err.message);
        throw err;
    }
}

/**
 * Evaluates candidate responses to interview questions
 */
async function evaluateInterviewAnswers({ questions = [], answers = {}, jobDescription = "" }) {
    const qaPairs = questions.map((q, idx) => {
        const candidateAnswer = typeof answers[idx] === "string" ? answers[idx] : (answers[q.id] || "No answer provided");
        return `Question ${idx + 1} (${q.category || "General"}): ${q.question || q.questions}
Candidate Answer: ${candidateAnswer || "Candidate left this question blank."}
`;
    }).join("\n---\n");

    const prompt = `You are an executive interviewer and hiring manager assessing an interview candidate for the following role:
Role / Job Description: ${jobDescription || "Software Engineer"}

Here are the questions asked and the candidate's answers:
${qaPairs}

Provide a fair, rigorous evaluation:
1. Score each answer from 0 to 10 with actionable feedback. Blank answers receive 0.
2. Determine an overall score from 0 to 100.
3. List candidate strengths, areas for improvement, and tailored recommendations.
`;

    try {
        const response = await callGeminiWithRetry(() =>
            ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: interviewEvaluationSchema
                }
            })
        );

        return JSON.parse(response.text);
    } catch (err) {
        console.error("Error evaluating answers with Gemini:", err?.cause?.message || err.message);
        // Fallback calculation in case of AI rate limit
        const answeredCount = Object.values(answers).filter(a => typeof a === "string" && a.trim().length > 0).length;
        const total = questions.length || 1;
        const fallbackScore = Math.round((answeredCount / total) * 80);

        return {
            overallScore: fallbackScore,
            questionEvaluations: questions.map((q, idx) => ({
                question: q.question || q.questions,
                answer: answers[idx] || "No answer provided",
                score: answers[idx] ? 7 : 0,
                feedback: answers[idx] ? "Answer provided. Review key trade-offs and clarify system architecture." : "Question was not answered."
            })),
            strengths: ["Completed mock interview session", "Demonstrated problem-solving structure"],
            areasForImprovement: ["Provide deeper real-world examples", "Use STAR method for behavioral answers"],
            recommendations: ["Review day-by-day preparation plan", "Practice system design fundamentals"]
        };
    }
}

module.exports = {
    invokeGeminiAi,
    generatesIntrviewReport,
    evaluateInterviewAnswers
};
