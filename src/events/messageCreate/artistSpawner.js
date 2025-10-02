const { EmbedBuilder } = require('discord.js');
const { 
  getRandomArtist, 
  addArtistToCollection, 
  isValidGuess, 
  getSpawnInterval, 
  loadSpawnData, 
  saveSpawnData,
  RARITY_CONFIG 
} = require('../../utils/artistSpawner');

// Global spawn tracking
let spawnTimer = null;
let client = null;
let isInitialized = false;

// Channel ID where artists spawn (update this to your channel)
const SPAWN_CHANNEL_ID = '1423265563844804720'; // Replace with your actual channel ID

module.exports = async (message) => {
  // Store client reference for spawning (only initialize once)
  if (!client || !isInitialized) {
    client = message.client;
    if (!isInitialized) {
      isInitialized = true;
      startSpawnTimer();
      console.log('🎵 Artist spawner initialized ONCE!');
    }
  }

  // Handle artist guesses
  if (message.author.bot || !message.guild) return;

  const spawnData = loadSpawnData();
  const channelId = message.channel.id;
  
  // Check if there's an active spawn in this channel
  if (spawnData.activeSpawns[channelId]) {
    const activeSpawn = spawnData.activeSpawns[channelId];
    const guess = message.content.toLowerCase().trim();
    
    // Check if the guess is correct
    if (isValidGuess(guess, activeSpawn.artist)) {
      // User caught the artist!
      const userCollection = addArtistToCollection(message.author.id, activeSpawn.artist);
      
      // Remove the active spawn
      delete spawnData.activeSpawns[channelId];
      saveSpawnData(spawnData);
      
      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setTitle('Artist Caught!')
        .setDescription(`**${message.author.displayName}** caught **${activeSpawn.artist.name}**!`)
        .setColor(RARITY_CONFIG[activeSpawn.artist.rarity].color)
        .setThumbnail(activeSpawn.artist.image)
        .addFields(
          { name: 'Artist', value: activeSpawn.artist.name, inline: true },
          { name: 'Rarity', value: `${activeSpawn.artist.rarity.toUpperCase()}`, inline: true },
          { name: 'Total Collected', value: userCollection.totalCaught.toString(), inline: true }
        )
        .setFooter({ text: `Use /artists to see your collection!`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      await message.channel.send({ embeds: [successEmbed] });
      
      // Schedule next spawn
      scheduleNextSpawn();
      
      console.log(`🎤 ${message.author.tag} caught ${activeSpawn.artist.name} (${activeSpawn.artist.rarity})`);
    }
  }
};

function startSpawnTimer() {
  console.log('🎵 Artist spawner initialized!');
  
  // First spawn after just 30 seconds for testing
  console.log('🕐 First artist will spawn in 30 seconds...');
  spawnTimer = setTimeout(() => {
    spawnArtist();
  }, 30000); // 30 seconds for first spawn
}

function scheduleNextSpawn() {
  if (spawnTimer) {
    clearTimeout(spawnTimer);
  }
  
  // Use shorter intervals for testing: 2-10 minutes instead of 30min-3hours
  const minInterval = 2 * 60 * 1000; // 2 minutes
  const maxInterval = 10 * 60 * 1000; // 10 minutes
  const interval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  
  const nextSpawnTime = new Date(Date.now() + interval);
  
  console.log(`🕐 Next artist spawn in ${Math.round(interval / (1000 * 60))} minutes (at ${nextSpawnTime.toLocaleTimeString()})`);
  
  spawnTimer = setTimeout(() => {
    spawnArtist();
  }, interval);
}

async function spawnArtist() {
  console.log('🎯 Attempting to spawn artist...');
  
  if (!client) {
    console.error('❌ Client not available for spawning!');
    return;
  }
  
  try {
    console.log(`🔍 Looking for channel: ${SPAWN_CHANNEL_ID}`);
    const channel = client.channels.cache.get(SPAWN_CHANNEL_ID);
    
    if (!channel) {
      console.error(`❌ Spawn channel not found! ID: ${SPAWN_CHANNEL_ID}`);
      console.log(`📋 Available channels: ${client.channels.cache.map(c => `${c.name} (${c.id})`).join(', ')}`);
      scheduleNextSpawn(); // Reschedule anyway
      return;
    }
    
    console.log(`✅ Found channel: ${channel.name}`);
    const artist = getRandomArtist();
    console.log(`🎤 Generated artist: ${artist.name} (${artist.rarity})`);
    
    const spawnData = loadSpawnData();
    
    // Store active spawn
    spawnData.activeSpawns[channel.id] = {
      artist,
      spawnTime: Date.now()
    };
    spawnData.lastSpawn = Date.now();
    saveSpawnData(spawnData);
    console.log(`💾 Saved spawn data for ${artist.name}`);
    
    // Create spawn embed with working image
    const spawnEmbed = new EmbedBuilder()
      .setTitle('A Wild Artist Appeared!')
      .setDescription(`A **${artist.rarity.toUpperCase()}** artist has appeared!\n\n**Type the artist's name to catch them!**`)
      .setColor(RARITY_CONFIG[artist.rarity].color)
      .setImage(artist.image)
      .addFields(
        { name: 'Time Limit', value: '2 minutes', inline: true },
        { name: 'Rarity', value: `${artist.rarity.toUpperCase()}`, inline: true },
        { name: 'Hint', value: getHint(artist), inline: false }
      )
      .setFooter({ text: 'First correct guess wins! Good luck!' })
      .setTimestamp();

    await channel.send({ embeds: [spawnEmbed] });
    
    console.log(`🎵 ${artist.name} (${artist.rarity}) spawned in ${channel.name}`);
    
    // Set timeout for spawn expiration (2 minutes)
    setTimeout(() => {
      expireSpawn(channel.id, artist);
    }, 2 * 60 * 1000);
    
    // Schedule next spawn
    scheduleNextSpawn();
    
  } catch (error) {
    console.error('❌ Error spawning artist:', error);
    scheduleNextSpawn(); // Reschedule on error
  }
}

function getHint(artist) {
  const hints = [
    `**${artist.name.length} letters** in their name`,
    `**Starts with "${artist.name.charAt(0).toUpperCase()}"**`,
    `**Think ${artist.rarity} artists...**`
  ];
  
  // Add specific hints based on rarity
  if (artist.rarity === 'legendary') {
    hints.push('**A true legend of music history!**');
  } else if (artist.rarity === 'rare') {
    hints.push('**An iconic superstar!**');
  } else if (artist.rarity === 'uncommon') {
    hints.push('**A chart-topping sensation!**');
  }
  
  return hints[Math.floor(Math.random() * hints.length)];
}

async function expireSpawn(channelId, artist) {
  try {
    const spawnData = loadSpawnData();
    
    // Check if spawn is still active
    if (spawnData.activeSpawns[channelId]) {
      delete spawnData.activeSpawns[channelId];
      saveSpawnData(spawnData);
      
      const channel = client.channels.cache.get(channelId);
      if (channel) {
        const expiredEmbed = new EmbedBuilder()
          .setTitle('Artist Escaped!')
          .setDescription(`**${artist.name}** got away! Better luck next time.`)
          .setColor('#e74c3c')
          .setThumbnail(artist.image)
          .addFields(
            { name: 'It was', value: artist.name, inline: true },
            { name: 'Rarity', value: `${artist.rarity.toUpperCase()}`, inline: true }
          )
          .setFooter({ text: 'Stay alert for the next spawn!' })
          .setTimestamp();

        await channel.send({ embeds: [expiredEmbed] });
        
        console.log(`⏰ ${artist.name} (${artist.rarity}) expired in ${channel.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling spawn expiration:', error);
  }
}