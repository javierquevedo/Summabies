
/* eslint-env node */
require('dotenv').config();
const { App, ExpressReceiver } = require('@slack/bolt');
const cron = require('node-cron');
const axios = require('axios'); // Will be used for Perplexity API

// --- Config ---
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackChannelId = process.env.SLACK_CHANNEL_ID; // Channel to listen and post summaries
const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

// --- Custom Express Receiver for /slack/events endpoint ---
const receiver = new ExpressReceiver({
  signingSecret: slackSigningSecret,
  endpoints: '/slack/events',
});

// --- Slack App ---
const app = new App({
  token: slackBotToken,
  receiver,
});

// --- In-memory message store ---
// { ProjectName: [ { user, text, ts }, ... ] }
const projectMessages = {};

// --- Helper: Extract project name from message ---
function extractProject(text) {
  // Expecting [ProjectName] in message
  const match = text.match(/\[(.+?)\]/);
  return match ? match[1] : null;
}

// --- Listen for messages ---
app.message(async ({ message, say }) => {
  console.log('[ANY MESSAGE]', message); // Log every message received from Slack
  if (!message.text || !message.user) return;
  const project = extractProject(message.text);
  if (!project) return; // Ignore messages without project tag
  if (!projectMessages[project]) projectMessages[project] = [];
  projectMessages[project].push({
    user: message.user,
    text: message.text,
    ts: message.ts,
  });
  console.log(`[RECEIVED] Project: ${project}, User: ${message.user}, Text: ${message.text}`);
});

// --- Summarize and post every 10 seconds (Perplexity integration) ---
cron.schedule('*/10 * * * * *', async () => {
  console.log(`[CRON] Summarization timer triggered at ${new Date().toLocaleTimeString()}`);
  for (const [project, messages] of Object.entries(projectMessages)) {
    if (messages.length === 0) {
      console.log(`[SKIP] No messages for project: ${project}`);
      continue;
    }
    const textBlock = messages.map(m => `<@${m.user}>: ${m.text}`).join('\n');
    try {
      // Perplexity API call
      const perplexityResponse = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar',
          messages: [
            { role: 'system', content: `Summarize the following Slack messages for project ${project} in a concise, clear way for a project update.` },
            { role: 'user', content: textBlock },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const summary = perplexityResponse.data.choices[0].message.content;
      console.log(`[PERPLEXITY RESPONSE]`, perplexityResponse.data);
      await app.client.chat.postMessage({
        channel: slackChannelId,
        text: `*Summary for [${project}]*\n${summary}`,
      });
      console.log(`[SUMMARY POSTED] Project: ${project}, Messages: ${messages.length}`);
    } catch (err) {
      console.error(`[ERROR] Summarizing or posting for project: ${project}`, err.response ? err.response.data : err);
    }
    // Clear messages after summarizing
    projectMessages[project] = [];
  }
});

// --- Start Slack app ---
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`Summabies agent is running! Listening for Slack events at /slack/events on port ${port}`);
  try {
    // Ensure the bot joins the channel before posting
    await app.client.conversations.join({ channel: slackChannelId });
    console.log('[INFO] Bot joined the channel.');
    await app.client.chat.postMessage({
      channel: slackChannelId,
      text: ':robot_face: Summabies agent is now online and monitoring messages!',
    });
    console.log('[INFO] Startup message sent to Slack.');
  } catch (err) {
    if (err.data && err.data.error === 'method_not_supported_for_channel_type') {
      console.log('[INFO] Channel is private or already joined.');
    } else if (err.data && err.data.error === 'already_in_channel') {
      console.log('[INFO] Bot is already in the channel.');
    } else {
      console.error('[ERROR] Could not join or post to channel:', err);
    }
  }
})();
