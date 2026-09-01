require("dotenv").config();
const app = require("./src/app");
const connectDb = require("./src/config/database");
const { invokeGeminiAi, generatesIntrviewReport } = require("./src/services/Ai.service");

connectDb();
invokeGeminiAi();

app.listen(3000, () => {
    console.log("server is running on port 3000");
});