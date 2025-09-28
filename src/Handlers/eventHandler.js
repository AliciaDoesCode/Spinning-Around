const path = require('path');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b);

    // Map folder names to correct Discord.js event names
    let eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
    if (eventName.toLowerCase() === 'interactioncreate') eventName = 'interactionCreate';
    if (eventName.toLowerCase() === 'guildmemberadd') eventName = 'guildMemberAdd';

    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);
        // For interactionCreate, pass client and interaction
        if (eventName === 'interactionCreate') {
          await eventFunction(client, ...args);
        } else {
          await eventFunction(...args);
        }
      }
    });
  }
};