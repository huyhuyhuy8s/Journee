// Back-end use CommonJS for importing packages

const express = require('express');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/users');

// Import logger middleware
const { requestLogger, errorLogger, cleanupOldLogs } = require('./middlewares/logger');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Add request logger middleware (should be early in the middleware stack)
app.use(requestLogger);

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Journee API Server</h1><p>Authentication endpoints available</p>');
});

// User routes
app.use('/api', userRoutes);

// Error logging middleware (should be before error handling)
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`  POST /api/login`);
  console.log(`  POST /api/register`);
  console.log(`  POST /api/logout`);
  console.log(`  GET  /api/validate-token`);
  console.log(`  GET  /api/profile`);
  console.log(`  PUT  /api/profile`);
  console.log(`  GET  /api/users`);

  // Clean up old logs on server start
  cleanupOldLogs(30); // Keep logs for 30 days
});
