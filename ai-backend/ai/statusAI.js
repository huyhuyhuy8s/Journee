// ai-backend/ai/statusAI.js
const { extractKeywords, truncateToWords, analyzeContent } = require('./captionAI');

// 🆕 Enhanced emotion and activity detection from captions
function detectEmotionFromCaption(caption) {
  const text = caption.toLowerCase();

  const emotions = {
    happy: {
      keywords: ['happy', 'joy', 'excited', 'amazing', 'love', 'great', 'awesome', 'wonderful', 'perfect', 'beautiful', 'vui', 'hạnh phúc', 'tuyệt vời', 'yêu', 'đẹp', 'hoàn hảo', 'tận hưởng'],
      intensity: 0.8,
      status_prefix: {
        vi: ['cảm thấy vui vẻ', 'đang hạnh phúc', 'tràn đầy niềm vui', 'cực kỳ phấn khích'],
        en: ['feeling happy', 'so excited', 'absolutely thrilled', 'filled with joy']
      }
    },
    relaxed: {
      keywords: ['chill', 'relax', 'calm', 'peaceful', 'quiet', 'soft', 'gentle', 'bình yên', 'thư giãn', 'yên tĩnh', 'nhẹ nhàng', 'êm ái'],
      intensity: 0.6,
      status_prefix: {
        vi: ['đang thư giãn', 'cảm thấy bình yên', 'tận hưởng sự yên tĩnh', 'trong trạng thái zen'],
        en: ['feeling relaxed', 'so peaceful', 'in zen mode', 'completely chill']
      }
    },
    grateful: {
      keywords: ['blessed', 'thankful', 'grateful', 'appreciate', 'lucky', 'fortunate', 'may mắn', 'biết ơn', 'cảm kích', 'trân trọng'],
      intensity: 0.7,
      status_prefix: {
        vi: ['cảm thấy biết ơn', 'thật may mắn', 'tràn đầy lòng biết ơn', 'cảm kích sâu sắc'],
        en: ['feeling grateful', 'so blessed', 'truly thankful', 'incredibly lucky']
      }
    },
    adventurous: {
      keywords: ['adventure', 'explore', 'discover', 'journey', 'travel', 'new', 'phiêu lưu', 'khám phá', 'hành trình', 'du lịch', 'mới lạ'],
      intensity: 0.9,
      status_prefix: {
        vi: ['đang phiêu lưu', 'cực kỳ háo hức khám phá', 'sẵn sàng cho cuộc phiêu lưu', 'đam mê khám phá'],
        en: ['feeling adventurous', 'ready to explore', 'in adventure mode', 'craving new experiences']
      }
    },
    nostalgic: {
      keywords: ['memories', 'remember', 'miss', 'old', 'past', 'back', 'kỷ niệm', 'nhớ', 'quá khứ', 'xưa', 'hoài niệm'],
      intensity: 0.5,
      status_prefix: {
        vi: ['đang hoài niệm', 'nhớ về những kỷ niệm', 'chìm đắm trong kỷ niệm', 'cảm thấy hoài cổ'],
        en: ['feeling nostalgic', 'reminiscing about', 'lost in memories', 'thinking back to']
      }
    },
    energetic: {
      keywords: ['energy', 'active', 'dynamic', 'vibrant', 'alive', 'power', 'năng lượng', 'tích cực', 'năng động', 'sôi động', 'mạnh mẽ'],
      intensity: 0.9,
      status_prefix: {
        vi: ['tràn đầy năng lượng', 'cực kỳ năng động', 'sôi động hết cỡ', 'năng lượng tích cực'],
        en: ['full of energy', 'super energetic', 'bursting with life', 'incredibly dynamic']
      }
    }
  };

  let detectedEmotion = 'happy'; // default
  let maxScore = 0;

  for (const [emotion, config] of Object.entries(emotions)) {
    const matches = config.keywords.filter(keyword => text.includes(keyword));
    const score = matches.length * config.intensity;

    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  }

  return emotions[detectedEmotion];
}

