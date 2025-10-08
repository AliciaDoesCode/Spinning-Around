const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserPet, getUserData, PET_SPECIES, PET_ITEMS } = require('../../utils/petSystem');

module.exports = {
  name: 'profile',
  description: 'View your complete pet profile and inventory!',
  options: [
    {
      name: 'action',
      description: 'Profile action to perform',
      type: 3, // STRING
      required: true,
      choices: [
        { name: 'Pet Profile', value: 'pet' },
        { name: 'Inventory', value: 'inventory' },
        { name: 'Complete Stats', value: 'complete' },
        { name: 'Achievements', value: 'achievements' }
      ]
    }
  ],

  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    const action = interaction.options.getString('action');
    
    // Get user data and pet
    const userData = getUserData();
    const userProfile = userData[userId] || { coins: 100, inventory: {}, dailyStreak: 0 };
    const pet = getUserPet(userId);
    
    switch (action) {
      case 'pet':
        if (!pet) {
          await interaction.reply({ content: '❌ You don\'t have a pet yet! Use `/adopt` to get one.', ephemeral: true });
          return;
        }
        
        const species = PET_SPECIES[pet.species];
        const currentEvolution = species.evolutions[pet.evolutionStage];
        const nextEvolution = species.evolutions[pet.evolutionStage + 1];
        
        // Calculate care quality
        const careScore = Math.floor((pet.happiness + pet.energy + pet.hunger) / 3);
        const careRating = careScore >= 80 ? '⭐⭐⭐ Excellent' : 
                          careScore >= 60 ? '⭐⭐ Good' : 
                          careScore >= 40 ? '⭐ Fair' : '💔 Needs Care';
        
        const petEmbed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle(`${currentEvolution.emoji} ${pet.name}'s Profile`)
          .setDescription(`**Species:** ${species.name}\n**Evolution:** ${currentEvolution.name}`)
          .addFields(
            { 
              name: '📈 Level & Experience', 
              value: `**Level:** ${pet.level}\n**XP:** ${pet.xp}/${pet.xpToNext}\n**Progress:** ${'▓'.repeat(Math.floor(pet.xp / pet.xpToNext * 10))}${'░'.repeat(10 - Math.floor(pet.xp / pet.xpToNext * 10))}`, 
              inline: true 
            },
            { 
              name: '⚔️ Battle Stats', 
              value: `**Attack:** ${pet.stats.attack}\n**Defense:** ${pet.stats.defense}\n**Speed:** ${pet.stats.speed}\n**HP:** ${pet.stats.hp}/${pet.stats.maxHp}`, 
              inline: true 
            },
            { 
              name: '🏆 Battle Record', 
              value: `**Wins:** ${pet.wins}\n**Losses:** ${pet.losses}\n**Rating:** ${pet.battleRating}`, 
              inline: true 
            },
            { 
              name: '💝 Care Status', 
              value: `**Happiness:** ${pet.happiness}/100\n**Energy:** ${pet.energy}/100\n**Hunger:** ${pet.hunger}/100\n**Care Rating:** ${careRating}`, 
              inline: true 
            },
            { 
              name: '🧬 Personality', 
              value: pet.personality.map(trait => trait.charAt(0).toUpperCase() + trait.slice(1)).join(', '), 
              inline: true 
            },
            { 
              name: '📅 Pet Age', 
              value: `${Math.floor((Date.now() - pet.createdAt) / (24 * 60 * 60 * 1000))} days old`, 
              inline: true 
            }
          );
          
        if (nextEvolution) {
          petEmbed.addFields({
            name: '🔮 Next Evolution',
            value: `**${nextEvolution.emoji} ${nextEvolution.name}** at level ${nextEvolution.level}`,
            inline: false
          });
        } else {
          petEmbed.addFields({
            name: '👑 Evolution Status',
            value: 'Fully evolved! Maximum potential reached!',
            inline: false
          });
        }
        
        petEmbed.setFooter({ text: `Pet ID: ${pet.id} | Owner: ${interaction.user.username}` })
          .setTimestamp();
          
        await interaction.reply({ embeds: [petEmbed] });
        break;
        
      case 'inventory':
        const inventoryEmbed = new EmbedBuilder()
          .setColor(0xe67e22)
          .setTitle('🎒 Your Inventory')
          .addFields(
            { name: '💰 Coins', value: `${userProfile.coins}`, inline: true },
            { name: '🔥 Daily Streak', value: `${userProfile.dailyStreak} days`, inline: true }
          );
          
        if (Object.keys(userProfile.inventory).length > 0) {
          const inventoryItems = Object.entries(userProfile.inventory)
            .filter(([item, count]) => count > 0)
            .map(([item, count]) => {
              const itemData = PET_ITEMS[item];
              return `${itemData.emoji} **${itemData.name}** x${count}`;
            })
            .join('\n');
            
          if (inventoryItems) {
            inventoryEmbed.addFields({ name: '📦 Items', value: inventoryItems, inline: false });
          }
        } else {
          inventoryEmbed.addFields({ name: '📦 Items', value: 'No items yet! Get some through daily rewards or events.', inline: false });
        }
        
        inventoryEmbed.setFooter({ text: 'Use /daily claim to get more items!' });
        
        await interaction.reply({ embeds: [inventoryEmbed], ephemeral: true });
        break;
        
      case 'complete':
        if (!pet) {
          await interaction.reply({ content: '❌ You don\'t have a pet yet! Use `/adopt` to get one.', ephemeral: true });
          return;
        }
        
        const completeEmbed = new EmbedBuilder()
          .setColor(0x9b59b6)
          .setTitle(`📊 Complete Profile - ${pet.name}`)
          .setDescription(`${PET_SPECIES[pet.species].evolutions[pet.evolutionStage].emoji} **${PET_SPECIES[pet.species].name}**`)
          .addFields(
            { 
              name: '🎮 Basic Info', 
              value: `**Level:** ${pet.level}\n**XP:** ${pet.xp}/${pet.xpToNext}\n**Age:** ${Math.floor((Date.now() - pet.createdAt) / (24 * 60 * 60 * 1000))} days\n**Owner:** ${interaction.user.username}`, 
              inline: true 
            },
            { 
              name: '⚔️ Combat Stats', 
              value: `**HP:** ${pet.stats.hp}/${pet.stats.maxHp}\n**Attack:** ${pet.stats.attack}\n**Defense:** ${pet.stats.defense}\n**Speed:** ${pet.stats.speed}\n**Intelligence:** ${pet.stats.intelligence}`, 
              inline: true 
            },
            { 
              name: '💝 Care Stats', 
              value: `**Happiness:** ${pet.happiness}/100\n**Energy:** ${pet.energy}/100\n**Hunger:** ${pet.hunger}/100`, 
              inline: true 
            },
            { 
              name: '🏆 Battle History', 
              value: `**Wins:** ${pet.wins}\n**Losses:** ${pet.losses}\n**Win Rate:** ${pet.wins + pet.losses > 0 ? ((pet.wins / (pet.wins + pet.losses)) * 100).toFixed(1) : 0}%\n**Rating:** ${pet.battleRating}`, 
              inline: true 
            },
            { 
              name: '💰 Resources', 
              value: `**Coins:** ${userProfile.coins}\n**Daily Streak:** ${userProfile.dailyStreak} days\n**Items:** ${Object.values(userProfile.inventory).reduce((a, b) => a + b, 0)}`, 
              inline: true 
            },
            { 
              name: '🧬 Characteristics', 
              value: `**Personality:** ${pet.personality.join(', ')}\n**Evolution Stage:** ${pet.evolutionStage + 1}/4\n**Species Trait:** ${PET_SPECIES[pet.species].description}`, 
              inline: true 
            }
          );
          
        // Add care timeline
        const timeSinceLastFed = Math.floor((Date.now() - pet.lastFed) / (60 * 1000));
        const timeSinceLastPlayed = Math.floor((Date.now() - pet.lastPlayed) / (60 * 1000));
        const timeSinceLastTrained = Math.floor((Date.now() - pet.lastTrained) / (60 * 1000));
        
        completeEmbed.addFields({
          name: '⏰ Recent Care',
          value: `**Last Fed:** ${timeSinceLastFed}m ago\n**Last Played:** ${timeSinceLastPlayed}m ago\n**Last Trained:** ${timeSinceLastTrained}m ago`,
          inline: false
        });
        
        completeEmbed.setFooter({ text: `Pet ID: ${pet.id}` })
          .setTimestamp();
          
        await interaction.reply({ embeds: [completeEmbed] });
        break;
        
      case 'achievements':
        if (!pet) {
          await interaction.reply({ content: '❌ You don\'t have a pet yet! Use `/adopt` to get one.', ephemeral: true });
          return;
        }
        
        // Calculate achievements
        const achievements = [];
        
        // Level achievements
        if (pet.level >= 50) achievements.push('👑 **Master Trainer** - Reached level 50');
        else if (pet.level >= 25) achievements.push('🎓 **Expert Trainer** - Reached level 25');
        else if (pet.level >= 10) achievements.push('📚 **Experienced Trainer** - Reached level 10');
        else if (pet.level >= 5) achievements.push('🌟 **Novice Trainer** - Reached level 5');
        
        // Battle achievements  
        if (pet.wins >= 100) achievements.push('⚔️ **Battle Legend** - Won 100 battles');
        else if (pet.wins >= 50) achievements.push('🛡️ **Battle Master** - Won 50 battles');
        else if (pet.wins >= 25) achievements.push('⚡ **Battle Expert** - Won 25 battles');
        else if (pet.wins >= 10) achievements.push('🏆 **Battle Veteran** - Won 10 battles');
        else if (pet.wins >= 1) achievements.push('🥉 **First Victory** - Won your first battle');
        
        // Care achievements
        const avgCare = (pet.happiness + pet.energy + pet.hunger) / 3;
        if (avgCare >= 90) achievements.push('💖 **Perfect Caretaker** - Maintain 90+ care average');
        else if (avgCare >= 80) achievements.push('💝 **Loving Caretaker** - Maintain 80+ care average');
        else if (avgCare >= 70) achievements.push('😊 **Good Caretaker** - Maintain 70+ care average');
        
        // Special achievements
        if (userProfile.dailyStreak >= 30) achievements.push('📅 **Dedicated Owner** - 30 day streak');
        else if (userProfile.dailyStreak >= 14) achievements.push('🔥 **Committed Owner** - 14 day streak');
        else if (userProfile.dailyStreak >= 7) achievements.push('✨ **Regular Owner** - 7 day streak');
        
        if (userProfile.coins >= 1000) achievements.push('💰 **Wealthy Trainer** - Accumulated 1000+ coins');
        
        if (pet.evolutionStage >= 3) achievements.push('🔮 **Evolution Master** - Fully evolved pet');
        
        const petAge = Math.floor((Date.now() - pet.createdAt) / (24 * 60 * 60 * 1000));
        if (petAge >= 30) achievements.push('🎂 **Long-time Friend** - 30+ days together');
        
        const achievementEmbed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle(`🏅 ${interaction.user.username}'s Achievements`)
          .setDescription(`Unlocked achievements with **${pet.name}**`)
          .addFields({
            name: `🎖️ Achievements (${achievements.length})`,
            value: achievements.length > 0 ? achievements.join('\n') : 'No achievements yet! Keep caring for your pet to unlock them.',
            inline: false
          })
          .setFooter({ text: 'Keep playing to unlock more achievements!' })
          .setTimestamp();
          
        await interaction.reply({ embeds: [achievementEmbed] });
        break;
    }
  }
};