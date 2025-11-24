// statusAI.js
// Pure JS status suggestion module for React Native

function normalizeMood(mood) {
//... (logic normalizeMood không đổi)
  if (!mood) return "neutral";
  const m = mood.toString().toLowerCase();
  if (["happy","vui","vẫn vui","hạnh phúc"].some(x => m.includes(x))) return "happy";
  if (["sad","buồn","buồn bã","down"].some(x => m.includes(x))) return "sad";
  if (["adventurous","khám phá","phiêu","hứng thú"].some(x => m.includes(x))) return "adventurous";
  if (["calm","bình yên","yên"].some(x => m.includes(x))) return "calm";
  return "neutral";
}

function templates() {
//... (logic templates không đổi)
  return {
    happy: [
      place => `Vui quá tại ${place}`,
      place => `Khoẻ và vui ở ${place}`,
      place => `Nụ cười ở ${place}`,
      place => `Ngày đẹp ở ${place}`,
      place => `Chill tại ${place}`,
    ],
    sad: [
      place => `Cần chút yên tĩnh ở ${place}`,
      place => `Một mình tại ${place}`,
      place => `Ngồi suy nghĩ ở ${place}`,
      place => `Nhớ quá ở ${place}`,
      place => `Lặng lẽ ở ${place}`,
    ],
    adventurous: [
      place => `Khám phá ${place} nào!`,
      place => `Điểm mới: ${place}`,
      place => `Phiêu ở ${place}`,
      place => `Chuyến đi tại ${place}`,
      place => `Thử thách bản thân ở ${place}`,
    ],
    calm: [
      place => `Bình yên tại ${place}`,
      place => `Thở sâu ở ${place}`,
      place => `Chậm lại tại ${place}`,
      place => `Tĩnh giữa ${place}`,
      place => `Im lặng dễ chịu ở ${place}`,
    ],
    neutral: [
      place => `Ở ${place}`,
      place => `Tạm thời tại ${place}`,
      place => `${place} - hôm nay`,
      place => `Ghé ${place}`,
      place => `Có mặt tại ${place}`,
    ]
  };
}

// --- Groq remote integration (SỬA LẠI DÙNG SDK) ---
const Groq = require("groq-sdk");
const GROQ_API_KEY = process.env.GROQ_API_KEY; 
const groq = new Groq({ apiKey: GROQ_API_KEY });


async function callGroq(prompt, opts = {}) {
  // Bỏ logic fetch thủ công, dùng SDK
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      // SỬA MODEL TỪ llama3-8b-8192 SANG llama3-8b-8192
      model: opts.model || "llama-3.1-8b-instant", 
      max_tokens: opts.max_tokens || 120, 
      temperature: opts.temperature ?? 0.8,
    });
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq SDK Error (statusAI):", error.message || error);
    throw error;
  }
}

function parseGroqStatuses(raw, count = 5) {
//... (logic parseGroqStatuses không đổi)
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, count);
    // object with "statuses"
    if (parsed && parsed.statuses && Array.isArray(parsed.statuses)) return parsed.statuses.slice(0, count);
  } catch (e) { /* ignore */ }

  const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length) return lines.slice(0, count);
  const parts = raw.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  if (parts.length) return parts.slice(0, count);
  return [raw].slice(0, count);
}

export async function suggestStatuses(input = {}, options = {}) {
//... (logic suggestStatuses không đổi)
  const { location = {}, mood = "", count = 5 } = input;
  const provider = options.provider || "local";

  // remote Groq provider
  if (provider === "groq") {
    try {
      const place = (location.name && location.name.length > 0) ? location.name : `${location.lat ?? "?"},${location.lng ?? "?"}`;
      const prompt = `
Generate ${count} short social statuses (<12 words) for a map app.
Location: ${place}
Mood: ${mood}
Return JSON: { "statuses": [ ... ] } or newline-separated statuses.
      `.trim();

      const raw = await callGroq(prompt, { max_tokens: Math.min(200, options.max_tokens || 120), temperature: options.temperature });
      const items = parseGroqStatuses(raw, count);
      // map to objects with lat/lng/tag
      return items.slice(0, count).map(text => ({
        text,
        lat: typeof location.lat === "number" ? location.lat : null,
        lng: typeof location.lng === "number" ? location.lng : null,
        tag: normalizeMood(mood)
      }));
    } catch (err) {
      console.error("Groq status error:", err);
      // fallback to local below
    }
  }

  // local fallback (unchanged behavior)
  const norm = normalizeMood(mood);
  const place = (location.name && location.name.length > 0) ? location.name : `${location.lat ?? "?"},${location.lng ?? "?"}`;
  const pool = templates()[norm] || templates().neutral;
  const res = pool.slice(0, count).map(fn => ({
    text: fn(place),
    lat: typeof location.lat === "number" ? location.lat : null,
    lng: typeof location.lng === "number" ? location.lng : null,
    tag: norm
  }));
  return res;
}