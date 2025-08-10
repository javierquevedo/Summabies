require('dotenv').config();

/**
 * Environment configuration for Summabies
 * Loads and validates required environment variables
 */

const requiredEnvVars = [
  'SLACK_BOT_TOKEN',
  'SLACK_SIGNING_SECRET', 
  'SLACK_CHANNEL_ID',
  'PERPLEXITY_API_KEY'
];

// Validate required environment variables
function validateEnvironment() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Load and validate configuration
function loadConfig() {
  validateEnvironment();
  
  return {
    slack: {
      botToken: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      channelId: process.env.SLACK_CHANNEL_ID
    },
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY
    },
    server: {
      port: process.env.PORT || 3000
    }
  };
}

module.exports = {
  loadConfig,
  validateEnvironment
};
