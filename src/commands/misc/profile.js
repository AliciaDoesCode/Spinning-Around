const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const profileManager = require('../../utils/profileManager');

module.exports = {
  name: 'profile',
  description: 'Manage your music profile',
  options: [
    {
      name: 'action',
      description: 'What do you want to do?',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: 'view',
          value: 'view'
        },
        {
          name: 'create',
          value: 'create'
        },
        {
          name: 'edit',
          value: 'edit'
        },
        {
          name: 'delete',
          value: 'delete'
        }
      ]
    },
    {
      name: 'user',
      description: 'View another user\'s profile',
      type: ApplicationCommandOptionType.User,
      required: false
    }
  ],
  testOnly: false,

  callback: async (client, interaction) => {
    const action = interaction.options.getString('action');
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    try {
      switch (action) {
        case 'view':
          await viewProfile(interaction, targetUser);
          break;
        case 'create':
          if (targetUser.id !== interaction.user.id) {
            return interaction.reply({ content: '❌ You can only create your own profile!', ephemeral: true });
          }
          await createProfile(interaction);
          break;
        case 'edit':
          if (targetUser.id !== interaction.user.id) {
            return interaction.reply({ content: '❌ You can only edit your own profile!', ephemeral: true });
          }
          await editProfile(interaction);
          break;
        case 'delete':
          if (targetUser.id !== interaction.user.id) {
            return interaction.reply({ content: '❌ You can only delete your own profile!', ephemeral: true });
          }
          await deleteProfile(interaction);
          break;
      }
    } catch (error) {
      console.error('Profile command error:', error);
      await interaction.reply({ content: '❌ An error occurred while processing your request.', ephemeral: true });
    }
  },
};

async function viewProfile(interaction, user) {
  const profile = profileManager.getProfile(user.id);
  
  if (!profile) {
    const isOwnProfile = user.id === interaction.user.id;
    const message = isOwnProfile 
      ? '❌ You don\'t have a profile yet! Use `/profile create` to get started.'
      : `❌ ${user.displayName} doesn't have a profile yet.`;
    
    return interaction.reply({ content: message, ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle(`🎵  ${user.displayName}'s Music Profile`)
    .setThumbnail(user.displayAvatarURL())
    .setColor('#1DB954') // Spotify green
    .setTimestamp(new Date(profile.createdAt));

  if (profile.bio) {
    embed.setDescription(`*${profile.bio}*`);
  }

  if (profile.favoriteArtists.length > 0) {
    embed.addFields({
      name: 'Favorite Artists',
      value: profile.favoriteArtists.slice(0, 10).map((artist, i) => `• ${artist}`).join('\n') || 'None added yet',
      inline: true
    });
  }

  if (profile.favoriteSongs.length > 0) {
    embed.addFields({
      name: 'Favorite Songs',
      value: profile.favoriteSongs.slice(0, 10).map((song, i) => `• ${song}`).join('\n') || 'None added yet',
      inline: true
    });
  }

  if (profile.favoriteVinyls.length > 0) {
    embed.addFields({
      name: 'Favorite Vinyls',
      value: profile.favoriteVinyls.slice(0, 10).map((vinyl, i) => `• ${vinyl}`).join('\n') || 'None added yet',
      inline: true
    });
  }

  if (profile.favoriteGenres.length > 0) {
    embed.addFields({
      name: 'Favorite Genres',
      value: profile.favoriteGenres.map(genre => `• ${genre}`).join('\n'),
      inline: false
    });
  }

  embed.setFooter({ text: `Profile created` });

  await interaction.reply({ embeds: [embed] });
}

async function createProfile(interaction) {
  const existingProfile = profileManager.getProfile(interaction.user.id);
  
  if (existingProfile) {
    return interaction.reply({ content: '❌ You already have a profile! Use `/profile edit` to update it.', ephemeral: true });
  }

  const newProfile = profileManager.createProfile(interaction.user.id);
  
  const embed = new EmbedBuilder()
    .setTitle('🎵 Profile Created!')
    .setDescription('Your music profile has been created! Use `/add-favorite` commands to customize it.')
    .setColor('#00ff00')
    .addFields(
      { name: 'Next Steps', value: '• Use `/add-favorite artist <name>` to add favorite artists\n• Use `/add-favorite song <name>` to add favorite songs\n• Use `/add-favorite vinyl <name>` to add favorite vinyls\n• Use `/set-bio <text>` to add a personal bio' }
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function editProfile(interaction) {
  const profile = profileManager.getProfile(interaction.user.id);
  
  if (!profile) {
    return interaction.reply({ content: '❌ You don\'t have a profile yet! Use `/profile create` first.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle('✏️ Edit Your Profile')
    .setDescription('Use these commands to edit your profile:')
    .setColor('#ffaa00')
    .addFields(
      { name: 'Add Items', value: '• `/add-favorite artist <name>`\n• `/add-favorite song <name>`\n• `/add-favorite vinyl <name>`\n• `/add-favorite genre <name>`' },
      { name: 'Remove Items', value: '• `/remove-favorite artist <name>`\n• `/remove-favorite song <name>`\n• `/remove-favorite vinyl <name>`\n• `/remove-favorite genre <name>`' },
      { name: 'Other', value: '• `/set-bio <text>` - Update your bio\n• `/profile view` - View your current profile' }
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function deleteProfile(interaction) {
  const profile = profileManager.getProfile(interaction.user.id);
  
  if (!profile) {
    return interaction.reply({ content: '❌ You don\'t have a profile to delete.', ephemeral: true });
  }

  profileManager.deleteProfile(interaction.user.id);
  
  await interaction.reply({ content: '✅ Your profile has been deleted successfully.', ephemeral: true });
}