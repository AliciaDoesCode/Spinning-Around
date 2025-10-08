const { PermissionFlagsBits, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { getRandomArtist, loadSpawnData, saveSpawnData, RARITY_CONFIG } = require('../../utils/artistSpawner');

module.exports = {
  name: 'spawn-artist',
  description: 'Manually spawn an artist (Admin only)',
  options: [
    {
      name: 'rarity',
      description: 'Force spawn a specific rarity (optional)',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: '⚪ Common', value: 'common' },
        { name: '🟢 Uncommon', value: 'uncommon' },
        { name: '🔵 Rare', value: 'rare' },
        { name: '🟡 Legendary', value: 'legendary' }
      ]
    }
  ],
  testOnly: false,

  callback: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '❌ You need Administrator permissions to use this command!', 
        ephemeral: true 
      });
    }

    try {
      const forceRarity = interaction.options.getString('rarity');
      let artist;

      if (forceRarity) {

        const { ARTISTS } = require('../../utils/artistSpawner');
        const artistList = ARTISTS[forceRarity];
        const randomArtist = artistList[Math.floor(Math.random() * artistList.length)];
        artist = {
          ...randomArtist,
          rarity: forceRarity,
          id: `${forceRarity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        artist = getRandomArtist();
      }

      const spawnData = loadSpawnData();
      const channelId = interaction.channel.id;
      

      if (spawnData.activeSpawns[channelId]) {
        return interaction.reply({ 
          content: '❌ There is already an active artist spawn in this channel!', 
          ephemeral: true 
        });
      }


      spawnData.activeSpawns[channelId] = {
        artist,
        spawnTime: Date.now(),
        isManual: true
      };
      saveSpawnData(spawnData);


      const spawnEmbed = new EmbedBuilder()
        .setTitle('🎤 A Wild Artist Appeared!')
        .setDescription(`A ${RARITY_CONFIG[artist.rarity].emoji} **${artist.rarity.toUpperCase()}** artist has appeared!\n\n🎯 **Type the artist's name to catch them!**`)
        .setColor(RARITY_CONFIG[artist.rarity].color)
        .setImage(artist.image)
        .addFields(
          { name: '⏱️ Time Limit', value: '2 minutes', inline: true },
          { name: '✨ Rarity', value: `${RARITY_CONFIG[artist.rarity].emoji} ${artist.rarity.toUpperCase()}`, inline: true },
          { name: '💡 Hint', value: getHint(artist), inline: false }
        )
        .setFooter({ text: 'First correct guess wins! Good luck!' })
        .setTimestamp();

      await interaction.reply({ embeds: [spawnEmbed] });


      setTimeout(() => {
        interaction.followUp({ 
          content: `✅ **${artist.name}** (${artist.rarity}) spawned manually!`, 
          ephemeral: true 
        });
      }, 1000);


      setTimeout(async () => {
        const currentSpawnData = loadSpawnData();
        if (currentSpawnData.activeSpawns[channelId]) {
          delete currentSpawnData.activeSpawns[channelId];
          saveSpawnData(currentSpawnData);
          
          const expiredEmbed = new EmbedBuilder()
            .setTitle('⏰ Artist Escaped!')
            .setDescription(`**${artist.name}** got away! Better luck next time.`)
            .setColor('#e74c3c')
            .setThumbnail(artist.image)
            .addFields(
              { name: '🎤 It was', value: artist.name, inline: true },
              { name: '✨ Rarity', value: `${RARITY_CONFIG[artist.rarity].emoji} ${artist.rarity.toUpperCase()}`, inline: true }
            )
            .setFooter({ text: 'Stay alert for the next spawn!' })
            .setTimestamp();

          await interaction.followUp({ embeds: [expiredEmbed] });
        }
      }, 2 * 60 * 1000);

      console.log(`🎵 Manual spawn: ${artist.name} (${artist.rarity}) in ${interaction.channel.name}`);

    } catch (error) {
      console.error('Spawn artist command error:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while spawning the artist.', 
        ephemeral: true 
      });
    }
  },
};

function getHint(artist) {
  const hints = [
    `🔤 **${artist.name.length} letters** in their name`,
    `🎵 **Starts with "${artist.name.charAt(0).toUpperCase()}"**`,
    `💭 **Think ${artist.rarity} artists...**`
  ];
  

  if (artist.rarity === 'legendary') {
    hints.push('👑 **A true legend of music history!**');
  } else if (artist.rarity === 'rare') {
    hints.push('⭐ **An iconic superstar!**');
  } else if (artist.rarity === 'uncommon') {
    hints.push('🌟 **A chart-topping sensation!**');
  }
  
  return hints[Math.floor(Math.random() * hints.length)];
}