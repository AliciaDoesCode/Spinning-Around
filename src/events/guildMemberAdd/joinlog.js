const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
  const logChannel = member.guild.channels.cache.get('1422147873675542538');
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor(0xff69b4) // Pink
    .setTitle('Member Joined')
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
    .addFields(
      { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setTimestamp();

  await logChannel.send({ embeds: [embed] });
};