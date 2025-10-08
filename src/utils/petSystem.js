const fs = require('fs');
const path = require('path');

// Data file paths
const PETS_DB_PATH = path.join(__dirname, '../../data/pets.json');
const USERS_DB_PATH = path.join(__dirname, '../../data/petUsers.json');
const EVENTS_DB_PATH = path.join(__dirname, '../../data/petEvents.json');

// Initialize data files if they don't exist
if (!fs.existsSync(PETS_DB_PATH)) fs.writeFileSync(PETS_DB_PATH, '{}');
if (!fs.existsSync(USERS_DB_PATH)) fs.writeFileSync(USERS_DB_PATH, '{}');
if (!fs.existsSync(EVENTS_DB_PATH)) fs.writeFileSync(EVENTS_DB_PATH, '{}');

// Pet species with their base stats and evolution chains
const PET_SPECIES = {
  dragon: {
    name: 'Dragon',
    emoji: '🐲',
    description: 'A powerful and majestic creature with ancient wisdom',
    baseStats: { hp: 120, attack: 90, defense: 80, speed: 70, intelligence: 85 },
    growthRate: 'medium',
    evolutions: [
      { level: 1, name: 'Baby Dragon', emoji: '🐲' },
      { level: 15, name: 'Young Dragon', emoji: '🐲' },
      { level: 30, name: 'Elder Dragon', emoji: '🐲' },
      { level: 50, name: 'Ancient Dragon', emoji: '🐲' }
    ],
    personality: ['fierce', 'proud', 'noble', 'protective']
  },
  phoenix: {
    name: 'Phoenix',
    emoji: '🔥',
    description: 'A mystical firebird known for its rebirth and healing abilities',
    baseStats: { hp: 100, attack: 95, defense: 70, speed: 90, intelligence: 90 },
    growthRate: 'fast',
    evolutions: [
      { level: 1, name: 'Phoenix Chick', emoji: '🔥' },
      { level: 12, name: 'Fire Bird', emoji: '🔥' },
      { level: 28, name: 'Phoenix', emoji: '🔥' },
      { level: 45, name: 'Solar Phoenix', emoji: '🔥' }
    ],
    personality: ['passionate', 'resilient', 'wise', 'mystical']
  },
  unicorn: {
    name: 'Unicorn',
    emoji: '🦄',
    description: 'A graceful and pure creature blessed with magical powers',
    baseStats: { hp: 110, attack: 75, defense: 85, speed: 85, intelligence: 100 },
    growthRate: 'slow',
    evolutions: [
      { level: 1, name: 'Foal', emoji: '🦄' },
      { level: 18, name: 'Young Unicorn', emoji: '🦄' },
      { level: 35, name: 'Majestic Unicorn', emoji: '🦄' },
      { level: 55, name: 'Alicorn', emoji: '🦄' }
    ],
    personality: ['gentle', 'pure', 'magical', 'graceful']
  },
  wolf: {
    name: 'Wolf',
    emoji: '🐺',
    description: 'A loyal and intelligent pack hunter with strong instincts',
    baseStats: { hp: 95, attack: 85, defense: 75, speed: 95, intelligence: 80 },
    growthRate: 'medium',
    evolutions: [
      { level: 1, name: 'Wolf Pup', emoji: '🐺' },
      { level: 14, name: 'Young Wolf', emoji: '🐺' },
      { level: 25, name: 'Alpha Wolf', emoji: '🐺' },
      { level: 40, name: 'Shadow Wolf', emoji: '🐺' }
    ],
    personality: ['loyal', 'brave', 'pack-minded', 'fierce']
  },
  cat: {
    name: 'Mystic Cat',
    emoji: '🐱',
    description: 'An agile and mysterious feline with magical potential',
    baseStats: { hp: 85, attack: 80, defense: 70, speed: 100, intelligence: 95 },
    growthRate: 'fast',
    evolutions: [
      { level: 1, name: 'Kitten', emoji: '🐱' },
      { level: 10, name: 'Magic Cat', emoji: '🐱' },
      { level: 22, name: 'Mystic Cat', emoji: '🐱' },
      { level: 38, name: 'Celestial Cat', emoji: '🐱' }
    ],
    personality: ['curious', 'independent', 'mysterious', 'agile']
  }
};

// Pet care items and their effects
const PET_ITEMS = {
  // Food items
  basicFood: { name: 'Basic Food', cost: 10, effect: { hunger: +20, happiness: +5 }, category: 'food', emoji: '🍖' },
  premiumFood: { name: 'Premium Food', cost: 25, effect: { hunger: +40, happiness: +15, hp: +5 }, category: 'food', emoji: '🥩' },
  treat: { name: 'Special Treat', cost: 15, effect: { happiness: +25, energy: +10 }, category: 'food', emoji: '🍯' },
  
  // Training items
  toyBall: { name: 'Toy Ball', cost: 20, effect: { happiness: +10, speed: +2 }, category: 'toy', emoji: '⚽' },
  dumbbell: { name: 'Training Weights', cost: 30, effect: { attack: +3, energy: -10 }, category: 'training', emoji: '🏋️' },
  shield: { name: 'Training Shield', cost: 35, effect: { defense: +3, energy: -10 }, category: 'training', emoji: '🛡️' },
  
  // Medicine
  potion: { name: 'Health Potion', cost: 40, effect: { hp: +30, energy: +20 }, category: 'medicine', emoji: '🧪' },
  energyDrink: { name: 'Energy Drink', cost: 25, effect: { energy: +40, happiness: +5 }, category: 'medicine', emoji: '⚡' }
};

