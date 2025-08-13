import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Lấy API key từ Environment Variable (Render, Railway, Vercel)
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Lỗi: Chưa cấu hình GEMINI_API_KEY trong Environment Variables");
  process.exit(1);
}

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `Bạn là bác sĩ AI thân thiện. ${message}` }] }
          ]
        }),
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy ở cổng ${PORT}`);
});
