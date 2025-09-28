const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client) => {
  console.log('🔄 Starting command registration...');
  try {
    const localCommands = getLocalCommands();
    const localCommandNames = localCommands.map(cmd => cmd.name);
    const applicationCommands = await getApplicationCommands(client);

    // Delete Discord commands that no longer exist locally
    for (const [id, appCommand] of applicationCommands.cache) {
      if (!localCommandNames.includes(appCommand.name)) {
        await applicationCommands.delete(id);
        console.log(`🗑 Deleted command from Discord: "${appCommand.name}" (no longer exists locally).`);
      }
    }

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;
      const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === name);

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted command "${name}".`);
          continue;
        }
        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });
          console.log(`🔁 Edited command "${name}".`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(`⏩ Skipping registering command "${name}" as it's set to delete.`);
          continue;
        }
        await applicationCommands.create({
          name,
          description,
          options,
        });
        console.log(`👍 Registered command "${name}".`);
      }
    }
    console.log('✅ Command registration complete.');
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
};