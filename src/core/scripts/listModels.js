import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        const models = await genAI.listModels();
        console.log("Available models:");
        models.forEach((m) => {
            console.log(`- ${m.name} | methods: ${m.supportedGenerationMethods}`);
        });
    } catch (err) {
        console.error("ListModels error:", err);
    }
}

run();
