const { App, ExpressReceiver } = require('@slack/bolt');

/**
 * Slack app configuration and setup
 */

function createSlackApp(config) {
  // Create custom Express receiver for /slack/events endpoint
  const receiver = new ExpressReceiver({
    signingSecret: config.slack.signingSecret,
    endpoints: '/slack/events',
  });

  // Create Slack app instance
  const app = new App({
    token: config.slack.botToken,
    receiver,
  });

  return { app, receiver };
}

module.exports = {
  createSlackApp
};
