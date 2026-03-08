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
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "user",
            content: "You are an autocomplete assistant. Given the following partial text, suggest exactly 3 short continuations (2-4 words each). Return ONLY the suggestions separated by commas, nothing else. No numbering, no quotes, no explanation.\n\nPartial text: \"" + text + "\""
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    console.log("Response:", JSON.stringify(data));

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
