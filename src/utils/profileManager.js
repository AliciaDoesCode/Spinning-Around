const fs = require('fs');
const path = require('path');

const PROFILES_DIR = path.join(__dirname, '../../data');
const PROFILES_FILE = path.join(PROFILES_DIR, 'profiles.json');

if (!fs.existsSync(PROFILES_DIR)) {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
}

if (!fs.existsSync(PROFILES_FILE)) {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify({}, null, 2));
}

class ProfileManager {
  constructor() {
    this.profiles = this.loadProfiles();
  }

  loadProfiles() {
    try {
      const data = fs.readFileSync(PROFILES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      return {};
    }
  }

  saveProfiles() {
    try {
      fs.writeFileSync(PROFILES_FILE, JSON.stringify(this.profiles, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving profiles:', error);
      return false;
    }
  }

  getProfile(userId) {
    const profile = this.profiles[userId];
    if (!profile) return null;
    
    profile.favoriteArtists = profile.favoriteArtists || [];
    profile.favoriteSongs = profile.favoriteSongs || [];
    profile.favoriteVinyls = profile.favoriteVinyls || [];
    profile.favoriteGenres = profile.favoriteGenres || [];
    profile.bio = profile.bio || '';
    
    return profile;
  }

  createProfile(userId) {
    if (this.profiles[userId]) {
      return { success: false, message: 'Profile already exists' };
    }

    const newProfile = {
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bio: '',
      favoriteArtists: [],
      favoriteSongs: [],
      favoriteVinyls: [],
      favoriteGenres: []
    };

    this.profiles[userId] = newProfile;
    this.saveProfiles();
    
    return { success: true, profile: newProfile };
  }

  deleteProfile(userId) {
    if (!this.profiles[userId]) {
      return { success: false, message: 'Profile not found' };
    }

    delete this.profiles[userId];
    this.saveProfiles();
    
    return { success: true };
  }

  addFavorite(userId, type, name) {
    const profile = this.profiles[userId];
    if (!profile) {
      return { success: false, message: 'Profile not found' };
    }

    const typeMap = {
      'artist': 'favoriteArtists',
      'song': 'favoriteSongs',
      'vinyl': 'favoriteVinyls',
      'genre': 'favoriteGenres'
    };

    const fieldName = typeMap[type];
    if (!fieldName) {
      return { success: false, message: 'Invalid type' };
    }

    const existingIndex = profile[fieldName].findIndex(
      item => item.toLowerCase() === name.toLowerCase()
    );

    if (existingIndex !== -1) {
      return { success: false, message: `"${name}" is already in your favorite ${type}s` };
    }

    if (profile[fieldName].length >= 20) {
      return { success: false, message: `You can only have up to 10 favorite ${type}s. Remove some first.` };
    }

    profile[fieldName].push(name);
    profile.updatedAt = new Date().toISOString();
    this.saveProfiles();

    return { success: true };
  }

  removeFavorite(userId, type, name) {
    const profile = this.profiles[userId];
    if (!profile) {
      return { success: false, message: 'Profile not found' };
    }

    const typeMap = {
      'artist': 'favoriteArtists',
      'song': 'favoriteSongs',
      'vinyl': 'favoriteVinyls',
      'genre': 'favoriteGenres'
    };

    const fieldName = typeMap[type];
    if (!fieldName) {
      return { success: false, message: 'Invalid type' };
    }

    const existingIndex = profile[fieldName].findIndex(
      item => item.toLowerCase() === name.toLowerCase()
    );

    if (existingIndex === -1) {
      return { success: false, message: `"${name}" is not in your favorite ${type}s` };
    }

    profile[fieldName].splice(existingIndex, 1);
    profile.updatedAt = new Date().toISOString();
    this.saveProfiles();

    return { success: true };
  }

  setBio(userId, bio) {
    const profile = this.profiles[userId];
    if (!profile) {
      return { success: false, message: 'Profile not found' };
    }

    profile.bio = bio;
    profile.updatedAt = new Date().toISOString();
    this.saveProfiles();

    return { success: true };
  }

  getAllProfiles() {
    return this.profiles;
  }

  getProfileStats() {
    const totalProfiles = Object.keys(this.profiles).length;
    let totalArtists = 0;
    let totalSongs = 0;
    let totalVinyls = 0;
    let totalGenres = 0;

    Object.values(this.profiles).forEach(profile => {
      totalArtists += profile.favoriteArtists.length;
      totalSongs += profile.favoriteSongs.length;
      totalVinyls += profile.favoriteVinyls.length;
      totalGenres += profile.favoriteGenres.length;
    });

    return {
      totalProfiles,
      totalArtists,
      totalSongs,
      totalVinyls,
      totalGenres
    };
  }
}

module.exports = new ProfileManager();