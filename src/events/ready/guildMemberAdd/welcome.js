console.log('guildMemberAdd event fired');
const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
  const channel = member.guild.channels.cache.get('1421954415786459211');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x00ff99)
    .setTitle('🎉 Welcome!')
    .setDescription(`Welcome to Spinning Around, ${member.user.tag}! Feel free to introduce yourself.`)
    .setThumbnail(member.user.displayAvatarURL());

  channel.send({ embeds: [embed] });
};