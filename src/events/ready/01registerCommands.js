const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client) => {
  console.log('🔄 Starting command registration...');
  try {
    // Wait a bit to ensure client is fully ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const localCommands = getLocalCommands();
    const localCommandNames = localCommands.map(cmd => cmd.name);
    const applicationCommands = await getApplicationCommands(client);

    console.log(`📝 Found ${localCommands.length} local commands`);
    console.log(`📋 Found ${applicationCommands.cache.size} registered Discord commands`);

    // Delete Discord commands that no longer exist locally or are marked as deleted
    let deletedCount = 0;
    for (const [id, appCommand] of applicationCommands.cache) {
      const localCommand = localCommands.find(cmd => cmd.name === appCommand.name);
      
      // Delete if command doesn't exist locally or is marked as deleted
      if (!localCommandNames.includes(appCommand.name) || (localCommand && localCommand.deleted)) {
        try {
          await applicationCommands.delete(id);
          deletedCount++;
          if (localCommand && localCommand.deleted) {
            console.log(`🗑️ Deleted command "${appCommand.name}" (marked as deleted)`);
          } else {
            console.log(`🗑️ Deleted command "${appCommand.name}" (no longer exists locally)`);
          }
        } catch (deleteError) {
          console.error(`❌ Failed to delete command "${appCommand.name}":`, deleteError.message);
        }
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old commands`);
    }

    // Register/update remaining commands
    let registeredCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;
      
      // Skip commands marked as deleted (they were already handled above)
      if (localCommand.deleted) {
        skippedCount++;
        console.log(`⏩ Skipping command "${name}" (marked as deleted)`);
        continue;
      }

      const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === name);

      if (existingCommand) {
        // Update existing command if different
        if (areCommandsDifferent(existingCommand, localCommand)) {
          try {
            await applicationCommands.edit(existingCommand.id, {
              description,
              options,
            });
            updatedCount++;
            console.log(`� Updated command "${name}"`);
          } catch (editError) {
            console.error(`❌ Failed to update command "${name}":`, editError.message);
          }
        } else {
          console.log(`✅ Command "${name}" is up to date`);
        }
      } else {
        // Create new command
        try {
          await applicationCommands.create({
            name,
            description,
            options,
          });
          registeredCount++;
          console.log(`➕ Registered new command "${name}"`);
        } catch (createError) {
          console.error(`❌ Failed to register command "${name}":`, createError.message);
        }
      }
    }

    // Final summary
    console.log('✅ Command registration complete!');
    console.log(`📊 Summary: ${registeredCount} new, ${updatedCount} updated, ${deletedCount} deleted, ${skippedCount} skipped`);
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
};