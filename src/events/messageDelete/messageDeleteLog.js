const { EmbedBuilder } = require('discord.js');

module.exports = async (message) => {
  // Ignore DMs and system messages
  if (!message.guild || message.author?.bot) return;

  const logChannel = message.guild.channels.cache.get('1422147873675542538');
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor(0xff0000) // Red
    .setTitle('🗑️ Message Deleted')
    .addFields(
      { name: 'User', value: `${message.author?.tag || 'Unknown'} (${message.author?.id || 'N/A'})`, inline: true },
      { name: 'Channel', value: `${message.channel}`, inline: true },
      { name: 'Message ID', value: message.id, inline: true },
      { name: 'Content', value: message.content || '[No content]', inline: false }
    )
    .setTimestamp();

  if (message.author) {
    embed.setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 512 }));
  }

  await logChannel.send({ embeds: [embed] });
};