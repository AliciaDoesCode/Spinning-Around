const fs = require('fs');
const path = require('path');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../../data/levels.json');
function getLevels() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return {};
  }
}

function createProgressBar(current, max, length = 20) {
  const percentage = current / max;
  const progress = Math.round(length * percentage);
  const empty = length - progress;
  
  const progressChar = '█';
  const emptyChar = '░';
  
  return `${progressChar.repeat(progress)}${emptyChar.repeat(empty)}`;
}

function getMilestoneInfo(currentLevel) {
  const majorLevels = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const nextMilestone = majorLevels.find(level => level > currentLevel);
  const lastMilestone = majorLevels.filter(level => level <= currentLevel).pop();
  
  let milestoneText = '';
  
  if (lastMilestone) {
    milestoneText += `✅ Last milestone: Level ${lastMilestone}\n`;
  }
  
  if (nextMilestone) {
    const levelsToGo = nextMilestone - currentLevel;
    milestoneText += `🎯 Next milestone: Level ${nextMilestone} (${levelsToGo} levels to go)`;
  } else {
    milestoneText += '🏆 You\'ve reached the highest milestone! (Level 50+)';
  }
  
  return {
    name: '🏆 Milestones',
    value: milestoneText,
    inline: false
  };
}

module.exports = {
  name: 'level',
  description: 'Check your level and XP',
  options: [
    {
      name: 'user',
      description: 'User to check',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  callback: async (client, interaction) => {
    try {
      const user = interaction.options.getUser('user') || interaction.user;
      const guildId = interaction.guild.id;
      const levels = getLevels();

      const data = levels[guildId]?.[user.id];
      if (!data) {
        const noDataEmbed = new EmbedBuilder()
          .setTitle('📊 Level Statistics')
          .setDescription(`🔍 **${user.displayName}** hasn't started their leveling journey yet!\n\n💬 Start chatting in the server to begin earning XP and leveling up!`)
          .setColor('#ff6b6b') // Soft red
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: '📈 Current Level', value: '0', inline: true },
            { name: '⭐ Total XP', value: '0', inline: true },
            { name: '🎯 Next Level', value: '100 XP needed', inline: true }
          )
          .setFooter({ 
            text: 'Start chatting to begin your journey!', 
            iconURL: interaction.guild.iconURL() 
          })
          .setTimestamp();

        await interaction.reply({ embeds: [noDataEmbed] });
        return;
      }

      // Calculate progress to next level
      const currentXP = data.xp;
      const currentLevel = data.level;
      const nextLevelXP = currentLevel * 100;
      const xpProgress = currentXP;
      const xpNeeded = nextLevelXP - currentXP;
      const progressPercentage = Math.floor((currentXP / nextLevelXP) * 100);

      const progressBar = createProgressBar(currentXP, nextLevelXP);

      const milestoneInfo = getMilestoneInfo(currentLevel);

      const levelEmbed = new EmbedBuilder()
        .setTitle(`📊 ${user.displayName}'s Level Statistics`)
        .setColor('#4ecdc4') // Teal color
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(`🌟 **Level ${currentLevel}** • ${progressPercentage}% to next level`)
        .addFields(
          { name: '📈 Current Level', value: `**${currentLevel}**`, inline: true },
          { name: '⭐ Current XP', value: `**${currentXP}**`, inline: true },
          { name: '🎯 XP to Next Level', value: `**${xpNeeded}**`, inline: true },
          { name: '📊 Progress Bar', value: `${progressBar}\n\`${currentXP}/${nextLevelXP} XP\``, inline: false },
          milestoneInfo
        )
        .setFooter({ 
          text: `Keep chatting to level up! • Requested by ${interaction.user.displayName}`, 
          iconURL: interaction.guild.iconURL() 
        })
        .setTimestamp();

      await interaction.reply({ embeds: [levelEmbed] });
    } catch (error) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle('Error')
              .setDescription(`Error: ${error.message}`)
          ]
        });
      }
    }
  },
};