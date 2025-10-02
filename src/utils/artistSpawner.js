const fs = require('fs');
const path = require('path');

// Artist database with different rarities
const ARTISTS = {
  // Common artists (70% chance) - Well-known but not super rare
  common: [
    { name: 'Taylor Swift', aliases: ['taylor', 'swift', 'taylor swift'], image: 'https://avatars.githubusercontent.com/u/1?v=4' },
    { name: 'Ed Sheeran', aliases: ['ed', 'sheeran', 'ed sheeran'], image: 'https://avatars.githubusercontent.com/u/2?v=4' },
    { name: 'Ariana Grande', aliases: ['ariana', 'grande', 'ariana grande', 'ari'], image: 'https://avatars.githubusercontent.com/u/3?v=4' },
    { name: 'Justin Bieber', aliases: ['justin', 'bieber', 'justin bieber'], image: 'https://avatars.githubusercontent.com/u/4?v=4' },
    { name: 'Dua Lipa', aliases: ['dua', 'lipa', 'dua lipa'], image: 'https://avatars.githubusercontent.com/u/5?v=4' },
    { name: 'The Weeknd', aliases: ['weeknd', 'the weeknd', 'abel'], image: 'https://avatars.githubusercontent.com/u/6?v=4' },
    { name: 'Olivia Rodrigo', aliases: ['olivia', 'rodrigo', 'olivia rodrigo'], image: 'https://avatars.githubusercontent.com/u/7?v=4' },
    { name: 'Harry Styles', aliases: ['harry', 'styles', 'harry styles'], image: 'https://avatars.githubusercontent.com/u/8?v=4' },
    { name: 'Adele', aliases: ['adele'], image: 'https://avatars.githubusercontent.com/u/9?v=4' },
    { name: 'Bruno Mars', aliases: ['bruno', 'mars', 'bruno mars'], image: 'https://avatars.githubusercontent.com/u/10?v=4' }
  ],
  
  // Uncommon artists (20% chance) - Popular but less common spawns
  uncommon: [
    { name: 'Billie Eilish', aliases: ['billie', 'eilish', 'billie eilish'], image: 'https://avatars.githubusercontent.com/u/11?v=4' },
    { name: 'Rihanna', aliases: ['rihanna', 'riri'], image: 'https://avatars.githubusercontent.com/u/12?v=4' },
    { name: 'Drake', aliases: ['drake', 'aubrey'], image: 'https://avatars.githubusercontent.com/u/13?v=4' },
    { name: 'Bad Bunny', aliases: ['bad bunny', 'bunny', 'bad', 'benito'], image: 'https://avatars.githubusercontent.com/u/14?v=4' },
    { name: 'SZA', aliases: ['sza', 'solana'], image: 'https://avatars.githubusercontent.com/u/15?v=4' },
    { name: 'Lana Del Rey', aliases: ['lana', 'del rey', 'lana del rey', 'ldr'], image: 'https://avatars.githubusercontent.com/u/16?v=4' },
    { name: 'Post Malone', aliases: ['post', 'malone', 'post malone', 'posty'], image: 'https://avatars.githubusercontent.com/u/17?v=4' },
    { name: 'Kendrick Lamar', aliases: ['kendrick', 'lamar', 'kendrick lamar', 'kdot'], image: 'https://avatars.githubusercontent.com/u/18?v=4' }
  ],
  
  // Rare artists (8% chance) - Legendary or iconic artists
  rare: [
    { name: 'Beyoncé', aliases: ['beyonce', 'beyoncé', 'bey', 'queen b'], image: 'https://avatars.githubusercontent.com/u/19?v=4' },
    { name: 'Michael Jackson', aliases: ['michael', 'jackson', 'michael jackson', 'mj', 'king of pop'], image: 'https://avatars.githubusercontent.com/u/20?v=4' },
    { name: 'Prince', aliases: ['prince'], image: 'https://avatars.githubusercontent.com/u/21?v=4' },
    { name: 'Madonna', aliases: ['madonna'], image: 'https://avatars.githubusercontent.com/u/22?v=4' },
    { name: 'Whitney Houston', aliases: ['whitney', 'houston', 'whitney houston'], image: 'https://avatars.githubusercontent.com/u/23?v=4' },
    { name: 'Freddie Mercury', aliases: ['freddie', 'mercury', 'freddie mercury'], image: 'https://avatars.githubusercontent.com/u/24?v=4' }
  ],
  
  // Legendary artists (2% chance) - Ultra rare spawns
  legendary: [
    { name: 'Elvis Presley', aliases: ['elvis', 'presley', 'elvis presley', 'king'], image: 'https://avatars.githubusercontent.com/u/25?v=4' },
    { name: 'The Beatles', aliases: ['beatles', 'the beatles', 'fab four'], image: 'https://avatars.githubusercontent.com/u/26?v=4' },
    { name: 'Bob Dylan', aliases: ['bob', 'dylan', 'bob dylan'], image: 'https://avatars.githubusercontent.com/u/27?v=4' },
    { name: 'Johnny Cash', aliases: ['johnny', 'cash', 'johnny cash', 'man in black'], image: 'https://avatars.githubusercontent.com/u/28?v=4' }
  ]
};

