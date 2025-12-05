// ai-backend/index.js or routes/captions.js
const express = require('express');
const { generateCaptions } = require('./ai/captionAI');

const app = express();

// 🆕 Ensure body parsing middleware is properly configured
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🆕 Enhanced caption generation endpoint with proper error handling
app.post('/api/captions/generate', async (req, res) => {
  try {
    console.log('📝 [CAPTION] Incoming request:', {
      headers: req.headers['content-type'],
      bodyExists: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : 'none',
      rawBody: req.body
    });

    // 🆕 Handle missing or empty request body
    if (!req.body) {
      console.warn('⚠️ [CAPTION] Request body is missing');
      return res.status(400).json({
        error: 'Request body is required',
        code: 'MISSING_BODY',
        details: {
          expected: {
            description: 'string (optional)',
            options: 'object (optional)'
          }
        }
      });
    }

    // 🆕 Destructure with default values to handle missing properties
    const {
      description = '',
      options = {}
    } = req.body;

    console.log('🔍 [CAPTION] Processing request:', {
      description: description ? `"${description.substring(0, 50)}..."` : 'empty',
      options: JSON.stringify(options)
    });

    // 🆕 Validate and set default options
    const captionOptions = {
      provider: options.provider || 'local',
      lang: options.lang || 'vi',
      count: Math.min(options.count || 5, 10), // Max 10 captions
      model: options.model || 'llama-3.1-8b-instant',
      max_tokens: options.max_tokens || 120,
      temperature: options.temperature ?? 0.8
    };

    console.log('⚙️ [CAPTION] Using options:', captionOptions);

    // Generate captions
    const startTime = Date.now();
    const captions = await generateCaptions(description, captionOptions);
    const processingTime = Date.now() - startTime;

    console.log('✅ [CAPTION] Generated successfully:', {
      captionCount: captions.length,
      processingTime: `${processingTime}ms`,
      provider: captionOptions.provider
    });

    // Send response
    res.json({
      success: true,
      data: {
        captions,
        metadata: {
          provider: captionOptions.provider,
          processingTime,
          inputLength: description.length,
          language: captionOptions.lang
        }
      }
    });

  } catch (error) {
    console.error('❌ [CAPTION] Generation failed:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    // Handle specific error types
    if (error.message.includes('Groq')) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        code: 'AI_SERVICE_ERROR',
        details: {
          message: 'Falling back to local generation',
          provider: 'groq_failed'
        }
      });
    }

    res.status(500).json({
      error: 'Caption generation failed',
      code: 'GENERATION_ERROR',
      details: {
        message: error.message
      }
    });
  }
});

// 🆕 Add endpoint for testing body parsing
app.post('/api/captions/test', (req, res) => {
  res.json({
    success: true,
    received: {
      hasBody: !!req.body,
      contentType: req.headers['content-type'],
      bodyContent: req.body,
      bodyKeys: req.body ? Object.keys(req.body) : null
    }
  });
});
