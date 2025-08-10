const axios = require('axios');
const logger = require('../utils/logger');

/**
 * AI summarization service using Perplexity API
 * Generates summaries of project messages using AI
 */
class Summarizer {
  constructor(perplexityApiKey) {
    this.apiKey = perplexityApiKey;
    this.baseUrl = 'https://api.perplexity.ai/chat/completions';
  }

  /**
   * Generate a summary for a project's messages
   * 
   * @param {string} project - Project name
   * @param {Array} messages - Array of message objects
   * @returns {Promise<string>} - Generated summary
   */
  async generateSummary(project, messages) {
    try {
      if (!messages || messages.length === 0) {
        return `No messages found for project ${project}.`;
      }

      const formattedMessages = this.formatMessagesForAI(messages);
      const prompt = this.createSummaryPrompt(project, formattedMessages);

      logger.info(`Generating summary for project: ${project} with ${messages.length} messages`);

      const response = await this.callPerplexityAPI(prompt);
      
      if (response && response.choices && response.choices[0]) {
        const summary = response.choices[0].message.content;
        logger.info(`Summary generated successfully for project: ${project}`);
        return summary;
      } else {
        throw new Error('Invalid response format from Perplexity API');
      }

    } catch (error) {
      logger.error(`Failed to generate summary for project ${project}:`, error);
      throw error;
    }
  }

  /**
   * Format messages for AI processing
   * 
   * @param {Array} messages - Array of message objects
   * @returns {string} - Formatted message text
   */
  formatMessagesForAI(messages) {
    return messages.map(msg => {
      const timestamp = new Date(parseFloat(msg.ts) * 1000).toISOString();
      return `[${timestamp}] ${msg.user}: ${msg.text}`;
    }).join('\n');
  }

  /**
   * Create the prompt for AI summarization
   * 
   * @param {string} project - Project name
   * @param {string} formattedMessages - Formatted message text
   * @returns {string} - Complete prompt for AI
   */
  createSummaryPrompt(project, formattedMessages) {
    return `Please provide a concise summary of the following Slack messages for project "${project}". 

Focus on:
- Key decisions made
- Important updates or progress
- Action items or next steps
- Any blockers or issues identified

Messages:
${formattedMessages}

Please provide a clear, actionable summary in 2-3 sentences.`;
  }

  /**
   * Call the Perplexity API
   * 
   * @param {string} prompt - The prompt to send to the AI
   * @returns {Promise<Object>} - API response
   */
  async callPerplexityAPI(prompt) {
    try {
      const response = await axios.post(this.baseUrl, {
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      logger.logPerplexityResponse(response.data);
      return response.data;

    } catch (error) {
      if (error.response) {
        logger.error(`Perplexity API error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
      } else {
        logger.error('Perplexity API request failed:', error.message);
      }
      throw error;
    }
  }

  /**
   * Validate the API key
   * 
   * @returns {Promise<boolean>} - True if API key is valid
   */
  async validateApiKey() {
    try {
      const response = await this.callPerplexityAPI('Hello, this is a test message.');
      return !!(response && response.choices && response.choices[0]);
    } catch (error) {
      logger.error('API key validation failed:', error);
      return false;
    }
  }

  /**
   * Get service status
   * 
   * @returns {Object} - Service status information
   */
  getStatus() {
    return {
      apiKeyConfigured: !!this.apiKey,
      baseUrl: this.baseUrl,
      service: 'Perplexity AI'
    };
  }
}

module.exports = Summarizer;
