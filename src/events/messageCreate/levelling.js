const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/levels.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');


const LEVEL_ROLES = {
  5: '', // Level 5 role ID
  10: '', // Level 10 role ID
  15: '', // Level 15 role ID
  20: '', // Level 20 role ID
  25: '', // Level 25 role ID
  30: '', // Level 30 role ID
  35: '', // Level 35 role ID
  40: '', // Level 40 role ID
  45: '', // Level 45 role ID
  50: '', // Level 50 role ID

};

function getLevels() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveLevels(levels) {
  fs.writeFileSync(dbPath, JSON.stringify(levels, null, 2));
}

module.exports = async (message) => {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;
  const guildId = message.guild.id;
  const levels = getLevels();

  if (!levels[guildId]) levels[guildId] = {};
  if (!levels[guildId][userId]) {
    levels[guildId][userId] = { xp: 0, level: 1 };
  }

  const xpGain = Math.floor(Math.random() * 10) + 5; 
  levels[guildId][userId].xp += xpGain;

  const nextLevelXp = levels[guildId][userId].level * 100;
  if (levels[guildId][userId].xp >= nextLevelXp) {
    levels[guildId][userId].level += 1;
    levels[guildId][userId].xp = 0;
    const newLevel = levels[guildId][userId].level;
    saveLevels(levels);

    // Check if user should get a role reward
    let roleReward = null;
    if (LEVEL_ROLES[newLevel] && LEVEL_ROLES[newLevel] !== '') {
      try {
        const role = message.guild.roles.cache.get(LEVEL_ROLES[newLevel]);
        if (role) {
          await message.member.roles.add(role);
          roleReward = role.name;
          console.log(`Added role ${role.name} to ${message.author.tag} for reaching level ${newLevel}`);
        }
      } catch (error) {
        console.error(`Failed to add role for level ${newLevel}:`, error);
      }
    }

    const levelChannel = message.guild.channels.cache.get('1422288897374814363');
    if (levelChannel) {
      let levelMessage = `🎉 ${message.author} has reached level ${newLevel}!`;
      if (roleReward) {
        levelMessage += ` You've earned the **${roleReward}** role!`;
      }
      levelChannel.send(levelMessage);
    }
  } else {
    saveLevels(levels);
  }
};