// 🆕 Enhanced activity detection from captions
function detectActivityFromCaption(caption) {
  const text = caption.toLowerCase();

  const activities = {
    dining: {
      keywords: ['food', 'eat', 'delicious', 'taste', 'meal', 'restaurant', 'ăn', 'ngon', 'món', 'nhà hàng'],
      activities: {
        vi: ['thưởng thức món ngon', 'đang ăn uống', 'khám phá ẩm thực', 'tận hưởng bữa ăn'],
        en: ['enjoying delicious food', 'dining out', 'exploring cuisine', 'having a great meal']
      }
    },
    traveling: {
      keywords: ['travel', 'trip', 'vacation', 'visit', 'explore', 'journey', 'du lịch', 'chuyến đi', 'khám phá'],
      activities: {
        vi: ['đang du lịch', 'khám phá điểm mới', 'trong chuyến phiêu lưu', 'tận hưởng kỳ nghỉ'],
        en: ['traveling around', 'exploring new places', 'on an adventure', 'enjoying vacation']
      }
    },
    socializing: {
      keywords: ['friends', 'family', 'together', 'party', 'gathering', 'bạn bè', 'gia đình', 'cùng nhau', 'tiệc'],
      activities: {
        vi: ['vui vẻ cùng bạn bè', 'sum họp gia đình', 'có khoảng thời gian tuyệt vời', 'gặp gỡ những người thân yêu'],
        en: ['hanging out with friends', 'spending time with family', 'having a great time together', 'socializing with loved ones']
      }
    },
    relaxing: {
      keywords: ['chill', 'relax', 'rest', 'calm', 'peaceful', 'thư giãn', 'nghỉ ngơi', 'bình yên'],
      activities: {
        vi: ['đang thư giãn', 'tận hưởng khoảnh khắc yên bình', 'nghỉ ngơi thư thái', 'có thời gian cho bản thân'],
        en: ['chilling out', 'taking some time to relax', 'enjoying peaceful moments', 'having some me-time']
      }
    },
    working: {
      keywords: ['work', 'job', 'office', 'project', 'busy', 'làm việc', 'công việc', 'văn phòng', 'dự án', 'bận rộn'],
      activities: {
        vi: ['đang làm việc chăm chỉ', 'tập trung vào dự án', 'bận rộn với công việc', 'cống hiến hết mình'],
        en: ['working hard', 'focused on projects', 'busy with work', 'putting in the effort']
      }
    },
    exercising: {
      keywords: ['workout', 'gym', 'exercise', 'sport', 'fitness', 'tập luyện', 'thể dục', 'thể thao'],
      activities: {
        vi: ['đang tập luyện', 'chăm chỉ tập thể dục', 'duy trì sức khỏe', 'năng động với thể thao'],
        en: ['working out', 'staying active', 'exercising regularly', 'keeping fit']
      }
    }
  };

  for (const [activity, config] of Object.entries(activities)) {
    if (config.keywords.some(keyword => text.includes(keyword))) {
      return config.activities;
    }
  }

  return null;
}

// 🆕 Generate AI-powered status from caption
function generateStatusFromCaption(caption = "", options = {}) {
  const { lang = "vi", count = 5, includeActivity = true, includeEmotion = true } = options;

  console.log(`📱 [STATUS_AI] Generating status from caption: "${caption.substring(0, 50)}..."`);

  const emotion = detectEmotionFromCaption(caption);
  const activity = detectActivityFromCaption(caption);
  const keywords = extractKeywords(caption, 2);

  console.log(`� [STATUS_AI] Detected emotion: ${Object.keys({ happy: 0 }).find(key => emotion.keywords)}, Activity: ${activity ? 'detected' : 'none'}`);

  const statusList = [];

  // 🆕 Generate emotion-based status
  if (includeEmotion && emotion) {
    const emotionPrefixes = emotion.status_prefix[lang.startsWith("en") ? "en" : "vi"];
    for (let i = 0; i < Math.ceil(count / 2) && i < emotionPrefixes.length; i++) {
      const keyword = keywords[i % keywords.length] || '';
      if (keyword) {
        statusList.push(`${emotionPrefixes[i]} ${lang.startsWith("en") ? "about" : "vì"} ${keyword}`);
      } else {
        statusList.push(emotionPrefixes[i]);
      }
    }
  }

  // 🆕 Generate activity-based status
  if (includeActivity && activity) {
    const activityPhrases = activity[lang.startsWith("en") ? "en" : "vi"];
    for (let i = 0; i < Math.floor(count / 2) && i < activityPhrases.length; i++) {
      statusList.push(activityPhrases[i]);
    }
  }

  // 🆕 Fill remaining slots with keyword-based status
  while (statusList.length < count) {
    const keyword = keywords[statusList.length % Math.max(keywords.length, 1)] || '';
    if (lang.startsWith("en")) {
      const templates = [
        `enjoying ${keyword}`,
        `loving this ${keyword}`,
        `having fun with ${keyword}`,
        `blessed with ${keyword}`,
        `grateful for ${keyword}`
      ];
      statusList.push(keyword ? templates[statusList.length % templates.length] : "having a great time");
    } else {
      const templates = [
        `đang tận hưởng ${keyword}`,
        `yêu thích ${keyword} này`,
        `vui vẻ với ${keyword}`,
        `may mắn có ${keyword}`,
        `biết ơn vì ${keyword}`
      ];
      statusList.push(keyword ? templates[statusList.length % templates.length] : "đang có khoảng thời gian tuyệt vời");
    }
  }

  return statusList.slice(0, count).map(status => truncateToWords(status, 15));
}

