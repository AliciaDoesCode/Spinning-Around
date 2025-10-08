const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

const dbPath = path.join(__dirname, '../../../data/levels.json');

function getLevels() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return {};
  }
}

module.exports = {
  name: 'leaderboard',
  description: 'View the server level leaderboard',
  options: [
    {
      name: 'page',
      description: 'Page number to view (default: 1)',
      type: ApplicationCommandOptionType.Integer,
      required: false,
      min_value: 1
    }
  ],
  testOnly: false,

  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      const page = interaction.options.getInteger('page') || 1;
      const guildId = interaction.guild.id;
      const levels = getLevels();

      const guildData = levels[guildId];
      if (!guildData || Object.keys(guildData).length === 0) {
        const noDataEmbed = new EmbedBuilder()
          .setTitle('📊 Server Leaderboard')
          .setDescription('🔍 **No level data found!**\n\n💬 Start chatting in the server to begin the leveling competition!')
          .setColor('#ff6b6b')
          .setThumbnail(interaction.guild.iconURL())
          .setFooter({ text: 'Be the first to appear on the leaderboard!' })
          .setTimestamp();

        return interaction.editReply({ embeds: [noDataEmbed] });
      }

      const userEntries = Object.entries(guildData).map(([userId, data]) => ({
        userId,
        level: data.level,
        xp: data.xp,
        totalXP: calculateTotalXP(data.level, data.xp)
      }));

      userEntries.sort((a, b) => {
        if (a.level !== b.level) {
          return b.level - a.level; 
        }
        return b.xp - a.xp; 
      });

      
      const itemsPerPage = 10;
      const totalPages = Math.ceil(userEntries.length / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageEntries = userEntries.slice(startIndex, endIndex);

      if (pageEntries.length === 0) {
        const invalidPageEmbed = new EmbedBuilder()
          .setTitle('📊 Server Leaderboard')
          .setDescription(`❌ **Page ${page} not found!**\n\nThere are only ${totalPages} pages available.`)
          .setColor('#ff6b6b')
          .setFooter({ text: `Use /leaderboard page:1 to see the first page` });

        return interaction.editReply({ embeds: [invalidPageEmbed] });
      }


      const embed = new EmbedBuilder()
        .setTitle(`🏆 Server Level Leaderboard`)
        .setColor('#ffd700')
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ 
          text: `Page ${page} of ${totalPages} • Total members: ${userEntries.length}`, 
          iconURL: interaction.guild.iconURL() 
        })
        .setTimestamp();

      let leaderboardText = '';
      let currentUserRank = null;

      for (let i = 0; i < pageEntries.length; i++) {
        const entry = pageEntries[i];
        const globalRank = startIndex + i + 1;
        const user = await client.users.fetch(entry.userId).catch(() => null);
        
        if (!user) continue; 

        if (entry.userId === interaction.user.id) {
          currentUserRank = globalRank;
        }

        const rankDisplay = getRankDisplay(globalRank);
        const userName = user.displayName || user.username;
        
        const nextLevelXP = entry.level * 100;
        const progressPercentage = Math.floor((entry.xp / nextLevelXP) * 100);
        
        leaderboardText += `${rankDisplay} **${userName}**\n`;
        leaderboardText += `   📈 Level ${entry.level} • ${entry.xp}/${nextLevelXP} XP (${progressPercentage}%)\n\n`;
      }

      embed.setDescription(leaderboardText || 'No users found on this page.');


      if (currentUserRank === null && userEntries.length > 0) {
        const userEntry = userEntries.find(entry => entry.userId === interaction.user.id);
        if (userEntry) {
          const userRank = userEntries.indexOf(userEntry) + 1;
          const nextLevelXP = userEntry.level * 100;
          const progressPercentage = Math.floor((userEntry.xp / nextLevelXP) * 100);
          
          embed.addFields({
            name: '📍 Your Position',
            value: `Rank #${userRank} • Level ${userEntry.level} • ${userEntry.xp}/${nextLevelXP} XP (${progressPercentage}%)`,
            inline: false
          });
        }
      }

      if (totalPages > 1) {
        let navigationHint = '';
        if (page > 1) navigationHint += `⬅️ Previous: \`/leaderboard page:${page - 1}\`\n`;
        if (page < totalPages) navigationHint += `➡️ Next: \`/leaderboard page:${page + 1}\``;
        
        if (navigationHint) {
          embed.addFields({
            name: '🧭 Navigation',
            value: navigationHint,
            inline: false
          });
        }
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Leaderboard command error:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ Error')
              .setDescription(`An error occurred while loading the leaderboard: ${error.message}`)
          ],
          ephemeral: true
        });
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ Error')
              .setDescription(`An error occurred while loading the leaderboard: ${error.message}`)
          ]
        });
      }
    }
  },
};

function getRankDisplay(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return `🏅 #${rank}`;
  return `#${rank}`;
}

function calculateTotalXP(level, currentXP) {

  let totalXP = currentXP;
  for (let i = 1; i < level; i++) {
    totalXP += i * 100;
  }
  return totalXP;
}