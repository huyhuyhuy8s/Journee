// ai-backend/ai/captionAI.js
function truncateToWords(text, maxWords = 10) {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  return words.slice(0, maxWords).join(" ");
}

function extractKeywords(text, max = 3) {
  if (!text) return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ");
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const uniq = Array.from(new Set(tokens)).filter(t => t.length > 2);
  return uniq.slice(0, max);
}

// 🆕 Enhanced context analysis for better captions
function analyzeContent(description) {
  const text = description.toLowerCase();

  const contexts = {
    photo: {
      keywords: ['photo', 'picture', 'snapshot', 'selfie', 'ảnh', 'hình', 'chụp'],
      type: 'photo'
    },
    food: {
      keywords: ['food', 'eat', 'delicious', 'taste', 'meal', 'ăn', 'ngon', 'món', 'thức ăn'],
      type: 'food'
    },
    travel: {
      keywords: ['travel', 'trip', 'vacation', 'visit', 'explore', 'du lịch', 'chuyến đi', 'khám phá'],
      type: 'travel'
    },
    nature: {
      keywords: ['sunset', 'beach', 'mountain', 'nature', 'sky', 'hoàng hôn', 'biển', 'núi', 'thiên nhiên'],
      type: 'nature'
    },
    social: {
      keywords: ['friends', 'family', 'together', 'party', 'bạn bè', 'gia đình', 'cùng nhau', 'tiệc'],
      type: 'social'
    },
    mood: {
      keywords: ['happy', 'sad', 'excited', 'tired', 'relaxed', 'vui', 'buồn', 'hào hứng', 'mệt'],
      type: 'mood'
    },
    activity: {
      keywords: ['working', 'studying', 'playing', 'exercising', 'làm việc', 'học', 'chơi', 'tập'],
      type: 'activity'
    }
  };

  for (const [key, context] of Object.entries(contexts)) {
    if (context.keywords.some(keyword => text.includes(keyword))) {
      return context.type;
    }
  }

  return 'general';
}