// 🆕 Enhanced Groq integration for status generation
let Groq;
try {
  Groq = require("groq-sdk");
} catch (error) {
  console.warn("⚠️ [GROQ] SDK not available for status generation");
  Groq = null;
}

let groqClient = null;
if (Groq && process.env.GROQ_API_KEY) {
  try {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } catch (error) {
    console.error("❌ [GROQ] Status AI client failed:", error.message);
  }
}

async function generateStatusWithGroq(caption, options = {}) {
  if (!groqClient) {
    throw new Error("Groq not available for status generation");
  }

  const { lang = "vi", count = 5 } = options;

  const prompt = `You are an expert at generating social media status updates. Based on this caption, create ${count} different status updates (like "User is feeling happy about...") that express what the person might be feeling or doing.

Caption: "${caption}"

Requirements:
- Generate status in ${lang} language
- Each status should be in format "feeling [emotion]" or "doing [activity]"
- Keep each status under 10 words
- Make them relatable and natural
- Return as JSON array

Example format for Vietnamese: ["cảm thấy hạnh phúc về...", "đang tận hưởng..."]
Example format for English: ["feeling excited about...", "enjoying some..."]`;

  try {
    const response = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      max_tokens: 150,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content.trim();

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, count).map(status => truncateToWords(status, 15));
      }
    } catch (e) {
      // Parse as text
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^[\d\-•*]+\.?\s*/, '').trim())
        .slice(0, count)
        .map(status => truncateToWords(status, 15));

      return lines;
    }
  } catch (error) {
    console.error("❌ [GROQ] Status generation failed:", error.message);
    throw error;
  }
}

// 🆕 Main status generation function
async function generateStatus(caption = "", options = {}) {
  const safeCaption = caption || "";
  const {
    provider = "local",
    lang = "vi",
    count = 5,
    includeActivity = true,
    includeEmotion = true
  } = options;

  console.log(`📱 [STATUS_AI] Generating ${count} status updates using ${provider} provider`);
  console.log(`📝 [STATUS_AI] From caption: "${safeCaption.substring(0, 100)}${safeCaption.length > 100 ? '...' : ''}"`);

  if (provider === "local") {
    const result = generateStatusFromCaption(safeCaption, { lang, count, includeActivity, includeEmotion });
    console.log(`✅ [STATUS_AI] Local generation complete: ${result.length} status updates`);
    return result;
  }

  // Groq generation
  try {
    const result = await generateStatusWithGroq(safeCaption, { lang, count });
    console.log(`✅ [STATUS_AI] Groq generation complete: ${result.length} status updates`);
    return result;
  } catch (error) {
    console.warn("⚠️ [STATUS_AI] Groq failed, falling back to local generation");
    return generateStatusFromCaption(safeCaption, { lang, count, includeActivity, includeEmotion });
  }
}

// Legacy functions for backward compatibility
function generateStatusUpdate(description = "", options = {}) {
  return generateStatusFromCaption(description, options);
}

function detectStatusCategory(keywords, description = "") {
  const context = analyzeContent(description);
  const emotion = detectEmotionFromCaption(description);
  return { context, emotion: Object.keys({ happy: 0 })[0] }; // simplified for compatibility
}

function generateHashtags(keywords, category = 'general', lang = 'vi') {
  const hashtagMap = {
    vi: {
      travel: ['#dulich', '#khampha', '#vietnam', '#travel'],
      food: ['#amthuc', '#ngon', '#food', '#foodie'],
      mood: ['#mood', '#vui', '#happy', '#goodvibes'],
      activity: ['#hoatdong', '#lifestyle', '#daily'],
      general: ['#cuocsong', '#khoanhkhac', '#life', '#moment']
    },
    en: {
      travel: ['#travel', '#explore', '#adventure', '#vacation'],
      food: ['#food', '#delicious', '#foodie', '#yummy'],
      mood: ['#mood', '#happy', '#blessed', '#goodvibes'],
      activity: ['#lifestyle', '#daily', '#active', '#life'],
      general: ['#life', '#moment', '#blessed', '#memories']
    }
  };

  const langTags = hashtagMap[lang.startsWith("en") ? "en" : "vi"];
  const categoryTags = langTags[category] || langTags.general;
  const keywordTags = keywords.map(k => `#${k.replace(/\s+/g, '').toLowerCase()}`);

  return [...categoryTags, ...keywordTags].slice(0, 5);
}

module.exports = {
  generateStatus,
  generateStatusFromCaption,
  generateStatusUpdate,
  generateHashtags,
  detectStatusCategory,
  detectEmotionFromCaption,
  detectActivityFromCaption
};
