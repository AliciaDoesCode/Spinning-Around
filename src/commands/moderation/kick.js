const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kicks a member from the server.',
  options: [
    {
      name: 'target-user',
      description: 'The user to kick.',
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: 'reason',
      description: 'The reason for kicking.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
  callback: async (client, interaction) => {
    const targetId = interaction.options.get('target-user').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    try {
      const targetUser = await interaction.guild.members.fetch(targetId);
      if (!targetUser) {
        await interaction.reply({ content: "That user doesn't exist in this server.", ephemeral: true });
        return;
      }

      await targetUser.kick(reason);
      await interaction.reply({ content: `${targetUser.user.tag} has been kicked.\nReason: ${reason}` });

      const logChannel = interaction.guild.channels.cache.get('1422147873675542538');
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor(0x3498db) 
          .setTitle('👢 User Kicked')
          .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true, size: 512 }))
          .addFields(
            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: 'Target', value: `${targetUser.user.tag} (${targetUser.id})`, inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
    }
  },
};