const cron = require('node-cron');
const logger = require('../utils/logger');

/**
 * Cron job scheduler for automated summarization
 * Handles timing and orchestration of summary generation
 */

class SummaryScheduler {
  constructor(slackApp, messageStore, summarizer, channelId) {
    this.slackApp = slackApp;
    this.messageStore = messageStore;
    this.summarizer = summarizer;
    this.channelId = channelId;
    this.job = null;
  }

  /**
   * Start the summary scheduler
   * Runs every minute to process project messages
   */
  start() {
    // Schedule job to run every minute
    this.job = cron.schedule('* * * * *', async () => {
      await this.processSummaries();
    });

    logger.info('Summary scheduler started - running every minute');
  }

  /**
   * Stop the summary scheduler
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      logger.info('Summary scheduler stopped');
    }
  }

  /**
   * Process summaries for all projects with messages
   */
  async processSummaries() {
    logger.logCron();
    
    const projects = this.messageStore.getProjectsWithMessages();
    
    for (const project of projects) {
      await this.processProjectSummary(project);
    }
  }

  /**
   * Process summary for a specific project
   * 
   * @param {string} project - Project name
   */
  async processProjectSummary(project) {
    if (!this.messageStore.hasMessages(project)) {
      logger.logSkip(project);
      return;
    }

    try {
      // Get messages for the project
      const messages = this.messageStore.getProjectMessages(project);
      
      // Generate summary using AI
      const summary = await this.summarizer.generateSummary(project, messages);
      
      // Post summary to Slack
      await this.postSummaryToSlack(project, summary);
      
      // Clear processed messages
      this.messageStore.clearProjectMessages(project);
      
      logger.logSummaryPosted(project, messages.length);
      
    } catch (error) {
      logger.logError(`Processing summary for project: ${project}`, error);
    }
  }

  /**
   * Post summary to Slack channel
   * 
   * @param {string} project - Project name
   * @param {string} summary - Generated summary text
   */
  async postSummaryToSlack(project, summary) {
    try {
      await this.slackApp.client.chat.postMessage({
        channel: this.channelId,
        text: `*Summary for [${project}]*\n${summary}`,
      });
    } catch (error) {
      logger.logError(`Posting summary to Slack for project: ${project}`, error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   * 
   * @returns {Object} - Scheduler status information
   */
  getStatus() {
    return {
      isRunning: this.job !== null,
      schedule: '* * * * *', // Every minute
      nextRun: this.job ? 'Every minute' : 'Not scheduled'
    };
  }
}

module.exports = SummaryScheduler;
