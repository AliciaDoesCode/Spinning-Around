console.log('guildMemberAdd event fired');
const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
  const channel = member.guild.channels.cache.get('');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x00ff99)
    .setTitle('🎉 Welcome!')
    .setDescription(``)
    .setThumbnail(member.user.displayAvatarURL());

  channel.send({ embeds: [embed] });
};