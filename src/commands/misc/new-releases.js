const { EmbedBuilder } = require('discord.js');
const SpotifyWebApi = require('spotify-web-api-node');

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

module.exports = {
  name: 'new-releases',
  description: 'View this week\'s new album releases',
  options: [
    {
      name: 'genre',
      description: 'Filter by music genre (optional)',
      type: 3, // STRING
      required: false,
      choices: [
        { name: 'All Genres', value: 'all' },
        { name: 'Pop', value: 'pop' },
        { name: 'Rock', value: 'rock' },
        { name: 'Hip-Hop', value: 'hip-hop' },
        { name: 'Electronic', value: 'electronic' },
        { name: 'Country', value: 'country' },
        { name: 'R&B', value: 'rnb' },
        { name: 'Alternative', value: 'alternative' }
      ]
    },
    {
      name: 'region',
      description: 'Region for new releases (optional)',
      type: 3, // STRING
      required: false,
      choices: [
        { name: 'Global', value: 'global' },
        { name: 'United States', value: 'US' },
        { name: 'United Kingdom', value: 'GB' },
        { name: 'Canada', value: 'CA' },
        { name: 'Australia', value: 'AU' },
        { name: 'Germany', value: 'DE' },
        { name: 'France', value: 'FR' },
        { name: 'Japan', value: 'JP' }
      ]
    }
  ],

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const genre = interaction.options.getString('genre') || 'all';
    const region = interaction.options.getString('region') || 'US';

    try {
      // Check if Spotify credentials are configured
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        throw new Error('Spotify API credentials not configured');
      }

      // Get access token for Spotify API
      const tokenResponse = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(tokenResponse.body.access_token);

      // Get current date and calculate this week's range
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };

      // Fetch new releases from Spotify
      const newReleasesResponse = await spotifyApi.getNewReleases({
        limit: 50,
        offset: 0,
        country: region === 'global' ? undefined : region
      });

      const albums = newReleasesResponse.body.albums.items;
      
      // Filter albums released this week
      const thisWeekReleases = albums.filter(album => {
        const releaseDate = new Date(album.release_date);
        return releaseDate >= startOfWeek && releaseDate <= endOfWeek;
      });

      // Process and format the releases
      let filteredReleases = thisWeekReleases.map(album => ({
        artist: album.artists.map(artist => artist.name).join(', '),
        album: album.name,
        releaseDate: album.release_date,
        genre: 'Various', // Spotify doesn't provide genre in new releases endpoint
        label: album.label || 'Unknown Label',
        trackCount: album.total_tracks,
        spotifyUrl: album.external_urls.spotify,
        imageUrl: album.images[0]?.url,
        albumType: album.album_type
      }));

      if (genre !== 'all' && filteredReleases.length > 0) {
        const genreFilteredReleases = [];
        
        for (const release of filteredReleases.slice(0, 20)) { // Limit to avoid rate limits
          try {
            const artistSearch = await spotifyApi.searchArtists(release.artist.split(',')[0].trim(), { limit: 1 });
            if (artistSearch.body.artists.items.length > 0) {
              const artistGenres = artistSearch.body.artists.items[0].genres;
              const matchesGenre = artistGenres.some(g => 
                g.toLowerCase().includes(genre.toLowerCase()) || 
                genre.toLowerCase().includes(g.toLowerCase())
              );
              
              if (matchesGenre) {
                release.genre = artistGenres[0] || 'Various';
                genreFilteredReleases.push(release);
              }
            }
          } catch (error) {
            // If artist lookup fails, include the release anyway
            genreFilteredReleases.push(release);
          }
        }
        
        filteredReleases = genreFilteredReleases;
      }

      const embed = new EmbedBuilder()
        .setColor(0x1db954) // Spotify green
        .setTitle(`🎵 New Album Releases This Week`)
        .setDescription(`**Week of ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}**\n${region !== 'global' ? `Region: ${region}` : 'Global Releases'}${genre !== 'all' ? ` | Genre: ${genre.charAt(0).toUpperCase() + genre.slice(1)}` : ''}`)
        .setTimestamp();

      if (filteredReleases.length === 0) {
        embed.addFields({
          name: 'No Results',
          value: `No new releases found${genre !== 'all' ? ` for ${genre}` : ''} this week. Try a different filter or check back later!`,
          inline: false
        });
        
        // Show some recent releases if no weekly releases found
        const recentReleases = albums.slice(0, 5);
        if (recentReleases.length > 0) {
          embed.addFields({
            name: 'Recent Releases',
            value: recentReleases.map(album => 
              `• **${album.artists[0].name}** - ${album.name}`
            ).join('\n'),
            inline: false
          });
        }
      } else {
        // Add thumbnail if we have releases with images
        if (filteredReleases[0]?.imageUrl) {
          embed.setThumbnail(filteredReleases[0].imageUrl);
        }

        // Add releases to embed (limit to 8 for better readability with Spotify links)
        const displayReleases = filteredReleases.slice(0, 8);
        
        displayReleases.forEach((release, index) => {
          const releaseDate = new Date(release.releaseDate);
          const formattedDate = releaseDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });

          const albumTypeEmoji = release.albumType === 'single' ? '🎵' : '💿';
          
          embed.addFields({
            name: `${index + 1}. ${release.artist}`,
            value: `${albumTypeEmoji} **[${release.album}](${release.spotifyUrl})**\n📅 Released: ${formattedDate}\n🎵 Genre: ${release.genre}\n📀 Tracks: ${release.trackCount}`,
            inline: true
          });
        });

        // Add footer with additional info
        embed.addFields({
          name: 'Powered by Spotify',
          value: '🎧 Click album names to listen on Spotify\n💡 Data refreshed from Spotify Web API',
          inline: false
        });

        if (filteredReleases.length > 8) {
          embed.addFields({
            name: 'More Releases',
            value: `Showing 8 of ${filteredReleases.length} new releases. Use different filters to see more!`,
            inline: false
          });
        }
      }

      embed.setFooter({ 
        text: 'Data updates weekly | Use filters to customize your results' 
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('New releases command error:', error);
      
      let errorMessage = 'Sorry, I couldn\'t fetch new releases at the moment. Please try again later.';
      let setupInstructions = null;
      
      if (error.message.includes('Spotify API credentials')) {
        errorMessage = 'Spotify API is not configured. Please contact the bot administrator.';
        setupInstructions = {
          name: 'Setup Required',
          value: '**For Bot Administrator:**\n1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)\n2. Create a new app and get Client ID & Secret\n3. Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to environment variables\n4. Restart the bot',
          inline: false
        };
      }
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Error')
        .setDescription(errorMessage)
        .addFields({
          name: 'Alternative Options',
          value: '• Check Spotify\'s "New Releases" playlist\n• Visit your favorite music streaming platform\n• Check music news websites like Pitchfork or Rolling Stone',
          inline: false
        })
        .setTimestamp();

      if (setupInstructions) {
        errorEmbed.addFields(setupInstructions);
      }

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};