const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = {
  name: 'bot-status',
  description: 'Check bot status and command registration (Admin only)',
  
  callback: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '❌ You need Administrator permissions to use this command!', 
        ephemeral: true 
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const localCommands = getLocalCommands();
      const applicationCommands = await getApplicationCommands(client);
      
      const botMember = interaction.guild.members.cache.get(client.user.id);
      const hasApplicationCommands = botMember.permissions.has(PermissionFlagsBits.UseApplicationCommands);
      const hasSlashCommands = botMember.permissions.has(PermissionFlagsBits.UseSlashCommands);

      const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Status Diagnostic')
        .setColor('#4ecdc4')
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp();

      embed.addFields(
        { name: '🏷️ Bot Name', value: client.user.tag, inline: true },
        { name: '🆔 Bot ID', value: client.user.id, inline: true },
        { name: '📡 Status', value: client.ws.status === 0 ? '✅ Online' : '❌ Offline', inline: true }
      );

      embed.addFields(
        { name: '📂 Local Commands', value: localCommands.length.toString(), inline: true },
        { name: '☁️ Registered Commands', value: applicationCommands.cache.size.toString(), inline: true },
        { name: '🔄 Commands Match', value: localCommands.length === applicationCommands.cache.size ? '✅ Yes' : '❌ No', inline: true }
      );

      embed.addFields(
        { name: '🔑 Use Application Commands', value: hasApplicationCommands ? '✅ Yes' : '❌ No', inline: true },
        { name: '⚡ Use Slash Commands', value: hasSlashCommands ? '✅ Yes' : '❌ No', inline: true },
        { name: '👑 Admin Permissions', value: botMember.permissions.has(PermissionFlagsBits.Administrator) ? '✅ Yes' : '❌ No', inline: true }
      );

      const registeredCommandNames = applicationCommands.cache.map(cmd => cmd.name).sort();
      const localCommandNames = localCommands.map(cmd => cmd.name).sort();
      
      if (registeredCommandNames.length > 0) {
        embed.addFields({
          name: '☁️ Registered Commands',
          value: registeredCommandNames.join(', ') || 'None',
          inline: false
        });
      }

      if (localCommandNames.length > 0) {
        embed.addFields({
          name: '📂 Local Commands',
          value: localCommandNames.join(', ') || 'None',
          inline: false
        });
      }

      const missingFromDiscord = localCommandNames.filter(name => !registeredCommandNames.includes(name));
      const missingFromLocal = registeredCommandNames.filter(name => !localCommandNames.includes(name));

      if (missingFromDiscord.length > 0) {
        embed.addFields({
          name: '⚠️ Missing from Discord',
          value: missingFromDiscord.join(', '),
          inline: false
        });
      }

      if (missingFromLocal.length > 0) {
        embed.addFields({
          name: '⚠️ Extra on Discord',
          value: missingFromLocal.join(', '),
          inline: false
        });
      }

      let recommendations = '';
      
      if (!hasApplicationCommands || !hasSlashCommands) {
        recommendations += '• ❌ Bot lacks command permissions - Re-invite with proper permissions\n';
      }
      
      if (localCommands.length !== applicationCommands.cache.size) {
        recommendations += '• 🔄 Commands out of sync - Restart bot to re-register\n';
      }
      
      if (applicationCommands.cache.size === 0) {
        recommendations += '• ⚠️ No commands registered - Check bot token and permissions\n';
      }

      if (recommendations) {
        embed.addFields({
          name: '💡 Recommendations',
          value: recommendations,
          inline: false
        });
      } else {
        embed.addFields({
          name: '✅ Status',
          value: 'Everything looks good!',
          inline: false
        });
      }

      embed.setFooter({ text: 'Bot diagnostic complete', iconURL: interaction.guild.iconURL() });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Bot status command error:', error);
      await interaction.editReply({
        content: `❌ Error checking bot status: ${error.message}`,
      });
    }
  },
};