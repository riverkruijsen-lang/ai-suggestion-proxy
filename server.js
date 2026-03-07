const express = require("express");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.json());

const API_KEY = "AIzaSyAnp3Elzo-P9FVh4dHilXOtIpRlM13BhFg";

app.get("/", (req, res) => {
  res.send("AI Proxy Running");
});

app.post("/suggest", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.json({ suggestions: false });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
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
                  text: `Give 3 short autocomplete suggestions separated by commas.\n\nText: ${text}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || false;

    res.json({ suggestions: result });

  } catch (err) {
    console.error(err);
    res.json({ suggestions: false });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});