require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { validateCaptionRequest } = require('./middleware/validation');
const { generateStatus } = require('./ai/statusAI');
const { generateCaptions } = require('./ai/captionAI');
const { swaggerUi, openapiDocument, swaggerOptions } = require('./config/swagger');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'https://journee-1gt3.onrender.com'],
  credentials: true
}));


// 🆕 Body parsing with error handling
app.use(express.json({
  limit: '10mb',
  type: 'application/json'
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, swaggerOptions));

app.use((req, res, next) => {
  console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`🔍 Headers:`, {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'user-agent': req.headers['user-agent']?.substring(0, 50) || 'unknown'
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Journee AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ai_services: {
      caption_generator: 'ready',
      groq_integration: !!process.env.GROQ_API_KEY ? 'configured' : 'not_configured'
    }
  });
});

// 🆕 Caption generation with validation
app.post('/api/captions/generate', validateCaptionRequest, async (req, res) => {
  try {
    const { description = '', options = {} } = req.body;

    const captionOptions = {
      provider: options.provider || 'local',
      lang: options.lang || 'vi',
      count: Math.min(options.count || 5, 10),
      model: options.model || 'llama-3.1-8b-instant',
      max_tokens: options.max_tokens || 120,
      temperature: options.temperature ?? 0.8
    };

    const startTime = Date.now();
    const captions = await generateCaptions(description, captionOptions);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        captions,
        metadata: {
          provider: captionOptions.provider,
          processingTime,
          inputLength: description.length,
          language: captionOptions.lang,
          count: captions.length
        }
      }
    });

  } catch (error) {
    console.error('❌ [CAPTION] Error:', error);
    res.status(500).json({
      error: 'Caption generation failed',
      code: 'GENERATION_ERROR',
      details: { message: error.message }
    });
  }
});

app.post('/api/status/generate', validateCaptionRequest, async (req, res) => {
  try {
    const { description = '', options = {} } = req.body;

    const statusOptions = {
      provider: options.provider || 'local',
      lang: options.lang || 'vi',
      count: Math.min(options.count || 5, 10),
      category: options.category || null, // auto-detect if not provided
      includeHashtags: options.includeHashtags || false
    };

    console.log('📱 [STATUS] Processing request:', {
      description: description ? `"${description.substring(0, 50)}..."` : 'empty',
      options: JSON.stringify(statusOptions)
    });

    const startTime = Date.now();
    const result = await generateStatus(description, statusOptions);
    const processingTime = Date.now() - startTime;

    console.log('✅ [STATUS] Generated successfully:', {
      count: Array.isArray(result) ? result.length : result.status?.length || 0,
      processingTime: `${processingTime}ms`,
      hasHashtags: !Array.isArray(result)
    });

    // Handle different response formats
    const response = {
      success: true,
      data: Array.isArray(result) ? {
        status: result,
        metadata: {
          language: statusOptions.lang,
          count: result.length,
          processingTime,
          category: 'general',
          hasHashtags: false
        }
      } : {
        ...result,
        metadata: {
          ...result.metadata,
          processingTime
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ [STATUS] Generation failed:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    res.status(500).json({
      error: 'Status generation failed',
      code: 'GENERATION_ERROR',
      details: { message: error.message }
    });
  }
});

app.post('/api/hashtags/generate', validateCaptionRequest, async (req, res) => {
  try {
    const { description = '', options = {} } = req.body;
    const { generateHashtags, extractKeywords, detectStatusCategory } = require('./ai/statusAI');

    const keywords = extractKeywords(description, 5);
    const category = options.category || detectStatusCategory(keywords, description);
    const lang = options.lang || 'vi';

    const hashtags = generateHashtags(keywords, category, lang);

    res.json({
      success: true,
      data: {
        hashtags,
        category,
        keywords,
        metadata: {
          language: lang,
          count: hashtags.length
        }
      }
    });

  } catch (error) {
    console.error('❌ [HASHTAG] Generation failed:', error);
    res.status(500).json({
      error: 'Hashtag generation failed',
      code: 'GENERATION_ERROR',
      details: { message: error.message }
    });
  }
});

// Test endpoint
app.post('/api/test', (req, res) => {
  res.json({
    success: true,
    received: {
      body: req.body,
      hasDescription: 'description' in (req.body || {}),
      bodyType: typeof req.body,
      contentType: req.headers['content-type']
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🤖 Journee AI Backend running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔧 Body parsing: JSON + URL-encoded`);
  console.log(`🎯 Caption endpoint: POST /api/captions/generate`);
  console.log(`📱 Status endpoint: POST /api/status/generate`);
  console.log(`🏷️ Hashtag endpoint: POST /api/hashtags/generate`);
  console.log(`🧪 Test endpoint: POST /api/test`);
});

// 🆕 Graceful error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});
