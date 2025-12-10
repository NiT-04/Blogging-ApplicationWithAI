const axios = require("axios");

// 👉 You can use OpenAI, Gemini, Groq, Deepseek — here is universal format
const AI_API_URL = "https://api.groq.com/openai/v1/chat/completions"; 
const API_KEY = process.env.AI_API_KEY;

async function generateSummary(content) {
  try {
    const res = await axios.post(
      AI_API_URL,
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "Summarize the blog in 3–4 sentences." },
          { role: "user", content }
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Summary Error:", error.message);
    return "";
  }
}

async function generateTags(content) {
  try {
    const res = await axios.post(
      AI_API_URL,
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "Extract 5–8 short keywords in JSON array format." },
          { role: "user", content }
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    let raw = res.data.choices[0].message.content.trim();

    // Ensure formatting is a valid JSON list
    return JSON.parse(raw);
  } catch (error) {
    console.error("AI Tags Error:", error.message);
    return [];
  }
}

module.exports = {
  generateSummary,
  generateTags,
};
