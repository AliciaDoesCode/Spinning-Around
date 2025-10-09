const { PermissionFlagsBits } = require('discord.js');

module.exports = async (client, interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'close_ticket') return;
  if (!interaction.channel.name.startsWith('ticket-')) return;
  if (interaction.user.id !== interaction.channel.name.split('-')[1]) {
    await interaction.reply({ content: 'Only the ticket owner can close this ticket.', ephemeral: true });
    return;
  }

  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const sorted = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  let transcript = `Transcript for ${interaction.channel.name} (closed by <@${interaction.user.id}>):\n\n`;
  for (const msg of sorted) {
    transcript += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
  }

  const logChannelId = '1425057406127444019';
  const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
  if (logChannel) {
    for (let i = 0; i < transcript.length; i += 1900) {
      await logChannel.send('```' + transcript.slice(i, i + 1900) + '```');
    }
  }

  await interaction.channel.delete();
};
