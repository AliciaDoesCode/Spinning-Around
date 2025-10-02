const fs = require('fs');
const path = require('path');

// Artist database with different rarities


const ARTISTS = {
  // Common artists (70% chance) - Well-known but not super rare
  common: [
    { name: 'Taylor Swift', aliases: ['taylor', 'swift', 'taylor swift'], image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQaF9b8TTT0Q3jtTHPqYwPVz6ZJp0aNPFc9g&s' },
    { name: 'Ed Sheeran', aliases: ['ed', 'sheeran', 'ed sheeran'], image: 'https://people.com/thmb/8kqJvzX3z7QZ2QqJFjV5E3Nz3QI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(734x0:736x2)/ed-sheeran-121323-1-80fe4bf683a644cfabe4e9a6c717b772.jpg' },
    { name: 'Ariana Grande', aliases: ['ariana', 'grande', 'ariana grande', 'ari'], image: 'https://hips.hearstapps.com/hmg-prod/images/ariana-grande-attends-the-wicked-movie-musical-in-concert-news-photo-1701287806.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'Justin Bieber', aliases: ['justin', 'bieber', 'justin bieber'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/08/Justin-Bieber-Through-Years.jpg?quality=86&strip=all&w=1024' },
    { name: 'Dua Lipa', aliases: ['dua', 'lipa', 'dua lipa'], image: 'https://hips.hearstapps.com/hmg-prod/images/dua-lipa-attends-the-barbie-the-album-celebration-event-news-photo-1689771564.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'The Weeknd', aliases: ['weeknd', 'the weeknd', 'abel'], image: 'https://www.rollingstone.com/wp-content/uploads/2023/05/the-weeknd.jpg?w=1024' },
    { name: 'Olivia Rodrigo', aliases: ['olivia', 'rodrigo', 'olivia rodrigo'], image: 'https://static.independent.co.uk/2021/05/19/13/newFile.jpg?quality=75&width=1250&crop=3%3A2%2Csmart&auto=webp'},
    { name: 'Harry Styles', aliases: ['harry', 'styles', 'harry styles'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/09/Harry-Styles-Through-Years.jpg?quality=86&strip=all&w=1024' },
    { name: 'Adele', aliases: ['adele'], image: 'https://hips.hearstapps.com/hmg-prod/images/adele-performs-onstage-during-weekends-with-adele-at-the-news-photo-1668605647.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'Bruno Mars', aliases: ['bruno', 'mars', 'bruno mars'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/01/Bruno-Mars-Through-Years.jpg?quality=86&strip=all&w=1024' }
  ],
  
  // Uncommon artists (20% chance) - Popular but less common spawns
  uncommon: [
    { name: 'Billie Eilish', aliases: ['billie', 'eilish', 'billie eilish'], image: 'https://hips.hearstapps.com/hmg-prod/images/billie-eilish-attends-the-academy-museum-of-motion-pictures-news-photo-1665252456.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'Rihanna', aliases: ['rihanna', 'riri'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/02/Rihanna-Through-Years.jpg?quality=86&strip=all&w=1024' },
    { name: 'Drake', aliases: ['drake', 'aubrey'], image: 'https://www.rollingstone.com/wp-content/uploads/2023/06/drake.jpg?w=1024' },
    { name: 'Bad Bunny', aliases: ['bad bunny', 'bunny', 'bad', 'benito'], image: 'https://hips.hearstapps.com/hmg-prod/images/bad-bunny-performs-onstage-during-the-2023-coachella-valley-news-photo-1682219536.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'SZA', aliases: ['sza', 'solana'], image: 'https://www.rollingstone.com/wp-content/uploads/2023/12/sza.jpg?w=1024' },
    { name: 'Lana Del Rey', aliases: ['lana', 'del rey', 'lana del rey', 'ldr'], image: 'https://hips.hearstapps.com/hmg-prod/images/lana-del-rey-performs-onstage-during-the-2023-coachella-news-photo-1682292736.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'Post Malone', aliases: ['post', 'malone', 'post malone', 'posty'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/09/Post-Malone-Through-Years.jpg?quality=86&strip=all&w=1024' },
    { name: 'Kendrick Lamar', aliases: ['kendrick', 'lamar', 'kendrick lamar', 'kdot'], image: 'https://www.rollingstone.com/wp-content/uploads/2023/08/kendrick-lamar.jpg?w=1024' }
  ],
  
  // Rare artists (8% chance) - More challenging and less frequent
  rare: [
    { name: 'Radiohead', aliases: ['radiohead', 'thom yorke', 'thom'], image: 'https://www.rollingstone.com/wp-content/uploads/2023/05/radiohead.jpg?w=1024' },
    { name: 'Frank Ocean', aliases: ['frank', 'ocean', 'frank ocean', 'christopher'], image: 'https://hips.hearstapps.com/hmg-prod/images/frank-ocean-performs-onstage-during-day-3-of-fyf-fest-2017-news-photo-1598634837.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'Kanye West', aliases: ['kanye', 'west', 'ye', 'yeezy'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/10/Kanye-West-Through-Years.jpg?quality=86&strip=all&w=1024' },
    { name: 'Doja Cat', aliases: ['doja', 'cat', 'doja cat', 'amala'], image: 'https://hips.hearstapps.com/hmg-prod/images/doja-cat-attends-the-2023-met-gala-celebrating-karl-news-photo-1683592322.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'Tyler, The Creator', aliases: ['tyler', 'creator', 'tyler the creator', 'odd future'], image: 'https://www.rollingstone.com/wp-content/uploads/2023/07/tyler-creator.jpg?w=1024' },
    { name: 'Lizzo', aliases: ['lizzo', 'melissa'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/08/Lizzo-Through-Years.jpg?quality=86&strip=all&w=1024' }
  ],
  
  // Legendary artists (2% chance) - Super rare and iconic
  legendary: [
    { name: 'Beyoncé', aliases: ['beyonce', 'bey', 'queen b', 'destiny\'s child'], image: 'https://hips.hearstapps.com/hmg-prod/images/beyonce-performs-onstage-during-the-2023-renaissance-world-news-photo-1693507048.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'Michael Jackson', aliases: ['michael', 'jackson', 'mj', 'king of pop'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/08/Michael-Jackson-Through-Years.jpg?quality=86&strip=all&w=1024' },
    { name: 'Prince', aliases: ['prince', 'the artist', 'purple one'], image: 'https://hips.hearstapps.com/hmg-prod/images/prince-performs-onstage-during-his-piano-microphone-tour-news-photo-1598634281.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=1200:*' },
    { name: 'Madonna', aliases: ['madonna', 'queen of pop', 'material girl'], image: 'https://www.usmagazine.com/wp-content/uploads/2023/07/Madonna-Through-Years.jpg?quality=86&strip=all&w=1024' }
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