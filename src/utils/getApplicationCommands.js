module.exports = async (client) => {
  try {
    if (!client.application) {
      throw new Error('Client application is not available. Make sure the bot is logged in.');
    }
    
    const applicationCommands = client.application.commands;
    await applicationCommands.fetch();
    return applicationCommands;
  } catch (error) {
    console.error('Error fetching application commands:', error);
    throw error;
  }
};