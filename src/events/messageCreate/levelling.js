const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../../data/levels.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');


const LEVEL_ROLES = {
  5: '1422510225029730334', // Level 5 role ID
  10: '1422510652865515642', // Level 10 role ID
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

function getLevelProgressField(currentLevel) {
  let milestones = '';
  const majorLevels = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  
  for (const level of majorLevels) {
    if (level <= currentLevel) {
      milestones += `✅ Level ${level} `;
    } else if (level === majorLevels.find(l => l > currentLevel)) {
      milestones += `📍 Level ${level} (Next milestone) `;
      break;
    }
  }
  
  return {
    name: '🏆 Level Milestones',
    value: milestones || '🎯 Working towards Level 5!',
    inline: false
  };
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
      // Create beautiful level up embed
      const embed = new EmbedBuilder()
        .setTitle('🎉 Level Up!')
        .setColor('#00ff7f') // Bright green for celebration
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ 
          text: `Keep chatting to level up more!`, 
          iconURL: message.guild.iconURL() 
        });

      let description = `**${message.author.displayName}** has leveled up!\n\n`;
      description += `📈 **New Level:** ${newLevel}\n`;
      description += `💫 **XP Reset:** Starting fresh at 0 XP\n`;
      description += `🎯 **Next Goal:** ${(newLevel + 1) * 100} XP for level ${newLevel + 1}`;

      if (roleReward) {
        description += `\n\n🎊 **Bonus Reward:** You've earned the **${roleReward}** role!`;
        embed.setColor('#ffd700'); 
      }

      embed.setDescription(description);

      const progressField = getLevelProgressField(newLevel);
      embed.addFields(progressField);

      levelChannel.send({ embeds: [embed] });
    }
  } else {
    saveLevels(levels);
  }
};