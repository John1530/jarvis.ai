import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * 🧠 HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.send("JARVIS BACKEND RUNNING 🚀 (OLLAMA MODE)");
});

/**
 * 🤖 MAIN JARVIS CHAT (OLLAMA LOCAL AI)
 */
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    console.log("User:", userMessage);

    // CALL OLLAMA
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3:latest",
        prompt: `You are Jarvis, an intelligent AI assistant.

Rules:
- Be concise
- Be helpful
- Respond like Jarvis from Iron Man

User: ${userMessage}
Jarvis:`,
        stream: false,
      }),
    });

    // SAFETY CHECK (IMPORTANT)
    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Ollama API error:", errText);

      return res.status(500).json({
        success: false,
        error: "Ollama API failed",
        details: errText,
      });
    }

    console.log("Ollama response received ✔");

    const data = await response.json();

    console.log("Raw Ollama response:", data);

    const reply = data?.response || "No response from AI";

    return res.json({
      success: true,
      reply: reply,
    });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 🚀 START SERVER
 */
app.listen(PORT, () => {
  console.log(`JARVIS BACKEND RUNNING ON PORT ${PORT} (OLLAMA MODE)`);
});