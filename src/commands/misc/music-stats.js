const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const profileManager = require('../../utils/profileManager');

module.exports = {
  name: 'music-stats',
  description: 'View music profile statistics and leaderboards',
  options: [
    {
      name: 'type',
      description: 'What stats do you want to see?',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: 'server',
          value: 'server'
        },
        {
          name: 'top-artists',
          value: 'top-artists'
        },
        {
          name: 'top-genres',
          value: 'top-genres'
        }
      ]
    }
  ],
  testOnly: false,

  callback: async (client, interaction) => {
    const type = interaction.options.getString('type') || 'server';

    try {
      switch (type) {
        case 'server':
          await showServerStats(interaction);
          break;
        case 'top-artists':
          await showTopArtists(interaction);
          break;
        case 'top-genres':
          await showTopGenres(interaction);
          break;
      }
    } catch (error) {
      console.error('Music stats error:', error);
      await interaction.reply({ content: '❌ An error occurred while fetching stats.', ephemeral: true });
    }
  },
};

async function showServerStats(interaction) {
  const stats = profileManager.getProfileStats();
  
  const embed = new EmbedBuilder()
    .setTitle('📊 Server Music Statistics')
    .setColor('#9b59b6')
    .setThumbnail(interaction.guild.iconURL())
    .addFields(
      { name: '👥 Total Profiles', value: stats.totalProfiles.toString(), inline: true },
      { name: '🎤 Total Artists', value: stats.totalArtists.toString(), inline: true },
      { name: '🎵 Total Songs', value: stats.totalSongs.toString(), inline: true },
      { name: '💿 Total Vinyls', value: stats.totalVinyls.toString(), inline: true },
      { name: '🎼 Total Genres', value: stats.totalGenres.toString(), inline: true },
      { name: '📈 Average per Profile', value: `${stats.totalProfiles > 0 ? Math.round((stats.totalArtists + stats.totalSongs + stats.totalVinyls) / stats.totalProfiles) : 0} items`, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function showTopArtists(interaction) {
  const allProfiles = profileManager.getAllProfiles();
  const artistCounts = {};

  // Count all artists across profiles
  Object.values(allProfiles).forEach(profile => {
    profile.favoriteArtists.forEach(artist => {
      const lowerArtist = artist.toLowerCase();
      artistCounts[lowerArtist] = (artistCounts[lowerArtist] || 0) + 1;
    });
  });

  // Sort by count and get top 10
  const topArtists = Object.entries(artistCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([artist, count], index) => {
      const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
      return `${medal} ${artist} (${count} ${count === 1 ? 'person' : 'people'})`;
    });

  const embed = new EmbedBuilder()
    .setTitle('🎤 Most Popular Artists')
    .setColor('#e74c3c')
    .setDescription(topArtists.length > 0 ? topArtists.join('\n') : 'No artists found yet!')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function showTopGenres(interaction) {
  const allProfiles = profileManager.getAllProfiles();
  const genreCounts = {};

  // Count all genres across profiles
  Object.values(allProfiles).forEach(profile => {
    profile.favoriteGenres.forEach(genre => {
      const lowerGenre = genre.toLowerCase();
      genreCounts[lowerGenre] = (genreCounts[lowerGenre] || 0) + 1;
    });
  });

  // Sort by count and get top 10
  const topGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([genre, count], index) => {
      const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
      return `${medal} ${genre} (${count} ${count === 1 ? 'person' : 'people'})`;
    });

  const embed = new EmbedBuilder()
    .setTitle('🎼 Most Popular Genres')
    .setColor('#f39c12')
    .setDescription(topGenres.length > 0 ? topGenres.join('\n') : 'No genres found yet!')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}