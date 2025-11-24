// Back-end use CommonJS

require('dotenv').config();    // load .env
const express = require('express');
const app = express();
const Groq = require("groq-sdk"); 

app.use(express.json());

// --- Cấu hình Groq Client ---
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.warn("Warning: GROQ_API_KEY is not set. Groq calls will fail.");
}

const groq = new Groq({ apiKey: GROQ_API_KEY });


// --- Hàm callGroq đã sửa Model ---
async function callGroq(prompt, opts = {}) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      // SỬA MODEL TỪ llama3-8b-8192 SANG llama3-8b-8192
      model: opts.model || "llama-3.1-8b-instant", 
      max_tokens: opts.max_tokens || 80, 
      temperature: opts.temperature ?? 0.8,
    });
    
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq SDK Error:", error.message || error);
    throw new Error(`Groq API failed: ${error.message || error}`);
  }
}

// Demo variable
let message = 'Hello world';

// -------------------- ROUTES -------------------- //
app.get('/', (req, res) => {
  res.send(`<h1>${message}</h1>`);
});

app.get('/api/message', (req, res) => {
  res.json({ message });
});


// -------------------- AI CAPTION API (Groq) -------------------- //
app.post('/api/caption', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "Description is required." });

    const prompt = `
Generate 5 short captions (max 10 words each). Return JSON: {"captions": [ ... ]}.
Post: "${description}"
Return either a JSON array or newline-separated captions.
    `.trim();

    const raw = await callGroq(prompt, { max_tokens: 200 });
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch (e) { parsed = null; }

    if (parsed && parsed.captions) return res.json({ captions: parsed.captions });
    const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length) return res.json({ captions: lines.slice(0,5) });
    const parts = raw.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length) return res.json({ captions: parts.slice(0,5) });

    return res.json({ captions: [raw].slice(0,5) });

  } catch (err) {
    console.error("Caption Error (Groq):", err);
    return res.status(500).json({ error: "AI Caption failed" });
  }
});

// -------------------- AI STATUS API (Groq) -------------------- //
// -------------------- AI STATUS API (Groq) -------------------- //
app.post('/api/status', async (req, res) => {
  try {
    const { location, mood } = req.body;
    if (!location || !mood) return res.status(400).json({ error: "Location and mood are required." });

    // SỬ DỤNG PROMPT MỚI
    const prompt = `
Generate 5 short social statuses (<12 words) for a map app based on the location and mood.
INPUT: Location: ${location}, Mood: ${mood}
ONLY return a single, valid JSON object with the key "statuses". DO NOT include any introductory or explanatory text outside of the JSON block.
Example: {"statuses": ["Vui quá!", "Yên bình tại đây."]}
    `.trim();

    const raw = await callGroq(prompt, { max_tokens: 160 });
    
    // LOGIC PARSING MỚI: TẬP TRUNG TÌM VÀ TRÍCH XUẤT KHỐI JSON
    let parsed = null;
    
    try {
        // Tìm khối JSON hợp lệ đầu tiên trong chuỗi
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            // Cố gắng parse chuỗi JSON đã trích xuất
            parsed = JSON.parse(jsonMatch[0]);
        }
    } catch (e) { 
        // Nếu parse thất bại, parsed vẫn là null
    }

    if (parsed && Array.isArray(parsed.statuses)) {
        // Nếu trích xuất JSON thành công và có mảng statuses
        return res.json({ statuses: parsed.statuses.slice(0, 5) });
    }

    // FALLBACK LOGIC: Nếu không phải JSON hợp lệ, chia theo dòng/dấu phẩy (giống code cũ)
    const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length) {
        // Chỉ lấy các dòng không phải là ký tự bắt đầu JSON ({, [)
        const validLines = lines.filter(line => !line.startsWith('{') && !line.startsWith('['));
        if (validLines.length > 0) {
            return res.json({ statuses: validLines.slice(0, 5) });
        }
    }
    
    // Fallback cuối cùng
    return res.json({ statuses: [raw].slice(0, 5) });

  } catch (err) {
    console.error("Status Error (Groq):", err);
    return res.status(500).json({ error: "AI Status failed" });
  }
});

// -------------------- START SERVER -------------------- //
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));