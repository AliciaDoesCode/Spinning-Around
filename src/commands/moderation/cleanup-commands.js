const { PermissionFlagsBits } = require('discord.js');
const { cleanupAllCommands, deleteSpecificCommands } = require('../../utils/commandCleanup');
const getApplicationCommands = require('../../utils/getApplicationCommands');

module.exports = {
  name: 'cleanup-commands',
  description: 'Cleanup Discord commands (Admin only)',
  
  callback: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '❌ You need Administrator permissions to use this command!', 
        ephemeral: true 
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const applicationCommands = await getApplicationCommands(client);
      const commandCount = applicationCommands.cache.size;

      if (commandCount === 0) {
        return interaction.editReply('✅ No commands found to cleanup!');
      }

      const commandList = applicationCommands.cache.map(cmd => cmd.name).join(', ');
      await interaction.editReply(`🔍 Found ${commandCount} Discord commands: ${commandList}\n\n🧹 Starting cleanup...`);
      await cleanupAllCommands(client);

      await interaction.followUp({ 
        content: `✅ Command cleanup complete! Deleted ${commandCount} commands from Discord.`, 
        ephemeral: true 
      });

    } catch (error) {
      console.error('Cleanup command error:', error);
      await interaction.editReply('❌ An error occurred during command cleanup.');
    }
  },
};