class Pet {
  constructor(species, ownerID, name = null) {
    this.id = this.generateId();
    this.ownerID = ownerID;
    this.species = species;
    this.name = name || this.generateRandomName(species);
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
    
    // Base stats with some randomization
    const baseStats = PET_SPECIES[species].baseStats;
    this.stats = {
      hp: this.randomizeStat(baseStats.hp),
      maxHp: this.randomizeStat(baseStats.hp),
      attack: this.randomizeStat(baseStats.attack),
      defense: this.randomizeStat(baseStats.defense),
      speed: this.randomizeStat(baseStats.speed),
      intelligence: this.randomizeStat(baseStats.intelligence)
    };
    
    // Care stats
    this.happiness = 75;
    this.hunger = 50;
    this.energy = 80;
    this.lastFed = Date.now();
    this.lastPlayed = Date.now();
    this.lastTrained = Date.now();
    
    // Battle stats
    this.wins = 0;
    this.losses = 0;
    this.battleRating = 1000;
    
    // Personality
    this.personality = this.getRandomPersonality(species);
    
    // Evolution and growth
    this.evolutionStage = 0;
    this.totalCareTime = 0;
    
    this.createdAt = Date.now();
  }
  
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
  
  randomizeStat(baseStat) {
    // ±15% variance
    const variance = baseStat * 0.15;
    return Math.floor(baseStat + (Math.random() - 0.5) * 2 * variance);
  }
  
  generateRandomName(species) {
    const names = {
      dragon: ['Ember', 'Blaze', 'Smaug', 'Draco', 'Flame', 'Crimson', 'Azure', 'Onyx'],
      phoenix: ['Ignis', 'Sol', 'Pyra', 'Helios', 'Aurora', 'Flare', 'Ash', 'Cinder'],
      unicorn: ['Star', 'Luna', 'Celeste', 'Moonbeam', 'Shimmer', 'Pearl', 'Crystal', 'Iris'],
      wolf: ['Shadow', 'Storm', 'Hunter', 'Frost', 'Thunder', 'Midnight', 'Scout', 'Spirit'],
      cat: ['Whiskers', 'Shadow', 'Luna', 'Mystic', 'Sage', 'Jinx', 'Cosmic', 'Zen']
    };
    
    const speciesNames = names[species] || names.cat;
    return speciesNames[Math.floor(Math.random() * speciesNames.length)];
  }
  
  getRandomPersonality(species) {
    const personalities = PET_SPECIES[species].personality;
    return personalities[Math.floor(Math.random() * personalities.length)];
  }
  
  getCurrentEvolution() {
    const evolutions = PET_SPECIES[this.species].evolutions;
    let currentEvo = evolutions[0];
    
    for (let evo of evolutions) {
      if (this.level >= evo.level) {
        currentEvo = evo;
      } else {
        break;
      }
    }
    
    return currentEvo;
  }
  
  getNextEvolution() {
    const evolutions = PET_SPECIES[this.species].evolutions;
    const current = this.getCurrentEvolution();
    const currentIndex = evolutions.findIndex(evo => evo.level === current.level);
    
    return evolutions[currentIndex + 1] || null;
  }
  
  // Care functions
  feed(foodType = 'basicFood') {
    const now = Date.now();
    const hoursSinceLastFed = (now - this.lastFed) / (1000 * 60 * 60);
    
    if (hoursSinceLastFed < 1) {
      return { success: false, message: 'Your pet is still full! Try again later.' };
    }
    
    const food = PET_ITEMS[foodType];
    if (!food) return { success: false, message: 'Invalid food type!' };
    
    // Apply effects
    this.hunger = Math.min(100, this.hunger + food.effect.hunger);
    if (food.effect.happiness) this.happiness = Math.min(100, this.happiness + food.effect.happiness);
    if (food.effect.hp) this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + food.effect.hp);
    
    this.lastFed = now;
    this.addXP(5);
    
