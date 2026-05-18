const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
console.log("Checking API Key: ", apiKey ? `${apiKey.substring(0, 7)}...` : "NOT FOUND");

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    console.log("Initializing Gemini model...");
    // Let's use the standard gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Sending a test prompt to Gemini...");
    const result = await model.generateContent("Hello, respond in one word.");
    console.log("SUCCESS! Response: ", result.response.text());
  } catch (error) {
    console.error("FAILED to communicate with Gemini:", error.message);
  }
}

test();