// 🆕 Enhanced local caption generation with context awareness
function localGenerate(description = "", options = {}) {
  const { lang = "vi", count = 5 } = options;
  const keywords = extractKeywords(description, 3);
  const context = analyzeContent(description);

  console.log(`🏠 [LOCAL_GEN] Context: ${context}, Keywords: [${keywords.join(', ')}]`);

  // 🆕 Context-specific templates for better captions
  const contextTemplates = {
    vi: {
      photo: [
        k => `${k} trong khoảnh khắc này`,
        k => `Lưu giữ ${k} mãi mãi`,
        k => `${k} đẹp không góc chết`,
        k => `Capture ${k} hoàn hảo`,
        k => `${k} - một khoảnh khắc đáng nhớ`
      ],
      food: [
        k => `${k} ngon không cưỡng nổi`,
        k => `Thưởng thức ${k} cực đỉnh`,
        k => `${k} - hương vị tuyệt hảo`,
        k => `Không thể từ chối ${k}`,
        k => `${k} làm say đắm lòng người`
      ],
      travel: [
        k => `Khám phá ${k} tuyệt vời`,
        k => `${k} - hành trình đáng nhớ`,
        k => `Lạc lối trong ${k}`,
        k => `${k} đẹp như tranh vẽ`,
        k => `Phiêu lưu tại ${k}`
      ],
      nature: [
        k => `${k} thiên nhiên kỳ diệu`,
        k => `Mê đắm ${k} này`,
        k => `${k} bình yên tuyệt đối`,
        k => `Hoà mình với ${k}`,
        k => `${k} - món quà thiên nhiên`
      ],
      social: [
        k => `${k} cùng những người thương`,
        k => `Khoảnh khắc ${k} ý nghĩa`,
        k => `${k} - tình bạn thật đẹp`,
        k => `Chia sẻ ${k} vui vẻ`,
        k => `${k} tràn đầy tiếng cười`
      ],
      mood: [
        k => `Cảm giác ${k} tràn đầy`,
        k => `Tâm trạng ${k} hôm nay`,
        k => `${k} - năng lượng tích cực`,
        k => `Mood ${k} cả ngày`,
        k => `${k} lan tỏa khắp nơi`
      ],
      activity: [
        k => `Đam mê ${k} không ngừng`,
        k => `${k} - hoạt động yêu thích`,
        k => `Tận hưởng ${k} tuyệt vời`,
        k => `${k} mang lại niềm vui`,
        k => `Cống hiến hết mình cho ${k}`
      ],
      general: [
        k => `${k} đẹp tự nhiên`,
        k => `Khoảnh khắc ${k}`,
        k => `${k} và nắng`,
        k => `Yêu ${k}`,
        k => `${k} đáng nhớ`
      ]
    },
    en: {
      photo: [
        k => `Capturing ${k} perfectly`,
        k => `${k} in this moment`,
        k => `Perfect shot of ${k}`,
        k => `${k} memories made`,
        k => `Freezing ${k} in time`
      ],
      food: [
        k => `${k} absolutely delicious`,
        k => `Savoring every bite of ${k}`,
        k => `${k} - pure perfection`,
        k => `Can't resist this ${k}`,
        k => `${k} melts my heart`
      ],
      travel: [
        k => `Exploring amazing ${k}`,
        k => `${k} - journey of dreams`,
        k => `Lost in beautiful ${k}`,
        k => `${k} takes my breath away`,
        k => `Adventure awaits at ${k}`
      ],
      nature: [
        k => `${k} - nature's masterpiece`,
        k => `Mesmerized by ${k}`,
        k => `${k} brings inner peace`,
        k => `Connected with ${k}`,
        k => `${k} - pure magic`
      ],
      social: [
        k => `${k} with loved ones`,
        k => `Meaningful ${k} together`,
        k => `${k} - friendship goals`,
        k => `Sharing ${k} moments`,
        k => `${k} filled with laughter`
      ],
      mood: [
        k => `Feeling ${k} today`,
        k => `${k} energy flowing`,
        k => `${k} - positive vibes`,
        k => `${k} mood activated`,
        k => `Radiating ${k} everywhere`
      ],
      activity: [
        k => `Passionate about ${k}`,
        k => `${k} - my favorite thing`,
        k => `Enjoying every ${k}`,
        k => `${k} brings pure joy`,
        k => `Dedicated to ${k}`
      ],
      general: [
        k => `${k} vibes`,
        k => `Moments of ${k}`,
        k => `Simply ${k}`,
        k => `Love this ${k}`,
        k => `${k} memories`
      ]
    }
  };

  const langTemplates = contextTemplates[lang.startsWith("en") ? "en" : "vi"];
  const templates = langTemplates[context] || langTemplates.general;

  const out = new Set();
  const target = count;

  // 🆕 Context-aware generic captions for empty descriptions
  if (keywords.length === 0) {
    const contextGeneric = {
      vi: {
        photo: ["Khoảnh khắc đẹp", "Lưu giữ ký ức", "Góc nhìn tuyệt vời", "Khung hình hoàn hảo"],
        food: ["Ngon không thể tả", "Hương vị tuyệt hảo", "Món ăn yêu thích", "Thưởng thức đam mê"],
        travel: ["Hành trình tuyệt vời", "Khám phá điều mới", "Phiêu lưu thú vị", "Nơi đáng đến"],
        nature: ["Thiên nhiên kỳ diệu", "Cảnh đẹp mê hồn", "Bình yên tuyệt đối", "Hoà quyện thiên nhiên"],
        social: ["Khoảnh khắc bên nhau", "Tình bạn đẹp", "Cùng nhau vui vẻ", "Chia sẻ niềm vui"],
        mood: ["Tâm trạng tuyệt vời", "Cảm xúc tràn đầy", "Năng lượng tích cực", "Vui vẻ hạnh phúc"],
        activity: ["Hoạt động yêu thích", "Đam mê cháy bỏng", "Tận hưởng từng giây", "Niềm vui bất tận"],
        general: ["Khoảnh khắc đáng yêu", "Tận hưởng cuộc sống", "Bình yên thôi", "Hạnh phúc giản đơn"]
      },
      en: {
        photo: ["Beautiful moment", "Captured memories", "Perfect angle", "Picture perfect"],
        food: ["Absolutely delicious", "Perfect flavor", "Favorite dish", "Pure indulgence"],
        travel: ["Amazing journey", "New discoveries", "Adventure time", "Must-visit place"],
        nature: ["Nature's wonder", "Breathtaking view", "Pure tranquility", "Natural beauty"],
        social: ["Together moments", "Friendship goals", "Good times shared", "Joyful gathering"],
        mood: ["Great vibes", "Positive energy", "Happy feelings", "Pure joy"],
        activity: ["Favorite activity", "Passionate moments", "Pure enjoyment", "Living the dream"],
        general: ["Simple joys", "Living the moment", "Good vibes", "Pure happiness"]
      }
    };

    const pool = contextGeneric[lang.startsWith("en") ? "en" : "vi"][context] ||
      contextGeneric[lang.startsWith("en") ? "en" : "vi"].general;

    for (let i = 0; i < target; i++) {
      out.add(truncateToWords(pool[i % pool.length], 10));
    }
    return Array.from(out).slice(0, target);
  }

  // Generate context-aware captions from keywords
  for (let i = 0; i < keywords.length && out.size < target; i++) {
    const k = keywords[i];
    for (let t = 0; t < templates.length && out.size < target; t++) {
      out.add(truncateToWords(templates[(i + t) % templates.length](k), 10));
    }
  }

  // Fill remaining with mixed templates
  const allTemplates = Object.values(langTemplates).flat();
  let idx = 0;
  while (out.size < target && idx < keywords.length) {
    const k = keywords[idx];
    out.add(truncateToWords(allTemplates[idx % allTemplates.length](k), 10));
    idx++;
  }

  // Final fallback
  const fallback = lang.startsWith("en") ?
    ["Perfect moment", "Good vibes only", "Simply amazing", "Love this", "Beautiful day"] :
    ["Khoảnh khắc hoàn hảo", "Chỉ toàn năng lượng tích cực", "Đơn giản tuyệt vời", "Yêu điều này", "Ngày đẹp trời"];

  let j = 0;
  while (out.size < target) {
    out.add(truncateToWords(fallback[j % fallback.length], 10));
    j++;
  }

  return Array.from(out).slice(0, target);
}

