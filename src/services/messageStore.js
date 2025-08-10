const logger = require('../utils/logger');

/**
 * In-memory message storage service
 * Manages project messages and provides storage operations
 */

class MessageStore {
  constructor() {
    // { ProjectName: [ { user, text, ts }, ... ] }
    this.projectMessages = {};
  }

  /**
   * Store a message for a specific project
   * 
   * @param {string} project - Project name
   * @param {Object} message - Message object with user, text, ts
   */
  storeMessage(project, message) {
    if (!this.projectMessages[project]) {
      this.projectMessages[project] = [];
    }
    
    this.projectMessages[project].push({
      user: message.user,
      text: message.text,
      ts: message.ts,
    });
    
    logger.logReceived(project, message.user, message.text);
  }

  /**
   * Get all messages for a specific project
   * 
   * @param {string} project - Project name
   * @returns {Array} - Array of messages for the project
   */
  getProjectMessages(project) {
    return this.projectMessages[project] || [];
  }

  /**
   * Check if a project has messages
   * 
   * @param {string} project - Project name
   * @returns {boolean} - True if project has messages
   */
  hasMessages(project) {
    const messages = this.getProjectMessages(project);
    return messages.length > 0;
  }

  /**
   * Get all projects with messages
   * 
   * @returns {Array} - Array of project names that have messages
   */
  getProjectsWithMessages() {
    return Object.keys(this.projectMessages).filter(project => 
      this.hasMessages(project)
    );
  }

  /**
   * Clear messages for a specific project after processing
   * 
   * @param {string} project - Project name
   */
  clearProjectMessages(project) {
    this.projectMessages[project] = [];
  }

  /**
   * Get message count for a project
   * 
   * @param {string} project - Project name
   * @returns {number} - Number of messages for the project
   */
  getMessageCount(project) {
    const messages = this.getProjectMessages(project);
    return messages.length;
  }

  /**
   * Get all stored data (for debugging/testing)
   * 
   * @returns {Object} - Complete message store state
   */
  getAllData() {
    return { ...this.projectMessages };
  }

  /**
   * Clear all stored messages (for testing/reset)
   */
  clearAll() {
    this.projectMessages = {};
  }
}

module.exports = MessageStore;
