const fs = require('fs');
const path = require('path');

// Artist database with different rarities
const ARTISTS = {
  // Common artists (70% chance) - Well-known but not super rare
  common: [
    { name: 'Taylor Swift', aliases: ['taylor', 'swift', 'taylor swift'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png' },
    { name: 'Ed Sheeran', aliases: ['ed', 'sheeran', 'ed sheeran'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/c6f59c1e5e7240a4c0d427abd71f3dbb.jpg' },
    { name: 'Ariana Grande', aliases: ['ariana', 'grande', 'ariana grande', 'ari'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/3b54885952161aaea4ce2965b2db1638.png' },
    { name: 'Justin Bieber', aliases: ['justin', 'bieber', 'justin bieber'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/c14b155c686e442fc5550566db3de35c.jpg' },
    { name: 'Dua Lipa', aliases: ['dua', 'lipa', 'dua lipa'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/0449d990625e4c1095afe15d7b0b7d05.png' },
    { name: 'The Weeknd', aliases: ['weeknd', 'the weeknd', 'abel'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/3143699b08cedf375ab8e1fcb8310d4d.png' },
    { name: 'Olivia Rodrigo', aliases: ['olivia', 'rodrigo', 'olivia rodrigo'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/037015a64671237647d4cfb5a8c7a12f.jpg' },
    { name: 'Harry Styles', aliases: ['harry', 'styles', 'harry styles'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/dee1bdc096ae4726a2905a362e7a2703.jpg' },
    { name: 'Adele', aliases: ['adele'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/b25b959554ed76058ac220b7b2e0a026.png' },
    { name: 'Bruno Mars', aliases: ['bruno', 'mars', 'bruno mars'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/a97ca66087fb4ed78179a28df1b5177a.jpg' }
  ],
  
  // Uncommon artists (20% chance) - Popular but less common spawns
  uncommon: [
    { name: 'Billie Eilish', aliases: ['billie', 'eilish', 'billie eilish'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/bf540e9776194c378158b2b93a014c2d.png' },
    { name: 'Rihanna', aliases: ['rihanna', 'riri'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/4b8945c7b3bb9ac5911e6e31bab8481c.jpg' },
    { name: 'Drake', aliases: ['drake', 'aubrey'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/c5f59c1e5e7238a4c0d427abd71f3dbb.png' },
    { name: 'Bad Bunny', aliases: ['bad bunny', 'bunny', 'bad', 'benito'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/2fc96399b67c4c37845b393dc7cf2c8f.jpg' },
    { name: 'SZA', aliases: ['sza', 'solana'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/e5c4a7be4fe94ab2b7a2e273cbe098a9.png' },
    { name: 'Lana Del Rey', aliases: ['lana', 'del rey', 'lana del rey', 'ldr'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/8b6709b236b54d319ac4297673fa4c70.png' },
    { name: 'Post Malone', aliases: ['post', 'malone', 'post malone', 'posty'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/af2d9abc448c4d6adc46ee2713897c1e.jpg' },
    { name: 'Kendrick Lamar', aliases: ['kendrick', 'lamar', 'kendrick lamar', 'kdot'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/c9f71ce7c9e5c67aa9c3c079b7b9e9a3.jpg' }
  ],
  
  // Rare artists (8% chance) - Legendary or iconic artists
  rare: [
    { name: 'Beyoncé', aliases: ['beyonce', 'beyoncé', 'bey', 'queen b'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png' },
    { name: 'Michael Jackson', aliases: ['michael', 'jackson', 'michael jackson', 'mj', 'king of pop'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/c14b155c686e442fc5550566db3de35c.png' },
    { name: 'Prince', aliases: ['prince'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/bf54085976194c378158b2b93a014c2d.jpg' },
    { name: 'Madonna', aliases: ['madonna'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/4b8945c7b3bb9ac5911e6e31bab8481c.png' },
    { name: 'Whitney Houston', aliases: ['whitney', 'houston', 'whitney houston'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/8b670932b54d319ac4297673fa4c70.jpg' },
    { name: 'Freddie Mercury', aliases: ['freddie', 'mercury', 'freddie mercury'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/dee1bdc096ae4726a2905a362e7a2703.png' }
  ],
  
  // Legendary artists (2% chance) - Ultra rare spawns
  legendary: [
    { name: 'Elvis Presley', aliases: ['elvis', 'presley', 'elvis presley', 'king'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/a97ca66087fb4ed78179a28df1b5177a.png' },
    { name: 'The Beatles', aliases: ['beatles', 'the beatles', 'fab four'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/b25b959554ed76058ac220b7b2e0a026.jpg' },
    { name: 'Bob Dylan', aliases: ['bob', 'dylan', 'bob dylan'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/c9f71ce7c9e5c67aa9c3c079b7b9e9a3.png' },
    { name: 'Johnny Cash', aliases: ['johnny', 'cash', 'johnny cash', 'man in black'], image: 'https://lastfm.freetls.fastly.net/i/u/300x300/af2d9abc448c4d6adc46ee2713897c1e.png' }
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