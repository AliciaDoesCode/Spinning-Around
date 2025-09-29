const { ApplicationCommandOptionType } = require('discord.js');
const profileManager = require('../../utils/profileManager');

module.exports = {
  name: 'set-bio',
  description: 'Set or update your profile bio',
  options: [
    {
      name: 'bio',
      description: 'Your new bio text (max 200 characters)',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  testOnly: false,

  callback: async (client, interaction) => {
    const bio = interaction.options.getString('bio');
    const userId = interaction.user.id;

    if (bio.length > 200) {
      return interaction.reply({ content: '❌ Bio must be 200 characters or less.', ephemeral: true });
    }

    const profile = profileManager.getProfile(userId);
    
    if (!profile) {
      return interaction.reply({ content: '❌ You don\'t have a profile yet! Use `/profile create` first.', ephemeral: true });
    }

    try {
      profileManager.setBio(userId, bio);
      
      await interaction.reply({ 
        content: `✅ Your bio has been updated!\n\n*${bio}*`, 
        ephemeral: true 
      });
    } catch (error) {
      console.error('Set bio error:', error);
      await interaction.reply({ content: '❌ An error occurred while updating your bio.', ephemeral: true });
    }
  },
};