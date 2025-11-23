const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper function to get current timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Helper function to get log filename based on current date
const getLogFileName = (type = 'access') => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `${type}-${date}.log`);
};

// Helper function to write to log file
const writeToLogFile = (message, type = 'access') => {
  const logFile = getLogFileName(type);
  const logEntry = `${getTimestamp()} - ${message}\n`;

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    timestamp: getTimestamp()
  };

  // Log request
  const requestMessage = `${requestInfo.method} ${requestInfo.url} - IP: ${requestInfo.ip} - UserAgent: ${requestInfo.userAgent}`;
  console.log(`📥 [REQUEST] ${requestMessage}`);
  writeToLogFile(`[REQUEST] ${requestMessage}`);

  // Capture response details
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    const responseInfo = {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: data ? Buffer.byteLength(data, 'utf8') : 0
    };

    // Log response
    const responseMessage = `${requestInfo.method} ${requestInfo.url} - ${responseInfo.statusCode} - ${responseInfo.duration} - ${responseInfo.contentLength} bytes`;

    // Color code based on status
    let logLevel = '📤';
    if (res.statusCode >= 400) {
      logLevel = '❌';
      // Also log errors to error log file
      writeToLogFile(`[ERROR] ${responseMessage}`, 'error');
    } else if (res.statusCode >= 300) {
      logLevel = '📝';
    } else {
      logLevel = '✅';
    }

    console.log(`${logLevel} [RESPONSE] ${responseMessage}`);
    writeToLogFile(`[RESPONSE] ${responseMessage}`);

    originalSend.call(this, data);
  };

  next();
};

// Error logger middleware
const errorLogger = (err, req, res, next) => {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    timestamp: getTimestamp()
  };

  // Log error to console
  console.error(`💥 [ERROR] ${errorInfo.method} ${errorInfo.url} - ${errorInfo.message}`);
  console.error(errorInfo.stack);

  // Log error to file
  const errorMessage = `[ERROR] ${errorInfo.method} ${errorInfo.url} - IP: ${errorInfo.ip} - Message: ${errorInfo.message} - Stack: ${errorInfo.stack}`;
  writeToLogFile(errorMessage, 'error');

  next(err);
};

// Authentication logger (for login/logout events)
const authLogger = {
  logLogin: (email, success, ip, userAgent) => {
    const status = success ? 'SUCCESS' : 'FAILED';
    const message = `[AUTH] Login ${status} - Email: ${email} - IP: ${ip} - UserAgent: ${userAgent}`;

    console.log(`🔐 ${message}`);
    writeToLogFile(message, 'auth');
  },

  logRegister: (email, success, ip, userAgent) => {
    const status = success ? 'SUCCESS' : 'FAILED';
    const message = `[AUTH] Register ${status} - Email: ${email} - IP: ${ip} - UserAgent: ${userAgent}`;

    console.log(`📝 ${message}`);
    writeToLogFile(message, 'auth');
  },

  logLogout: (email, ip, userAgent) => {
    const message = `[AUTH] Logout - Email: ${email} - IP: ${ip} - UserAgent: ${userAgent}`;

    console.log(`🚪 ${message}`);
    writeToLogFile(message, 'auth');
  }
};

// Cleanup old log files (optional)
const cleanupOldLogs = (daysToKeep = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  fs.readdir(logsDir, (err, files) => {
    if (err) return;

    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        if (stats.mtime < cutoffDate) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              console.log(`🗑️ Cleaned up old log file: ${file}`);
            }
          });
        }
      });
    });
  });
};

module.exports = {
  requestLogger,
  errorLogger,
  authLogger,
  cleanupOldLogs
};
