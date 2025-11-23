require('module-alias/register');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { adminDb } = require('./config/firebase');

const dotenv = require('dotenv');
dotenv.config();

const { requestLogger, errorLogger, cleanupOldLogs } = require('./middlewares/logger');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const journalRoutes = require('./routes/journal');

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://172.16.68.240:8081',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}

// ✅ Middleware order is important
app.use(bodyParser.json());
app.use(cors(corsOptions));

// ✅ Add request logger AFTER body parser but BEFORE routes
app.use(requestLogger);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/journals', journalRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Journee API Server',
    version: '1.0.0',
    status: 'Running'
  });
});

// ✅ Add error logger BEFORE your error handler
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

// ✅ Setup log cleanup on server start
if (process.env.NODE_ENV === 'production') {
  cleanupOldLogs(30); // Keep logs for 30 days

  // Schedule daily cleanup
  setInterval(() => {
    cleanupOldLogs(30);
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📁 Logs will be stored in ./logs directory`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

  // ✅ Log server startup
  console.log(`⚡ Journee API Server started successfully at ${new Date().toISOString()}`);
});

module.exports = app;
