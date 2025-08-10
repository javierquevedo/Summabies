const logger = require('../utils/logger');
const { extractProjects } = require('../utils/projectExtractor');

/**
 * Slack bot service for handling events and bot operations
 * Manages message handling, app mentions, and bot lifecycle
 */
class SlackBot {
  constructor(app, messageStore) {
    this.app = app;
    this.messageStore = messageStore;
    this.isRunning = false;
    this.eventHandlers = {
      message: false,
      appMention: false
    };
  }

  /**
   * Initialize the Slack bot event handlers
   */
  initialize() {
    this.setupMessageHandler();
    this.setupAppMentionHandler();
    logger.info('Slack bot event handlers initialized');
  }

  /**
   * Start the Slack bot
   * 
   * @param {number} port - Port to start the server on
   * @param {string} channelId - Channel ID to join and send startup message to
   */
  async start(port, channelId) {
    try {
      await this.app.start(port);
      logger.info(`Summabies agent is running! Listening for Slack events at /slack/events on port ${port}`);
      
      await this.joinChannel(channelId);
      await this.sendStartupMessage(channelId);
      
      this.isRunning = true;
      logger.info('Slack bot startup completed successfully');
    } catch (error) {
      logger.error('Failed to start Slack bot', error);
      throw error;
    }
  }

  /**
   * Stop the Slack bot
   */
  async stop() {
    try {
      await this.app.stop();
      this.isRunning = false;
      logger.info('Slack bot stopped successfully');
    } catch (error) {
      logger.error('Failed to stop Slack bot', error);
      throw error;
    }
  }

  /**
   * Setup message event handler
   */
  setupMessageHandler() {
    this.app.event('message', async (event) => {
      try {
        // Skip bot messages and messages without text
        if (event.bot_id || !event.message || !event.message.text) {
          return;
        }
        
        // Log all messages for debugging
        logger.logAnyMessage(event);
        
        // Debug: Log the event structure to understand what we're receiving
        logger.debug('Message event structure:', {
          hasMessage: !!event.message,
          hasText: !!event.message.text,
          hasUser: !!event.message.user,
          hasTs: !!event.message.ts,
          hasChannel: !!event.channel,
          hasTeam: !!event.team,
          eventKeys: Object.keys(event),
          messageKeys: event.message ? Object.keys(event.message) : []
        });
        
        // Extract projects from message text
        // Slack message event contains the message in event.message.text
        const projects = extractProjects(event.message.text);
        
        if (projects.length > 0) {
          // Store message for each project found
          const messageData = {
            user: event.message.user,
            text: event.message.text,
            ts: event.message.ts,
            channel: event.channel,
            team: event.team
          };

          projects.forEach(project => {
            this.messageStore.storeMessage(project, messageData);
            logger.info(`Stored message for project: ${project} from user: ${event.message.user}`);
          });
        }
        
        this.eventHandlers.message = true;
      } catch (error) {
        logger.error('Error handling message event:', error);
      }
    });
  }

  /**
   * Setup app mention event handler
   */
  setupAppMentionHandler() {
    this.app.event('app_mention', async (event) => {
      try {
        logger.info(`Bot mentioned in channel ${event.channel} by user ${event.user}`);
        
        // You can add custom logic here for when the bot is mentioned
        // For example, responding with help text or status information
        
        this.eventHandlers.appMention = true;
      } catch (error) {
        logger.error('Error handling app mention event:', error);
      }
    });
  }

  /**
   * Join a Slack channel
   * 
   * @param {string} channelId - Channel ID to join
   */
  async joinChannel(channelId) {
    try {
      await this.app.client.conversations.join({ channel: channelId });
      logger.info('Bot joined the channel successfully');
    } catch (error) {
      if (error.code === 'already_in_channel') {
        logger.warn('Bot is already in the channel');
      } else {
        logger.error('Failed to join channel:', error);
        throw error;
      }
    }
  }

  /**
   * Send startup message to Slack
   * 
   * @param {string} channelId - Channel ID to send message to
   */
  async sendStartupMessage(channelId) {
    try {
      await this.app.client.chat.postMessage({
        channel: channelId,
        text: '🚀 Summabies agent is now online and monitoring for project messages! I\'ll provide hourly summaries of project discussions.',
        unfurl_links: false
      });
      logger.info('Startup message sent to Slack');
    } catch (error) {
      logger.error('Failed to send startup message:', error);
      // Don't throw here as this is not critical for operation
    }
  }

  /**
   * Post a message to a Slack channel
   * 
   * @param {string} channelId - Channel ID to post to
   * @param {string} text - Message text to post
   * @param {Object} options - Additional message options
   */
  async postMessage(channelId, text, options = {}) {
    try {
      const messageOptions = {
        channel: channelId,
        text,
        unfurl_links: false,
        ...options
      };

      const result = await this.app.client.chat.postMessage(messageOptions);
      logger.info(`Message posted to channel ${channelId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to post message to channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Get bot status
   * 
   * @returns {Object} - Bot status information
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      eventHandlers: { ...this.eventHandlers }
    };
  }
}

module.exports = SlackBot;
