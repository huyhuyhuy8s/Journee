const validateCaptionRequest = (req, res, next) => {
  const contentType = req.headers['content-type'];
  if (contentType && !contentType.includes('application/json')) {
    return res.status(415).json({
      error: 'Unsupported Media Type',
      code: 'INVALID_CONTENT_TYPE',
      details: {
        received: contentType,
        expected: 'application/json'
      }
    });
  }

  // Ensure req.body exists
  if (req.body === undefined) {
    return res.status(400).json({
      error: 'Request body is missing or could not be parsed',
      code: 'BODY_PARSING_ERROR',
      details: {
        hint: 'Make sure Content-Type is application/json and body is valid JSON'
      }
    });
  }

  // Set defaults for missing properties
  if (typeof req.body !== 'object' || req.body === null) {
    req.body = {};
  }

  if (!req.body.description) {
    req.body.description = '';
  }

  if (!req.body.options || typeof req.body.options !== 'object') {
    req.body.options = {};
  }

  console.log('✅ [VALIDATION] Request validated and normalized');
  next();
};

module.exports = { validateCaptionRequest };
