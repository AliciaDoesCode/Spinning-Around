const { EmbedBuilder } = require('discord.js');

module.exports = async (oldMessage, newMessage) => {
  // Ignore DMs, system messages, and bots
  if (!newMessage.guild || newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return; // Ignore if content didn't change

  const logChannel = newMessage.guild.channels.cache.get('1422147873675542538');
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor(0x00bfff) // Blue
    .setTitle('✏️ Message Edited')
    .addFields(
      { name: 'User', value: `${newMessage.author.tag} (${newMessage.author.id})`, inline: true },
      { name: 'Channel', value: `${newMessage.channel}`, inline: true },
      { name: 'Message ID', value: newMessage.id, inline: true },
      { name: 'Before', value: oldMessage.content || '[No content]', inline: false },
      { name: 'After', value: newMessage.content || '[No content]', inline: false }
    )
    .setTimestamp();

  embed.setThumbnail(newMessage.author.displayAvatarURL({ dynamic: true, size: 512 }));

  await logChannel.send({ embeds: [embed] });
};