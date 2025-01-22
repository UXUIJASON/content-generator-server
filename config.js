require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  claudeApiKey: process.env.CLAUDE_API_KEY,
};

if (!config.claudeApiKey) {
  console.error('Warning: CLAUDE_API_KEY is not set in environment variables');
}

module.exports = config;