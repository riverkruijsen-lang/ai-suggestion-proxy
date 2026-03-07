const express = require("express");

const app = express();
app.use(express.json());

// API key from Render environment variable
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Gemini API key NOT set!");
} else {
  console.log("✅ Gemini API key loaded");
}

app.post("/suggest", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.json({ suggestions: false });
    }

    console.log("Input text:", text);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an autocomplete assistant.
Suggest EXACTLY 3 short continuations (2-4 words each).
Return ONLY comma separated suggestions.

Partial text: "${text}"`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API error:", data.error);
      return res.json({ suggestions: false });
    }

    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || false;

    console.log("Suggestions:", result);

    res.json({ suggestions: result });

  } catch (error) {
    console.error("Server error:", error);
    res.json({ suggestions: false });
  }
});

app.get("/", (req, res) => {
  res.send("AI Suggestion Proxy is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
