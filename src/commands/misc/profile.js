const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
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


  const { embed, buttons } = createProfilePage(profile, user, 'overview');
  
  const response = await interaction.reply({ 
    embeds: [embed], 
    components: [buttons],
    fetchReply: true 
  });


  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 300000 
  });

  collector.on('collect', async (buttonInteraction) => {
    if (buttonInteraction.user.id !== interaction.user.id && buttonInteraction.user.id !== user.id) {
      return buttonInteraction.reply({ content: '❌ You cannot interact with this profile!', ephemeral: true });
    }

    const page = buttonInteraction.customId;
    const { embed: newEmbed, buttons: newButtons } = createProfilePage(profile, user, page);
    
    await buttonInteraction.update({ 
      embeds: [newEmbed], 
      components: [newButtons] 
    });
  });

  collector.on('end', async () => {
    const disabledButtons = ActionRowBuilder.from(buttons);
    disabledButtons.components.forEach(button => button.setDisabled(true));
    
    try {
      await response.edit({ components: [disabledButtons] });
    } catch (error) {
    }
  });
}

const PROFILE_PAGES = ['overview', 'artists', 'songs', 'vinyls', 'genres'];

function createProfilePage(profile, user, page) {
  const embed = new EmbedBuilder()
    .setTitle(`🎵 ${user.displayName}'s Music Profile`)
    .setThumbnail(user.displayAvatarURL())
    .setColor('#1DB954')
    .setTimestamp(new Date(profile.createdAt));

  const currentIdx = PROFILE_PAGES.indexOf(page);
  const previousIdx = currentIdx > 0 ? currentIdx - 1 : PROFILE_PAGES.length - 1;
  const nextIdx = currentIdx < PROFILE_PAGES.length - 1 ? currentIdx + 1 : 0;

  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(PROFILE_PAGES[previousIdx])
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⬅️'),
      new ButtonBuilder()
        .setCustomId('current')
        .setLabel(getPageDisplayName(page))
        .setStyle(ButtonStyle.Primary)
        .setEmoji(getPageEmoji(page))
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(PROFILE_PAGES[nextIdx])
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('➡️')
    );

  switch (page) {
    case 'overview':
      let overviewText = '';
      if (profile.bio) {
        overviewText += `**Bio:** *${profile.bio}*\n\n`;
      }
      
      const artistCount = (profile.favoriteArtists && profile.favoriteArtists.length) || 0;
      const songCount = (profile.favoriteSongs && profile.favoriteSongs.length) || 0;
      const vinylCount = (profile.favoriteVinyls && profile.favoriteVinyls.length) || 0;
      const genreCount = (profile.favoriteGenres && profile.favoriteGenres.length) || 0;
      
      overviewText += `📊 **Profile Stats:**\n`;
      overviewText += `• **Artists:** ${artistCount}\n`;
      overviewText += `• **Songs:** ${songCount}\n`;
      overviewText += `• **Vinyls:** ${vinylCount}\n`;
      overviewText += `• **Genres:** ${genreCount}\n\n`;
      overviewText += `Use the buttons below to explore different sections!`;
      
      embed.setDescription(overviewText);
      break;

    case 'artists':
      if (profile.favoriteArtists && profile.favoriteArtists.length > 0) {
        const artistList = profile.favoriteArtists.map(artist => `• ${artist}`).join('\n');
        embed.setDescription(`**Favorite Artists:**\n\n${artistList}`);
      } else {
        embed.setDescription('**Favorite Artists:**\n\nNo favorite artists added yet.');
      }
      break;

    case 'songs':
      if (profile.favoriteSongs && profile.favoriteSongs.length > 0) {
        const songList = profile.favoriteSongs.map(song => `• ${song}`).join('\n');
        embed.setDescription(`**Favorite Songs:**\n\n${songList}`);
      } else {
        embed.setDescription('**Favorite Songs:**\n\nNo favorite songs added yet.');
      }
      break;

    case 'vinyls':
      if (profile.favoriteVinyls && profile.favoriteVinyls.length > 0) {
        const vinylList = profile.favoriteVinyls.map(vinyl => `• ${vinyl}`).join('\n');
        embed.setDescription(`**Favorite Vinyls:**\n\n${vinylList}`);
      } else {
        embed.setDescription('**Favorite Vinyls:**\n\nNo favorite vinyls added yet.');
      }
      break;

    case 'genres':
      if (profile.favoriteGenres && profile.favoriteGenres.length > 0) {
        const genreList = profile.favoriteGenres.map(genre => `• ${genre}`).join('\n');
        embed.setDescription(`**Favorite Genres:**\n\n${genreList}`);
      } else {
        embed.setDescription('**Favorite Genres:**\n\nNo favorite genres added yet.');
      }
      break;
  }

  const footerCurrentIndex = PROFILE_PAGES.indexOf(page);
  embed.setFooter({ text: `Profile created • Page ${footerCurrentIndex + 1} of ${PROFILE_PAGES.length} • Use arrows to navigate` });

  return { embed, buttons };
}

function getPageDisplayName(page) {
  const names = {
    'overview': 'Overview',
    'artists': 'Artists',
    'songs': 'Songs', 
    'vinyls': 'Vinyls',
    'genres': 'Genres'
  };
  return names[page] || 'Overview';
}

function getPageEmoji(page) {
  const emojis = {
    'overview': '📋',
    'artists': '🎤',
    'songs': '🎵',
    'vinyls': '💿', 
    'genres': '🎼'
  };
  return emojis[page] || '📋';
}

async function createProfile(interaction) {
  const existingProfile = profileManager.getProfile(interaction.user.id);
  
  if (existingProfile) {
    return interaction.reply({ 
      content: '❌ You already have a profile! Use `/profile view` to see it or the `/add-favorite` and `/remove-favorite` commands to customize it.', 
      ephemeral: true 
    });
  }

  const newProfile = profileManager.createProfile(interaction.user.id);
  
  const embed = new EmbedBuilder()
    .setTitle('🎵 Profile Created Successfully!')
    .setDescription('🌟 Welcome to your music journey! Your profile has been created and is ready to be customized.')
    .setColor('#00ff7f')
    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { 
        name: '🎤 Add Your Favorites', 
        value: '• `/add-favorite artist <name>` - Add favorite artists\n• `/add-favorite song <name>` - Add favorite songs\n• `/add-favorite vinyl <name>` - Add favorite vinyls\n• `/add-favorite genre <name>` - Add favorite genres',
        inline: false
      },
      {
        name: '✏️ Customize Further',
        value: '• `/set-bio <text>` - Add a personal bio\n• `/remove-favorite` - Remove items you no longer like\n• `/profile view` - See your completed profile',
        inline: false
      },
      {
        name: '📊 Explore More',
        value: '• `/music-stats` - View server music statistics\n• `/profile view @user` - Check out other profiles',
        inline: false
      }
    )
    .setFooter({ text: 'Start building your music identity!', iconURL: interaction.guild.iconURL() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}