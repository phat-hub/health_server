import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// ✅ Tăng giới hạn request body lên 10MB (hoặc lớn hơn nếu cần)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Lấy API key từ Environment Variables
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const VISION_KEY = process.env.VISION_API_KEY;
const CALORIE_KEY = process.env.CALORIE_API_KEY;

if (!GEMINI_KEY || !VISION_KEY || !CALORIE_KEY) {
  console.error("❌ Lỗi: Chưa cấu hình đủ API key");
  process.exit(1);
}

// ================== Gemini Chat ==================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
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
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Google Vision Detect Food ==================
app.post("/detect-food", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [{ type: "LABEL_DETECTION", maxResults: 5 }]
            }
          ]
        }),
      }
    );
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== CalorieNinjas ==================
app.get("/calories", async (req, res) => {
  try {
    const { query } = req.query;
    const response = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: { "X-Api-Key": CALORIE_KEY }
      }
    );
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy ở cổng ${PORT}`);
});
