require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Backend is running ");
});

// GROQ CLIENT
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// CHAT ROUTE
app.post("/chat", async (req, res) => {
  try {
    const { message, difficulty } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const lowerMessage = message.toLowerCase().trim();

    if (["hi", "hello", "hey"].includes(lowerMessage)) {
      return res.json({ reply: "Hello  How can I help you today?" });
    }

    let finalPrompt = message;

    if (difficulty === "Easy") {
      finalPrompt = `Explain simply:\n${message}`;
    } else if (difficulty === "Medium") {
      finalPrompt = `Explain moderately:\n${message}`;
    } else if (difficulty === "Hard") {
      finalPrompt = `Explain deeply:\n${message}`;
    }

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: finalPrompt }],
    });

    res.json({
      reply: response.choices[0].message.content,
    });

  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on 5000");
});