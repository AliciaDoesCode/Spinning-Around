console.log('guildMemberAdd event fired');
const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
  const channel = member.guild.channels.cache.get('1421954415786459211');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x00ff99)
    .setTitle('🎉 Welcome to Spinning Around!')
    .setDescription(`Welcome to Spinning Around, ${member.user}! Please check out the rules in <#1424316135200788521> and make sure to grab some roles in <#1425081576110293122>  `)
    .setThumbnail(member.user.displayAvatarURL());

  channel.send({ embeds: [embed] });
};