import express from "express";

const app = express();
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error("❌ OPENROUTER_API_KEY is niet gezet!");
  process.exit(1);
}

app.post("/suggest", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") return res.json({ suggestions: false });

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
            content: `Je bent een autocomplete assistent. Geef 3 korte vervolgstappen (2-4 woorden elk) voor: "${text}". Alleen de suggesties, gescheiden door komma's.`,
          },
        ],
        max_tokens: 30,
      }),
    });

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content;
    res.json({ suggestions: result || false });
  } catch (error) {
    console.error("Server error:", error.message);
    res.json({ suggestions: false });
  }
});

app.get("/", (req, res) => res.send("AI Suggestion Proxy is running ✅"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
