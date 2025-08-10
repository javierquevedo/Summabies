/**
 * Project tag extraction utilities
 * Handles detection and parsing of project identifiers in messages
 */

/**
 * Extract project name from message text
 * Expects format: [ProjectName] message content
 * 
 * @param {string} text - Message text to parse
 * @returns {string|null} - Project name if found, null otherwise
 */
function extractProject(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  // Match [ProjectName] pattern at the beginning of the message
  const match = text.match(/^\[(.+?)\]/);
  return match ? match[1].trim() : null;
}

/**
 * Check if a message contains a valid project tag
 * 
 * @param {string} text - Message text to check
 * @returns {boolean} - True if message has project tag
 */
function hasProjectTag(text) {
  return extractProject(text) !== null;
}

/**
 * Normalize project name (remove extra spaces, etc.)
 * 
 * @param {string} projectName - Raw project name
 * @returns {string} - Normalized project name
 */
function normalizeProjectName(projectName) {
  if (!projectName) return '';
  return projectName.trim().replace(/\s+/g, ' ');
}

module.exports = {
  extractProject,
  hasProjectTag,
  normalizeProjectName
};
