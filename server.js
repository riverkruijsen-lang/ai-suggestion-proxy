// server.js
const express = require("express");
const app = express();
app.use(express.json());

// =============================================
// 1️⃣ Zet je OpenRouter API key in Render
//    (Environment variable: OPENROUTER_API_KEY)
// =============================================
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error("❌ OPENROUTER_API_KEY is niet gezet! Voeg het toe in Render environment variables.");
  process.exit(1);
}

// POST /suggest - geeft 3 korte suggesties terug
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
            content: `Je bent een autocomplete assistent. Geef exact 3 korte vervolgstappen (2-4 woorden elk) voor deze tekst. Geef alleen de suggesties, gescheiden door komma's. Partial text: "${text}"`,
          },
        ],
        max_tokens: 30,
      }),
    });

    const data = await response.json();

    const result = data?.choices?.[0]?.message?.content;
    if (!result) {
      return res.json({ suggestions: false });
    }

    res.json({ suggestions: result });
  } catch (error) {
    console.error("Server error:", error.message);
    res.json({ suggestions: false });
  }
});

// GET / - test endpoint
app.get("/", (req, res) => {
  res.send("AI Suggestion Proxy is running ✅");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