// Rarity configurations
const RARITY_CONFIG = {
  common: { weight: 70, color: '#95a5a6' },
  uncommon: { weight: 20, color: '#2ecc71' },
  rare: { weight: 8, color: '#3498db' },
  legendary: { weight: 2, color: '#f1c40f' }
};

// Storage paths
const DATA_DIR = path.join(__dirname, '../../data');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'artist_collections.json');
const SPAWN_DATA_FILE = path.join(DATA_DIR, 'spawn_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(COLLECTIONS_FILE)) {
  fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify({}, null, 2));
}

if (!fs.existsSync(SPAWN_DATA_FILE)) {
  fs.writeFileSync(SPAWN_DATA_FILE, JSON.stringify({ lastSpawn: 0, activeSpawns: {} }, null, 2));
}

function getRandomArtist() {
  const random = Math.random() * 100;
  let rarity;
  
  if (random < RARITY_CONFIG.legendary.weight) {
    rarity = 'legendary';
  } else if (random < RARITY_CONFIG.legendary.weight + RARITY_CONFIG.rare.weight) {
    rarity = 'rare';
  } else if (random < RARITY_CONFIG.legendary.weight + RARITY_CONFIG.rare.weight + RARITY_CONFIG.uncommon.weight) {
    rarity = 'uncommon';
  } else {
    rarity = 'common';
  }
  
  const artistList = ARTISTS[rarity];
  const randomArtist = artistList[Math.floor(Math.random() * artistList.length)];
  
  return {
    ...randomArtist,
    rarity,
    id: `${rarity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

function loadCollections() {
  try {
    return JSON.parse(fs.readFileSync(COLLECTIONS_FILE, 'utf8'));
  } catch (error) {
    return {};
  }
}

function saveCollections(collections) {
  fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(collections, null, 2));
}

function loadSpawnData() {
  try {
    return JSON.parse(fs.readFileSync(SPAWN_DATA_FILE, 'utf8'));
  } catch (error) {
    return { lastSpawn: 0, activeSpawns: {} };
  }
}

function saveSpawnData(data) {
  fs.writeFileSync(SPAWN_DATA_FILE, JSON.stringify(data, null, 2));
}

function addArtistToCollection(userId, artist) {
  const collections = loadCollections();
  if (!collections[userId]) {
    collections[userId] = { artists: [], totalCaught: 0 };
  }
  
  collections[userId].artists.push({
    ...artist,
    caughtAt: new Date().toISOString()
  });
  collections[userId].totalCaught += 1;
  
  saveCollections(collections);
  return collections[userId];
}

function getUserCollection(userId) {
  const collections = loadCollections();
  return collections[userId] || { artists: [], totalCaught: 0 };
}

function isValidGuess(guess, artist) {
  const normalizedGuess = guess.toLowerCase().trim();
  return artist.aliases.some(alias => 
    alias.toLowerCase() === normalizedGuess || 
    alias.toLowerCase().includes(normalizedGuess) ||
    normalizedGuess.includes(alias.toLowerCase())
  );
}

function getSpawnInterval() {
  // Random spawn between 30 minutes to 3 hours (in milliseconds)
  const minInterval = 30 * 60 * 1000; // 30 minutes
  const maxInterval = 180 * 60 * 1000; // 3 hours
  return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
}

module.exports = {
  ARTISTS,
  RARITY_CONFIG,
  getRandomArtist,
  addArtistToCollection,
  getUserCollection,
  isValidGuess,
  getSpawnInterval,
  loadSpawnData,
  saveSpawnData
};