const express = require("express");
const app = express();
app.use(express.json());

const API_KEY = "sk-or-v1-9a6...09e";

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
            content: "Suggest 3 short autocomplete continuations (2-4 words each) for this text. Return ONLY the 3 suggestions separated by commas. Nothing else.\n\nText: \"" + text + "\""
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    console.log("Full response:", JSON.stringify(data));

    if (data.error) {
      console.log("API error:", data.error);
      return res.json({ suggestions: false });
    }

    const result = data?.choices?.[0]?.message?.content || false;
    console.log("Input:", text, "Output:", result);

    res.json({ suggestions: result });
  } catch (error) {
    console.error("Error:", error.message);
    res.json({ suggestions: false });
  }
});

app.get("/", (req, res) => {
  res.send("Proxy is running");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Running on port " + port);
});
