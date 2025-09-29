console.log('guildMemberAdd event fired');
const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
  // Replace with your welcome channel ID or comment out if you don't have a welcome channel
  const channel = member.guild.channels.cache.get('1421954415786459211');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x00ff99)
    .setTitle('🎉 Welcome!')
    .setDescription(`Welcome to the server, ${member.user}! 🎉`)
    .setThumbnail(member.user.displayAvatarURL());

  channel.send({ embeds: [embed] });
};