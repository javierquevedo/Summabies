/**
 * Project tag extraction utilities
 * Handles detection and parsing of project identifiers in messages
 */

/**
 * Extract project names from message text
 * Expects format: [ProjectName] message content
 * Can handle multiple project tags in a single message
 * 
 * @param {string} text - Message text to parse
 * @returns {string[]} - Array of project names found
 */
function extractProjects(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Match all [ProjectName] patterns in the message
  const matches = text.match(/\[(.+?)\]/g);
  if (!matches) {
    return [];
  }
  
  // Extract and trim project names
  return matches.map(match => match.substring(1, match.length - 1).trim());
}

/**
 * Check if a message contains any valid project tags
 * 
 * @param {string} text - Message text to check
 * @returns {boolean} - True if message has at least one project tag
 */
function hasProjectTag(text) {
  return extractProjects(text).length > 0;
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
  extractProjects,
  hasProjectTag,
  normalizeProjectName
};
