/**
 * Centralized Logger Utility
 * Development-only logging to prevent security leaks in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message, ...args) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message, ...args) => {
    // Always log errors, but sanitize in production
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },

  // Security-safe logging (never logs sensitive data)
  auth: (action, userId = null) => {
    if (isDevelopment) {
      console.info(`[AUTH] ${action}${userId ? ` for user: ${userId}` : ''}`);
    }
  },

  api: (method, endpoint, status = null) => {
    if (isDevelopment) {
      console.info(`[API] ${method} ${endpoint}${status ? ` - ${status}` : ''}`);
    }
  },

  weather: (action, details = null) => {
    if (isDevelopment) {
      console.info(`[WEATHER] ${action}${details ? `: ${details}` : ''}`);
    }
  }
};

export default logger;
