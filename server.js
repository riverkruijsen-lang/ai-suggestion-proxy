const express = require("express");
const app = express();
app.use(express.json());

// =============================================
// PUT YOUR REAL GEMINI API KEY BELOW
// Get one free at: https://aistudio.google.com/apikey
// =============================================
const API_KEY = "AIzaSyDYghgyYOCv4zzB3IlYqjz97yPgJ4Crk9c";

// Safety check
if (API_KEY === "AIzaSyDYghgyYOCv4zzB3IlYqjz97yPgJ4Crk9c" || API_KEY === "AIzaSyDYghgyYOCv4zzB3IlYqjz97yPgJ4Crk9c") {
  console.error("!!! WARNING: You haven't set your Gemini API key! Edit server.js !!!");
}

app.post("/suggest", async (req, res) => {
  console.log("--- Received request ---");
  console.log("Body:", JSON.stringify(req.body));

  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      console.log("Invalid input");
      return res.json({ suggestions: false });
    }

    console.log("Sending to Gemini:", text);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are an autocomplete assistant. Given the following partial text, suggest exactly 3 short continuations (2-4 words each). Return ONLY the suggestions separated by commas, nothing else. No numbering, no quotes, no explanation.\n\nPartial text: "${text}"`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 50,
      },
    };

    console.log("Request URL:", url.replace(API_KEY, "HIDDEN"));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log("Gemini status:", response.status);

    const data = await response.json();

    console.log("Gemini full response:", JSON.stringify(data, null, 2));

    // Check for API errors
    if (data.error) {
      console.error("Gemini API error:", data.error.message);
      return res.json({ suggestions: false });
    }

    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || false;

    console.log("Extracted suggestions:", result);

    res.json({ suggestions: result });
  } catch (error) {
    console.error("Server error:", error.message);
    console.error("Stack:", error.stack);
    res.json({ suggestions: false });
  }
});

app.get("/", (req, res) => {
  res.send("AI Suggestion Proxy is running! API Key set: " + (API_KEY !== "AIzaSyDYghgyYOCv4zzB3IlYqjz97yPgJ4Crk9c"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port);
  console.log("API Key set:", API_KEY !== "AIzaSyDYghgyYOCv4zzB3IlYqjz97yPgJ4Crk9c");
  console.log("API Key length:", API_KEY.length);
});
