// server.js
const express = require("express");
const fetch = require("node-fetch"); // ensure node-fetch is installed
const app = express();
app.use(express.json());

// =============================================
// 1️⃣ Put your OpenRouter API key in Render
//    (Environment variable: OPENROUTER_API_KEY)
// =============================================
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error("❌ OPENROUTER_API_KEY is not set! Add it in Render environment variables.");
  process.exit(1);
}

// POST /suggest
app.post("/suggest", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.json({ suggestions: false });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: `You are an autocomplete assistant. Suggest exactly 3 short continuations (2-4 words each) for this text. Return ONLY the suggestions, separated by commas. Partial text: "${text}"`,
          },
        ],
        max_tokens: 30,
      }),
    });

    const data = await response.json();

    // Extract the suggestions text
    const result = data?.choices?.[0]?.message?.content;
    if (!result) {
      return res.json({ suggestions: false });
    }

    // Return the suggestions
    res.json({ suggestions: result });
  } catch (error) {
    console.error("Server error:", error.message);
    res.json({ suggestions: false });
  }
});

// Simple GET to test server
app.get("/", (req, res) => {
  res.send("AI Suggestion Proxy is running ✅");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
