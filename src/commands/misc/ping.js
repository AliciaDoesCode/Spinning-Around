module.exports = {
  name: 'ping',
  description: 'Pong! Check bot latency',
  testOnly: false,

  callback: (client, interaction) => {
    interaction.reply(`Pong! ${client.ws.ping}ms`);
  },
};