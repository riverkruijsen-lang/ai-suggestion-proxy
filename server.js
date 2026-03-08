const express = require("express");
const app = express();
app.use(express.json());

const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

const API_KEY = process.env.OPENROUTER_KEY;

app.post("/suggest", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.json({ suggestions: false });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "user",
            content:
              `Suggest 3 short autocomplete continuations (2-4 words each).
Return ONLY the suggestions separated by commas.

Text: "${text}"`
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();

    const result = data?.choices?.[0]?.message?.content;

    if (!result) {
      return res.json({ suggestions: false });
    }

    const suggestions = result
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log("Input:", text);
    console.log("Suggestions:", suggestions);

    res.json({ suggestions });

  } catch (error) {
    console.error("Error:", error.message);
    res.json({ suggestions: false });
  }
});

app.get("/", (req, res) => {
  res.send("AI suggestion proxy running");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Running on port " + port);
});
