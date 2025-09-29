require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./Handlers/eventHandler');

// Validate token exists
if (!process.env.TOKEN) {
  console.error('❌ No TOKEN found in environment variables!');
  console.error('🔑 Please check your .env file and make sure TOKEN is set.');
  process.exit(1);
}

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.once('ready', (c) => {
  console.log(`✅ ${c.user.tag} is online and ready!`);
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

// Add disconnect handler
client.on('disconnect', () => {
  console.log('⚠️  Bot disconnected from Discord.');
});

// Add reconnecting handler
client.on('reconnecting', () => {
  console.log('🔄 Bot is reconnecting...');
});

eventHandler(client);

console.log('🔄 Attempting to login...');
client.login(process.env.TOKEN).catch((error) => {
  console.error('❌ Failed to login:', error.message);
  if (error.code === 'TokenInvalid') {
    console.error('🔑 Invalid token! Please check your TOKEN in the .env file.');
    console.error('💡 Get a new token from https://discord.com/developers/applications');
  } else if (error.code === 'DisallowedIntents') {
    console.error('🔐 Missing required intents! Please enable them in the Discord Developer Portal.');
  } else {
    console.error('🌐 This might be a network connectivity issue. Please try again.');
  }
  process.exit(1);
});