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

const startXMonitor = require('./utils/xToDiscord');


client.on('clientReady', () => {
  startXMonitor(client);

  });

eventHandler(client);

client.login(process.env.TOKEN);