    return { 
      success: true, 
      message: `${this.name} enjoyed the ${food.name}! ${food.emoji}`,
      effects: food.effect 
    };
  }
  
  play() {
    const now = Date.now();
    const hoursSinceLastPlayed = (now - this.lastPlayed) / (1000 * 60 * 60);
    
    if (hoursSinceLastPlayed < 2) {
      return { success: false, message: 'Your pet is still tired from playing! Try again later.' };
    }
    
    if (this.energy < 20) {
      return { success: false, message: 'Your pet is too tired to play! Feed them first.' };
    }
    
    this.happiness = Math.min(100, this.happiness + 15);
    this.energy = Math.max(0, this.energy - 15);
    this.lastPlayed = now;
    this.addXP(8);
    
    const activities = ['fetch', 'hide and seek', 'chase', 'tricks', 'explore'];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    return { 
      success: true, 
      message: `${this.name} had fun playing ${activity}! 🎾`,
      activity: activity 
    };
  }
  
  train(statType) {
    const now = Date.now();
    const hoursSinceLastTrained = (now - this.lastTrained) / (1000 * 60 * 60);
    
    if (hoursSinceLastTrained < 3) {
      return { success: false, message: 'Your pet needs rest before training again!' };
    }
    
    if (this.energy < 30) {
      return { success: false, message: 'Your pet is too tired to train! Let them rest first.' };
    }
    
    const validStats = ['attack', 'defense', 'speed', 'intelligence'];
    if (!validStats.includes(statType)) {
      return { success: false, message: 'Invalid training type! Choose: attack, defense, speed, or intelligence' };
    }
    
    const increase = Math.floor(Math.random() * 3) + 1; // 1-3 points
    this.stats[statType] += increase;
    this.energy = Math.max(0, this.energy - 25);
    this.happiness = Math.max(0, this.happiness - 5); // Training is work!
    this.lastTrained = now;
    this.addXP(12);
    
    return { 
      success: true, 
      message: `${this.name} trained hard and gained +${increase} ${statType}! 💪`,
      statGain: { [statType]: increase }
    };
  }
  
  addXP(amount) {
    this.xp += amount;
    let leveled = false;
    
    while (this.xp >= this.xpToNext) {
      this.levelUp();
      leveled = true;
    }
    
    return leveled;
  }
  
  levelUp() {
    this.xp -= this.xpToNext;
    this.level++;
    this.xpToNext = Math.floor(this.xpToNext * 1.2); // Exponential growth
    
    // Stat increases on level up
    const statIncrease = Math.floor(this.level / 5) + 1;
    this.stats.maxHp += statIncrease;
    this.stats.hp = this.stats.maxHp; // Full heal on level up
    this.stats.attack += Math.floor(statIncrease * 0.8);
    this.stats.defense += Math.floor(statIncrease * 0.8);
    this.stats.speed += Math.floor(statIncrease * 0.8);
    this.stats.intelligence += Math.floor(statIncrease * 0.8);
    
    return true;
  }
  
  // Pet condition updates (called periodically)
  updateCondition() {
    const now = Date.now();
    const hoursElapsed = (now - this.lastFed) / (1000 * 60 * 60);
    
    // Decrease stats over time if not cared for
    if (hoursElapsed > 6) {
      this.hunger = Math.max(0, this.hunger - Math.floor(hoursElapsed / 2));
      this.happiness = Math.max(0, this.happiness - Math.floor(hoursElapsed / 3));
      this.energy = Math.max(0, this.energy - Math.floor(hoursElapsed / 4));
    }
    
    // Regenerate energy slowly
    this.energy = Math.min(100, this.energy + 1);
    
    return this.getConditionStatus();
  }
  
  getConditionStatus() {
    if (this.hunger < 20) return { status: 'hungry', emoji: '😋', message: 'is getting hungry!' };
    if (this.happiness < 30) return { status: 'sad', emoji: '😢', message: 'seems sad and needs attention!' };
    if (this.energy < 20) return { status: 'tired', emoji: '😴', message: 'is feeling tired!' };
    if (this.happiness > 80) return { status: 'happy', emoji: '😊', message: 'is very happy!' };
    
    return { status: 'content', emoji: '😌', message: 'is doing well!' };
  }
}

// Database functions
function getPetData() {
  try {
    return JSON.parse(fs.readFileSync(PETS_DB_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function savePetData(data) {
  fs.writeFileSync(PETS_DB_PATH, JSON.stringify(data, null, 2));
}

function getUserData() {
  try {
    return JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveUserData(data) {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
}

function getUserPet(userID) {
  const userData = getUserData();
  if (!userData[userID] || !userData[userID].activePet) return null;
  
  const petData = getPetData();
  return petData[userData[userID].activePet] || null;
}

function savePet(pet) {
  const petData = getPetData();
  petData[pet.id] = pet;
  savePetData(petData);
}

function adoptPet(userID, species, name) {
  const userData = getUserData();
  
  // Check if user already has a pet
  if (userData[userID] && userData[userID].activePet) {
    return { success: false, message: 'You already have an active pet! Only one pet per user for now.' };
  }
  
  // Create new pet
  const pet = new Pet(species, userID, name);
  savePet(pet);
  
  // Update user data
  if (!userData[userID]) {
    userData[userID] = {
      coins: 100, // Starting coins
      adoptionDate: Date.now(),
      totalPets: 0,
      achievements: []
    };
  }
  
  userData[userID].activePet = pet.id;
  userData[userID].totalPets++;
  saveUserData(userData);
  
  return { success: true, pet: pet };
}

module.exports = {
  Pet,
  PET_SPECIES,
  PET_ITEMS,
  getPetData,
  savePetData,
  getUserData,
  saveUserData,
  getUserPet,
  savePet,
  adoptPet
};