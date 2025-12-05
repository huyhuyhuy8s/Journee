const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

// Load OpenAPI specification
const openapiDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../openapi.json'), 'utf8')
);

// Swagger UI options
const swaggerOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
  customSiteTitle: 'Journee AI Backend API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
};

module.exports = {
  swaggerUi,
  openapiDocument,
  swaggerOptions
};
