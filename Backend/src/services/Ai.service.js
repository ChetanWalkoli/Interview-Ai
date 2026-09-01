const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
    technicalQuestions: z.array(z.object({
        questions: z.string().describe("The technical question can be ask in interview"),
        intentation: z.string().describe("The intentation of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover , what approch to take etc.")
    })).describe("The technical questions are the questions which are asked to know about the candidate's technical skills and knowledge."),

    behavioralQuestions: z.array(z.object({
        questions: z.string().describe("The behavioral question can be ask in interview"),
        intentation: z.string().describe("The intentation of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover , what approch to take etc.")
    })).describe("The behavioral questions are the questions which are asked to know about the candidate's behavior, attitude, and personality."),

    skillGap: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking and needs to improve"),
        severity: z.string().describe("The severity of the skill gap, how important is this skill for the job role and how much impact it will have on the candidate's performance"),
    })).describe("The skill gap is the difference between the skills that the candidate has and the skills that are required for the job role. It helps to identify the areas where the candidate needs to improve and focus on."),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number of the preparation plan, it helps to track the progress of the candidate's preparation"),
        task: z.string().describe("The task to be completed on this day"),
        resources: z.string().describe("The resources required for the task"),
        focus: z.string().describe("The area of focus for the task")
    })).describe("The preparation plan is a structured approach to help the candidate prepare for the interview.")
});

// Simple test function to verify Gemini connectivity
async function invokeGeminiAi() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: "Say hello",
            config: { responseMimeType: "text/plain" }
        });
        console.log("Gemini response:", response.text);
    } catch (err) {
        console.error("Error invoking Gemini:", err.message);
    }
}

// Safe defaults so calling with no arguments won't crash
async function generatesIntrviewReport({ resume = "", selfDiscription = "", jobDiscription = "" } = {}) {
    const prompt = `Genrate an interview report for a candidate with the following details:
            Resume: ${resume}
            Self Description: ${selfDiscription}
            Job Description: ${jobDiscription}
`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: zodToJsonSchema(interviewReportSchema, "interviewReportSchema")
            }
        });
        console.log(JSON.parse(response.text));
    } catch (err) {
        console.error("Error generating interview report:", err.message);
    }
}

module.exports = { invokeGeminiAi, generatesIntrviewReport };