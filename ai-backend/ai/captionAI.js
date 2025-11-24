// captionAI.js
// Pure JS caption generator suitable for React Native (fallback rule-based)
// Added optional Groq remote generation (provider: 'local' | 'groq')

function truncateToWords(text, maxWords = 10) {
//... (logic truncateToWords không đổi)
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  return words.slice(0, maxWords).join(" ");
}

function extractKeywords(text, max = 3) {
//... (logic extractKeywords không đổi)
  if (!text) return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ");
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  // choose distinct tokens that are not super short
  const uniq = Array.from(new Set(tokens)).filter(t => t.length > 2);
  return uniq.slice(0, max);
}

// Basic local generator (unchanged behavior)
function localGenerate(description = "", options = {}) {
//... (logic localGenerate không đổi)
  const { lang = "vi", count = 5 } = options;
  const keywords = extractKeywords(description, 3);

  const templates_vi = [
    k => `${k} đẹp tự nhiên`,
    k => `Khoảnh khắc ${k}`,
    k => `${k} và nắng`,
    k => `Yêu ${k}`,
    k => `${k} đáng nhớ`,
    k => `Một ngày với ${k}`,
    k => `Chill cùng ${k}`,
    k => `${k} thôi mà`,
  ];

  const templates_en = [
    k => `${k} vibes`,
    k => `Moments of ${k}`,
    k => `Simply ${k}`,
    k => `Love this ${k}`,
    k => `${k} memories`,
    k => `Chillin' with ${k}`,
  ];

  const chosen = lang.startsWith("en") ? templates_en : templates_vi;
  const out = new Set();
  const { count: target = 5 } = options;

  if (keywords.length === 0) {
    const generic_vi = ["Khoảnh khắc đáng yêu", "Tận hưởng cuộc sống", "Nắng và gió", "Bình yên thôi", "Chút niềm vui"];
    const generic_en = ["Simple joys", "Sunny moments", "Just vibes", "Feeling calm", "Good times"];
    const pool = lang.startsWith("en") ? generic_en : generic_vi;
    for (let i = 0; i < target; i++) out.add(truncateToWords(pool[i % pool.length], 10));
    return Array.from(out);
  }

  // generate by keyword templates
  for (let i = 0; i < keywords.length && out.size < target; i++) {
    const k = keywords[i];
    for (let t = 0; t < chosen.length && out.size < target; t++) {
      out.add(truncateToWords(chosen[(i + t) % chosen.length](k), 10));
    }
  }

  // fill with simple combos if still short
  let idx = 0;
  while (out.size < target && idx < keywords.length) {
    out.add(truncateToWords(`${keywords[idx]}`, 10));
    idx++;
  }

  // final safety: pad with generic phrases
  const fallback = lang.startsWith("en") ? ["Lovely day", "Small joys", "Golden hour", "Good vibes", "Just here"] : ["Ngày vui", "Khoảnh khắc nhỏ", "Giờ vàng", "Good vibes", "Chỉ là đây"];
  let j = 0;
  while (out.size < target) {
    out.add(truncateToWords(fallback[j % fallback.length], 10));
    j++;
  }

  return Array.from(out).slice(0, target);
}


// --- Groq remote integration (SỬA LẠI DÙNG SDK) ---
const Groq = require("groq-sdk");
// Giả định .env được load ở nơi gọi (index.js)
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
    console.error("Groq SDK Error (captionAI):", error.message || error);
    throw error;
  }
}

function parseGroqCaptions(rawText, count = 5) {
//... (logic parseGroqCaptions không đổi)
  // try JSON parse first, then newline splitting, then comma splitting
  try {
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed)) return parsed.slice(0, count);
  } catch (e) { /* ignore */ }

  const lines = rawText.split(/\r?\n/).map(s => s.replace(/^[\d\.\-\)]+\s*/, '').trim()).filter(Boolean);
  if (lines.length) return lines.slice(0, count);

  const parts = rawText.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  if (parts.length) return parts.slice(0, count);

  return [truncateToWords(rawText, 10)].slice(0, count);
}

// Public API: keep old signature but allow options.provider = 'groq'
export async function generateCaptions(description = "", options = {}) {
//... (logic generateCaptions không đổi)
  const provider = options.provider || "local";
  const count = options.count || 5;

  if (provider === "local") {
    return localGenerate(description, options);
  }

  // provider === 'groq'
  try {
    const lang = options.lang || "vi";
    const keywords = extractKeywords(description, 3);
    // craft a concise prompt for caption generation
    const prompt = `Generate ${count} short social captions (max 10 words each) in ${lang} for the following post. Use emoji sparingly. Return either a JSON array or newline-separated captions.\n\nPost: "${description}"\n\nKeywords: ${keywords.join(", ")}`;

    const raw = await callGroq(prompt, {
      model: options.model,
      max_tokens: Math.min(200, (options.max_tokens || 80)),
      temperature: options.temperature,
    });

    const captions = parseGroqCaptions(raw, count);
    // final safety fallback to local generator
    if (!captions || captions.length === 0) return localGenerate(description, { ...options, count });
    return captions;
  } catch (err) {
    // on error fallback to local generator
    console.error("Groq caption error:", err);
    return localGenerate(description, { ...options, count });
  }
}