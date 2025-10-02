const fs = require('fs');
const path = require('path');

// Artist database with different rarities
const ARTISTS = {
  // Common artists (70% chance) - Well-known but not super rare
  common: [
    { name: 'Taylor Swift', aliases: ['taylor', 'swift', 'taylor swift'], image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%284%29.png' },
    { name: 'Ed Sheeran', aliases: ['ed', 'sheeran', 'ed sheeran'], image: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Ed_Sheeran-6886_%28cropped%29.jpg' },
    { name: 'Ariana Grande', aliases: ['ariana', 'grande', 'ariana grande', 'ari'], image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Ariana_Grande_Grammys_Red_Carpet_2020.png' },
    { name: 'Justin Bieber', aliases: ['justin', 'bieber', 'justin bieber'], image: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Justin_Bieber_in_2015.jpg' },
    { name: 'Dua Lipa', aliases: ['dua', 'lipa', 'dua lipa'], image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dua_Lipa_performing_at_Glastonbury_2022_%28cropped%29.jpg' },
    { name: 'The Weeknd', aliases: ['weeknd', 'the weeknd', 'abel'], image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/The_Weeknd_Portrait_%28cropped%29.jpg' },
    { name: 'Olivia Rodrigo', aliases: ['olivia', 'rodrigo', 'olivia rodrigo'], image: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Olivia_Rodrigo_GUTS_World_Tour.png' },
    { name: 'Harry Styles', aliases: ['harry', 'styles', 'harry styles'], image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Harry_Styles_December_2019.jpg' },
    { name: 'Adele', aliases: ['adele'], image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Adele_2016.jpg' },
    { name: 'Bruno Mars', aliases: ['bruno', 'mars', 'bruno mars'], image: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Bruno_Mars_24K_Magic_World_Tour_%28cropped%29.jpg' }
  ],
  
  // Uncommon artists (20% chance) - Popular but less common spawns
  uncommon: [
    { name: 'Billie Eilish', aliases: ['billie', 'eilish', 'billie eilish'], image: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Billie_Eilish_2019_by_Glenn_Francis.jpg' },
    { name: 'Rihanna', aliases: ['rihanna', 'riri'], image: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Rihanna_Fenty_Beauty_launch.jpg' },
    { name: 'Drake', aliases: ['drake', 'aubrey'], image: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Drake_July_2016.jpg' },
    { name: 'Bad Bunny', aliases: ['bad bunny', 'bunny', 'bad', 'benito'], image: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Bad_Bunny_2019.jpg' },
    { name: 'SZA', aliases: ['sza', 'solana'], image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/SZA_at_the_2018_Grammy_Awards.jpg' },
    { name: 'Lana Del Rey', aliases: ['lana', 'del rey', 'lana del rey', 'ldr'], image: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Lana_Del_Rey_Ждем_в_Москве.png' },
    { name: 'Post Malone', aliases: ['post', 'malone', 'post malone', 'posty'], image: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Post_Malone_August_2018.jpg' },
    { name: 'Kendrick Lamar', aliases: ['kendrick', 'lamar', 'kendrick lamar', 'kdot'], image: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Kendrick_Lamar_July_2016.jpg' }
  ],
  
  // Rare artists (8% chance) - Legendary or iconic artists
  rare: [
    { name: 'Beyoncé', aliases: ['beyonce', 'beyoncé', 'bey', 'queen b'], image: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Beyonce_-_Formation_World_Tour_%28cropped%29.jpg' },
    { name: 'Michael Jackson', aliases: ['michael', 'jackson', 'michael jackson', 'mj', 'king of pop'], image: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Michael_Jackson_in_1988.jpg' },
    { name: 'Prince', aliases: ['prince'], image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Prince_at_Coachella_crop.jpg' },
    { name: 'Madonna', aliases: ['madonna'], image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Madonna_Rebel_Heart_Tour_2015_-_Stockholm_%28cropped%29.jpg' },
    { name: 'Whitney Houston', aliases: ['whitney', 'houston', 'whitney houston'], image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/WhitneyHoustonVevoPublicity2012.jpg' },
    { name: 'Freddie Mercury', aliases: ['freddie', 'mercury', 'freddie mercury'], image: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Freddie_Mercury_performing_in_New_Haven%2C_CT%2C_November_1977.jpg' }
  ],
  
  // Legendary artists (2% chance) - Ultra rare spawns
  legendary: [
    { name: 'Elvis Presley', aliases: ['elvis', 'presley', 'elvis presley', 'king'], image: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Elvis_Presley_promoting_Jailhouse_Rock.jpg' },
    { name: 'The Beatles', aliases: ['beatles', 'the beatles', 'fab four'], image: 'https://upload.wikimedia.org/wikipedia/commons/d/df/The_Fabs.JPG' },
    { name: 'Bob Dylan', aliases: ['bob', 'dylan', 'bob dylan'], image: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Bob_Dylan_-_Azkena_Rock_Festival_2010_2.jpg' },
    { name: 'Johnny Cash', aliases: ['johnny', 'cash', 'johnny cash', 'man in black'], image: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/JohnnyCash1969.jpg' }
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