// 🆕 Enhanced Groq integration with smarter prompts
let Groq;
try {
  Groq = require("groq-sdk");
  console.log("✅ [GROQ] SDK loaded successfully");
} catch (error) {
  console.warn("⚠️ [GROQ] SDK not available:", error.message);
  Groq = null;
}

let groqClient = null;

function initializeGroq() {
  if (!Groq) return false;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return false;

  try {
    groqClient = new Groq({ apiKey });
    console.log("✅ [GROQ] Client initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ [GROQ] Client initialization failed:", error.message);
    return false;
  }
}

const groqAvailable = initializeGroq();

async function callGroq(prompt, options = {}) {
  if (!groqAvailable || !groqClient) {
    throw new Error("Groq SDK not available");
  }

  try {
    console.log("🤖 [GROQ] Making API call...");

    const response = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: options.model || "llama-3.1-8b-instant",
      max_tokens: options.max_tokens || 120,
      temperature: options.temperature ?? 0.8,
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from Groq API");
    }

    const content = response.choices[0].message.content.trim();
    console.log("✅ [GROQ] API call successful");
    return content;

  } catch (error) {
    console.error("❌ [GROQ] API call failed:", error.message);
    throw error;
  }
}

function parseGroqCaptions(rawText, targetCount) {
  if (!rawText) return [];

  try {
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, targetCount).map(cap => truncateToWords(cap, 10));
    }
  } catch (e) {
    // Continue with text parsing
  }

  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[\d\-•*]+\.?\s*/, '').trim())
    .filter(line => line.length > 0 && line.length < 100)
    .slice(0, targetCount)
    .map(cap => truncateToWords(cap, 10));

  return lines;
}

// 🆕 Enhanced main generation function with better AI prompts
async function generateCaptions(description = "", options = {}) {
  const safeDescription = description || "";
  const provider = options.provider || "local";
  const count = Math.max(1, Math.min(options.count || 5, 10));

  console.log(`🎯 [CAPTION_AI] Generating ${count} captions using ${provider} provider`);
  console.log(`📝 [CAPTION_AI] Input: "${safeDescription.substring(0, 100)}${safeDescription.length > 100 ? '...' : ''}"`);

  if (provider === "local") {
    const result = localGenerate(safeDescription, options);
    console.log(`✅ [CAPTION_AI] Local generation complete: ${result.length} captions`);
    return result;
  }

  // Enhanced Groq generation with smarter prompts
  try {
    const lang = options.lang || "vi";
    const context = analyzeContent(safeDescription);
    const keywords = extractKeywords(safeDescription, 3);

    // 🆕 Smart prompt construction based on context and content
    let prompt;
    if (!safeDescription.trim()) {
      prompt = `You are a creative social media caption writer. Generate ${count} short, engaging captions (max 8 words each) in ${lang} for general social media posts. Make them relatable, trendy, and positive. Use minimal emojis. Return as a JSON array.

Example format: ["Caption 1", "Caption 2", "Caption 3"]`;
    } else {
      prompt = `You are a creative social media caption writer. Based on this description, generate ${count} engaging captions (max 8 words each) in ${lang} that capture the essence and mood perfectly.

Description: "${safeDescription}"
Context: ${context}
Key elements: ${keywords.join(", ")}

Requirements:
- Keep captions short and punchy (max 8 words)
- Match the tone and context of the description
- Make them relatable and engaging
- Use minimal emojis
- Return as JSON array format

Example format: ["Caption 1", "Caption 2", "Caption 3"]`;
    }

    console.log(`🤖 [CAPTION_AI] Using context: ${context}, prompt length: ${prompt.length}`);

    const raw = await callGroq(prompt, {
      model: options.model,
      max_tokens: Math.min(200, (options.max_tokens || 120)),
      temperature: options.temperature ?? 0.8,
    });

    console.log(`📥 [CAPTION_AI] Groq response length: ${raw.length}`);

    const captions = parseGroqCaptions(raw, count);

    if (!captions || captions.length === 0) {
      console.warn('⚠️ [CAPTION_AI] Groq returned empty results, falling back to local');
      return localGenerate(safeDescription, { ...options, count });
    }

    console.log(`✅ [CAPTION_AI] Groq generation complete: ${captions.length} captions`);
    return captions;

  } catch (err) {
    console.error("❌ [CAPTION_AI] Groq error, falling back to local:", err.message);
    return localGenerate(safeDescription, { ...options, count });
  }
}

module.exports = {
  generateCaptions,
  localGenerate,
  extractKeywords,
  truncateToWords,
  analyzeContent
};
