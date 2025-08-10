# 🤖 Summabies

> **AI-Powered Slack Bot for Automated Project Summaries**

Summabies is a Node.js Slack bot that automatically monitors project conversations, groups messages by project tags, and generates intelligent summaries using AI. Perfect for teams that want to stay updated on multiple projects without manually reading through all messages.

## ✨ Features

- **🔍 Smart Message Monitoring**: Automatically detects and groups messages by project tags (e.g., `[ProjectA]`, `[Backend]`)
- **🤖 AI-Powered Summaries**: Uses Perplexity AI to generate concise, intelligent project summaries
- **⏰ Automated Scheduling**: Runs every minute to provide real-time project updates
- **💬 Single Channel Design**: All project summaries posted to one centralized Slack channel
- **🧠 In-Memory Storage**: Efficient message storage and cleanup after summarization
- **🚀 Easy Setup**: Simple configuration with environment variables

## 🏗️ Architecture

```
Slack Messages → Project Detection → Message Storage → AI Summarization → Summary Posting
     ↓                ↓                ↓                ↓                ↓
[ProjectA] msg → Extract "ProjectA" → Store in memory → Perplexity AI → Post to Slack
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Slack App with Bot Token
- Perplexity Pro API Key
- Ngrok (for local development)

### 1. Clone & Install

```bash
git clone https://github.com/javierquevedo/Summabies.git
cd Summabies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_CHANNEL_ID=C1234567890

# AI Service
PERPLEXITY_API_KEY=your-perplexity-api-key-here

# Server Configuration
PORT=3000
```

### 3. Slack App Setup

1. **Create a Slack App** at [api.slack.com/apps](https://api.slack.com/apps)
2. **Add Bot Token Scopes**:
   - `channels:read`
   - `chat:write`
   - `channels:join`
   - `app_mentions:read`
3. **Enable Event Subscriptions**:
   - Request URL: `https://your-ngrok-url.ngrok.io/slack/events`
   - Subscribe to: `message.channels`
4. **Install App** to your workspace
5. **Invite Bot** to your target channel: `/invite @YourBotName`

### 4. Start the Bot

```bash
npm start
```

The bot will:
- Join your specified channel automatically
- Send a startup message: "🤖 Summabies agent is now online and monitoring messages!"
- Begin monitoring for project-tagged messages

## 📝 Usage

### Message Format

Tag your messages with project identifiers in square brackets:

```
[Frontend] Working on the new dashboard components
[Backend] API endpoint for user authentication is ready
[Design] Updated mockups for the landing page
[QA] Testing the checkout flow
```

### Automatic Summarization

- **Frequency**: Every 10 seconds
- **Output**: AI-generated summaries posted to your Slack channel
- **Format**: 
  ```
  *Summary for [Frontend]*
  Working on new dashboard components with focus on user experience improvements.
  ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SLACK_BOT_TOKEN` | Your Slack bot's OAuth token | ✅ |
| `SLACK_SIGNING_SECRET` | Slack app signing secret | ✅ |
| `SLACK_CHANNEL_ID` | Channel ID to monitor and post to | ✅ |
| `PERPLEXITY_API_KEY` | Perplexity Pro API key | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |

### Customization

- **Summarization Frequency**: Modify the cron schedule in `index.js` (currently set to every 10 seconds)
- **AI Model**: Change the Perplexity model in the API call
- **Summary Length**: Adjust `max_tokens` parameter
- **Project Detection**: Modify the regex pattern in `extractProject()`

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start the bot
npm run lint       # Run ESLint checks
npm run lint:fix   # Fix auto-fixable linting issues
```

### Project Structure

```
Summabies/
├── .github/workflows/    # GitHub Actions for CI/CD
├── index.js              # Main bot logic
├── package.json          # Dependencies and scripts
├── eslint.config.mjs     # ESLint configuration
├── .env                  # Environment variables (create this)
└── README.md            # This file
```

### Adding New Features

1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** with `npm run lint`
5. **Submit** a pull request

## 🔍 Troubleshooting

### Common Issues

**Bot not receiving messages:**
- Verify Event Subscriptions are enabled
- Check that the bot is invited to the channel
- Ensure ngrok is running and URL is updated in Slack

**Summarization not working:**
- Verify Perplexity API key is valid
- Check API quota/limits
- Review console logs for error messages

**Bot can't post to channel:**
- Ensure bot has `chat:write` permission
- Verify channel ID is correct
- Check if channel is private (bot needs to be invited)

### Debug Mode

The bot includes extensive logging. Check console output for:
- `[ANY MESSAGE]` - All incoming Slack messages
- `[RECEIVED]` - Project messages being stored
- `[CRON]` - Summarization timer triggers
- `[PERPLEXITY RESPONSE]` - AI API responses
- `[SUMMARY POSTED]` - Successful Slack posts

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Quality

- All code must pass ESLint checks
- Follow existing code style and patterns
- Include appropriate logging for debugging
- Test your changes locally before submitting

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [@slack/bolt](https://slack.dev/bolt-js/) for Slack integration
- Powered by [Perplexity AI](https://www.perplexity.ai/) for intelligent summarization
- Scheduled with [node-cron](https://github.com/node-cron/node-cron) for automation

---

**Made with ❤️ for productive teams everywhere**
