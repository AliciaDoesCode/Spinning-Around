const { ApplicationCommandOptionType } = require('discord.js');
const profileManager = require('../../utils/profileManager');

module.exports = {
  name: 'add-favorite',
  description: 'Add a favorite item to your profile',
  options: [
    {
      name: 'type',
      description: 'What type of favorite do you want to add?',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: 'artist',
          value: 'artist'
        },
        {
          name: 'song',
          value: 'song'
        },
        {
          name: 'vinyl',
          value: 'vinyl'
        },
        {
          name: 'genre',
          value: 'genre'
        }
      ]
    },
    {
      name: 'name',
      description: 'The name of the item to add',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  testOnly: false,

  callback: async (client, interaction) => {
    const type = interaction.options.getString('type');
    const name = interaction.options.getString('name');
    const userId = interaction.user.id;

    const profile = profileManager.getProfile(userId);
    
    if (!profile) {
      return interaction.reply({ content: '❌ You don\'t have a profile yet! Use `/profile create` first.', ephemeral: true });
    }

    try {
      const result = profileManager.addFavorite(userId, type, name);
      
      if (result.success) {
        const typeEmoji = {
          artist: '🎤',
          song: '🎵',
          vinyl: '💿',
          genre: '🎼'
        };
        
        await interaction.reply({ 
          content: `✅ ${typeEmoji[type]} Added "${name}" to your favorite ${type}s!`, 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: `❌ ${result.message}`, 
          ephemeral: true 
        });
      }
    } catch (error) {
      console.error('Add favorite error:', error);
      await interaction.reply({ content: '❌ An error occurred while adding your favorite.', ephemeral: true });
    }
  },
};