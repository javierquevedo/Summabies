/**
 * Summabies - AI-Powered Slack Bot for Automated Project Summaries
 * Main entry point that orchestrates all services
 */

// Import configuration
const { loadConfig } = require('./config/environment');
const { createSlackApp } = require('./config/slack');

// Import services
const MessageStore = require('./services/messageStore');
const Summarizer = require('./services/summarizer');
const SlackBot = require('./services/slackBot');
const SummaryScheduler = require('./cron/summaryScheduler');

// Import utilities
const logger = require('./utils/logger');

/**
 * Main application class
 * Orchestrates all services and manages the application lifecycle
 */
class SummabiesApp {
  constructor() {
    this.config = null;
    this.messageStore = null;
    this.summarizer = null;
    this.slackBot = null;
    this.summaryScheduler = null;
    this.isRunning = false;
  }

  /**
   * Initialize the application
   * Loads configuration and creates service instances
   */
  async initialize() {
    try {
      logger.info('Initializing Summabies application...');
      
      // Load and validate configuration
      this.config = loadConfig();
      logger.info('Configuration loaded successfully');
      
      // Create service instances
      this.messageStore = new MessageStore();
      this.summarizer = new Summarizer(this.config.perplexity.apiKey);
      
      // Create Slack app
      const { app } = createSlackApp(this.config);
      
      // Create Slack bot service
      this.slackBot = new SlackBot(app, this.messageStore);
      
      // Create summary scheduler
      this.summaryScheduler = new SummaryScheduler(
        app,
        this.messageStore,
        this.summarizer,
        this.config.slack.channelId
      );
      
      logger.info('All services initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize application', error);
      throw error;
    }
  }

  /**
   * Start the application
   * Initializes services and starts all components
   */
  async start() {
    try {
      if (this.isRunning) {
        logger.warn('Application is already running');
        return;
      }

      logger.info('Starting Summabies application...');
      
      // Initialize services
      await this.initialize();
      
      // Initialize Slack bot event handlers
      this.slackBot.initialize();
      
      // Start Slack bot
      logger.info('Starting Slack bot...');
      await this.slackBot.start(this.config.server.port, this.config.slack.channelId);
      logger.info('Slack bot started successfully');
      
      // Start summary scheduler
      logger.info('Starting summary scheduler...');
      this.summaryScheduler.start();
      logger.info('Summary scheduler started successfully');
      
      this.isRunning = true;
      logger.info('Summabies application started successfully');
      
    } catch (error) {
      logger.error('Failed to start application', error);
      throw error;
    }
  }

  /**
   * Stop the application
   * Gracefully shuts down all services
   */
  async stop() {
    try {
      if (!this.isRunning) {
        logger.warn('Application is not running');
        return;
      }

      logger.info('Stopping Summabies application...');
      
      // Stop summary scheduler
      if (this.summaryScheduler) {
        this.summaryScheduler.stop();
      }
      
      this.isRunning = false;
      logger.info('Summabies application stopped successfully');
      
    } catch (error) {
      logger.error('Failed to stop application', error);
      throw error;
    }
  }

  /**
   * Get application status
   * 
   * @returns {Object} - Application status information
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config ? {
        slack: { channelId: this.config.slack.channelId },
        server: { port: this.config.server.port }
      } : null,
      services: {
        messageStore: this.messageStore ? 'initialized' : 'not initialized',
        summarizer: this.summarizer ? 'initialized' : 'not initialized',
        slackBot: this.slackBot ? this.slackBot.getStatus() : 'not initialized',
        summaryScheduler: this.summaryScheduler ? this.summaryScheduler.getStatus() : 'not initialized'
      }
    };
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  if (global.app) {
    await global.app.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  if (global.app) {
    await global.app.stop();
  }
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
async function main() {
  try {
    const app = new SummabiesApp();
    global.app = app; // Store reference for graceful shutdown
    
    await app.start();
    
    // Log application status
    try {
      const status = app.getStatus();
      logger.info('Application status:', status);
    } catch (statusError) {
      logger.error('Failed to get application status:', statusError);
    }
    
    // Keep the process running
    logger.info('Application is now running. Press Ctrl+C to stop.');
    
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

// Run the application if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = SummabiesApp;
