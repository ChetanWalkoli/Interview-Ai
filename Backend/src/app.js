const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://interviewai.chetanwalkoli.in",
    "https://www.interviewai.chetanwalkoli.in",
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// 1. CORS middleware - automatically handles preflight OPTIONS & CORS headers for all routes
app.use(cors(corsOptions));

// 2. Health check endpoint to verify backend is live
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date() });
});

app.use(express.json());
app.use(cookieParser());

// Require routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");
const resumeRouter = require("./routes/resume.routes");

// Mount /api/auth before any other feature routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/resume", resumeRouter);

module.exports = app;
