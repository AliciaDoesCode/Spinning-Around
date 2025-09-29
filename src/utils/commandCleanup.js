const getApplicationCommands = require('./getApplicationCommands');

/**
 * Utility to manually clean up all Discord commands
 * Use this if you want to reset all commands
 */
async function cleanupAllCommands(client) {
  try {
    console.log('🧹 Starting manual command cleanup...');
    const applicationCommands = await getApplicationCommands(client);
    
    if (applicationCommands.cache.size === 0) {
      console.log('✅ No commands to clean up');
      return;
    }

    let deletedCount = 0;
    for (const [id, command] of applicationCommands.cache) {
      try {
        await applicationCommands.delete(id);
        deletedCount++;
        console.log(`🗑️ Deleted command: "${command.name}"`);
      } catch (error) {
        console.error(`❌ Failed to delete command "${command.name}":`, error.message);
      }
    }

    console.log(`✅ Manual cleanup complete! Deleted ${deletedCount} commands`);
  } catch (error) {
    console.error('❌ Error during manual cleanup:', error);
  }
}

/**
 * Utility to delete specific commands by name
 */
async function deleteSpecificCommands(client, commandNames) {
  try {
    console.log(`🎯 Deleting specific commands: ${commandNames.join(', ')}`);
    const applicationCommands = await getApplicationCommands(client);
    
    let deletedCount = 0;
    for (const [id, command] of applicationCommands.cache) {
      if (commandNames.includes(command.name)) {
        try {
          await applicationCommands.delete(id);
          deletedCount++;
          console.log(`🗑️ Deleted command: "${command.name}"`);
        } catch (error) {
          console.error(`❌ Failed to delete command "${command.name}":`, error.message);
        }
      }
    }

    console.log(`✅ Deleted ${deletedCount} specific commands`);
  } catch (error) {
    console.error('❌ Error deleting specific commands:', error);
  }
}

module.exports = {
  cleanupAllCommands,
  deleteSpecificCommands
};