const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'debug-bot',
  description: 'Debug bot information and permissions',
  
  callback: async (client, interaction) => {
    try {
      const guild = interaction.guild;
      const botMember = guild.members.cache.get(client.user.id);
      
      const debugEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('🔍 Bot Debug Information')
        .addFields(
          { name: '🤖 Bot ID', value: client.user.id, inline: true },
          { name: '📛 Bot Tag', value: client.user.tag, inline: true },
          { name: '🏠 Guild ID', value: guild.id, inline: true },
          { name: '👑 Bot Permissions', value: botMember.permissions.toArray().slice(0, 10).join(', ') + (botMember.permissions.toArray().length > 10 ? '...' : ''), inline: false },
          { name: '📊 Application ID', value: client.application.id, inline: true },
          { name: '🕐 Bot Ready Since', value: `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`, inline: true }
        )
        .setTimestamp();
        
      await interaction.reply({ embeds: [debugEmbed], ephemeral: true });
      
    } catch (error) {
      console.error('Debug command error:', error);
      await interaction.reply({ 
        content: `❌ Debug error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
};