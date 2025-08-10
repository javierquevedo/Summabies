/**
 * Centralized logging utilities
 * Provides consistent logging format and levels
 */

/**
 * Log levels for different types of messages
 */
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

/**
 * Format log message with timestamp and level
 * 
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {string} - Formatted log message
 */
function formatLogMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
}

/**
 * Log info message
 * 
 * @param {string} message - Message to log
 * @param {Object} data - Additional data
 */
function info(message, data = null) {
  console.log(formatLogMessage(LOG_LEVELS.INFO, message, data));
}

/**
 * Log warning message
 * 
 * @param {string} message - Message to log
 * @param {Object} data - Additional data
 */
function warn(message, data = null) {
  console.warn(formatLogMessage(LOG_LEVELS.WARN, message, data));
}

/**
 * Log error message
 * 
 * @param {string} message - Message to log
 * @param {Object} data - Additional data
 */
function error(message, data = null) {
  console.error(formatLogMessage(LOG_LEVELS.ERROR, message, data));
}

/**
 * Log debug message (only in development)
 * 
 * @param {string} message - Message to log
 * @param {Object} data - Additional data
 */
function debug(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatLogMessage(LOG_LEVELS.DEBUG, message, data));
  }
}

/**
 * Legacy logging functions for backward compatibility
 */
function logAnyMessage(message) {
  info('[ANY MESSAGE]', message);
}

function logReceived(project, user, text) {
  info(`[RECEIVED] Project: ${project}, User: ${user}, Text: ${text}`);
}

function logCron() {
  info(`[CRON] Summarization timer triggered at ${new Date().toLocaleTimeString()}`);
}

function logSkip(project) {
  info(`[SKIP] No messages for project: ${project}`);
}

function logPerplexityResponse(response) {
  info('[PERPLEXITY RESPONSE]', response);
}

function logSummaryPosted(project, messageCount) {
  info(`[SUMMARY POSTED] Project: ${project}, Messages: ${messageCount}`);
}

function logError(context, error) {
  console.error(formatLogMessage(LOG_LEVELS.ERROR, `[ERROR] ${context}`, error.response ? error.response.data : error));
}

module.exports = {
  info,
  warn,
  error,
  debug,
  logAnyMessage,
  logReceived,
  logCron,
  logSkip,
  logPerplexityResponse,
  logSummaryPosted,
  logError
};
