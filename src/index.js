require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./Handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`✅ ${client.user.tag} is online and ready!`);
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

eventHandler(client);

client.login(process.env.TOKEN).catch((error) => {
  console.error('❌ Failed to login:', error.message);
  if (error.code === 'TokenInvalid') {
    console.error('🔑 Please check your TOKEN in the .env file. Get a new token from https://discord.com/developers/applications');
  }
});