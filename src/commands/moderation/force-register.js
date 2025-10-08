const { PermissionFlagsBits } = require('discord.js');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = {
  name: 'force-register',
  description: 'Force re-register all commands (Admin only)',
  
  callback: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '❌ You need Administrator permissions to use this command!', 
        ephemeral: true 
      });
    }

    await interaction.deferReply({ ephemeral: true });
    
    // Add debug information
    console.log(`🔍 Debug Info - Bot ID: ${client.user.id}, Application ID: ${client.application.id}, Guild ID: ${interaction.guild.id}`);

    try {
      const localCommands = getLocalCommands();
      const applicationCommands = await getApplicationCommands(client);

      await interaction.editReply('🔄 Step 1: Clearing all existing commands...');

      // Delete all existing commands
      let deletedCount = 0;
      for (const [id, command] of applicationCommands.cache) {
        try {
          await applicationCommands.delete(id);
          deletedCount++;
          console.log(`🗑️ Deleted: ${command.name}`);
        } catch (error) {
          console.error(`❌ Failed to delete ${command.name}:`, error.message);
        }
      }

      await interaction.editReply(`✅ Step 1 Complete: Deleted ${deletedCount} commands\n\n🔄 Step 2: Registering new commands...`);

      let registeredCount = 0;
      let failedCount = 0;

      for (const localCommand of localCommands) {
        if (localCommand.deleted) continue;

        try {
          await applicationCommands.create({
            name: localCommand.name,
            description: localCommand.description,
            options: localCommand.options || [],
          });
          registeredCount++;
          console.log(`➕ Registered: ${localCommand.name}`);
        } catch (error) {
          failedCount++;
          console.error(`❌ Failed to register ${localCommand.name}:`, error.message);
        }
      }

      const summary = `✅ **Force Registration Complete!**\n\n` +
        `🗑️ **Deleted:** ${deletedCount} commands\n` +
        `➕ **Registered:** ${registeredCount} commands\n` +
        `❌ **Failed:** ${failedCount} commands\n\n` +
        `🎉 Commands should now be available!`;

      await interaction.editReply(summary);

      setTimeout(async () => {
        try {
          await getApplicationCommands(client, true); // Force refresh
          console.log('🔄 Refreshed application commands cache');
        } catch (error) {
          console.error('❌ Failed to refresh cache:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Force register error:', error);
      await interaction.editReply(`❌ Error during force registration: ${error.message}`);
    }
  },
};