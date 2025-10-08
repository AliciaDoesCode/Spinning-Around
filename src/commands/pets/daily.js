const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { getUserPet, savePet, getUserData, saveUserData, PET_SPECIES, PET_ITEMS } = require('../../utils/petSystem');

// Daily rewards and bonuses
const DAILY_REWARDS = {
  coins: { min: 50, max: 150 },
  xp: { min: 25, max: 75 },
  items: ['basicFood', 'treat', 'toyBall', 'energyDrink'],
  streakBonus: {
    3: { coins: 50, item: 'premiumFood' },
    7: { coins: 100, item: 'potion' },
    14: { coins: 200, item: 'dumbbell' },
    30: { coins: 500, item: 'shield' }
  }
};

// Random events
const RANDOM_EVENTS = [
  {
    id: 'found_treasure',
    name: 'Treasure Discovery',
    description: 'Your pet found a shiny treasure while exploring!',
    rewards: { coins: 75, happiness: 15 }
  },
  {
    id: 'made_friend',
    name: 'New Friend',
    description: 'Your pet made a new friend in the park!',
    rewards: { happiness: 25, energy: 10 }
  },
  {
    id: 'training_boost',
    name: 'Training Inspiration',
    description: 'Your pet feels motivated and trains extra hard!',
    rewards: { xp: 40, attack: 1 }
  },
  {
    id: 'rest_well',
    name: 'Peaceful Sleep',
    description: 'Your pet had the most restful sleep ever!',
    rewards: { energy: 30, hp: 15 }
  },
  {
    id: 'find_food',
    name: 'Wild Snack',
    description: 'Your pet found some delicious wild berries!',
    rewards: { hunger: 20, happiness: 10 }
  }
];

module.exports = {
  name: 'daily',
  description: 'Claim your daily rewards and check for random events!',
  options: [
    {
      name: 'action',
      description: 'Daily action to perform',
      type: 3, // STRING
      required: true,
      choices: [
        { name: 'Claim Daily Reward', value: 'claim' },
        { name: 'Check Streak', value: 'streak' },
        { name: 'Random Event', value: 'event' },
        { name: 'Pet Care Reminder', value: 'reminder' }
      ]
    }
  ],

  callback: async (client, interaction) => {
    try {
      const userId = interaction.user.id;
      const action = interaction.options.getString('action');
      
      // Safety check for PET_ITEMS
      if (!PET_ITEMS || Object.keys(PET_ITEMS).length === 0) {
        console.error('PET_ITEMS could not be loaded or is empty');
        await interaction.reply({ content: '❌ Pet system is not available. Please contact an administrator.', ephemeral: true });
        return;
      }
      
      const petItems = PET_ITEMS;
    
    // Get user's pet
    const pet = getUserPet(userId);
    if (!pet && action !== 'streak') {
      await interaction.reply({ content: '❌ You need a pet to use daily commands! Use `/adopt` to get one.', ephemeral: true });
      return;
    }
    
    // Get or create user data
    const userData = getUserData();
    if (!userData[userId]) {
      userData[userId] = {
        coins: 100,
        inventory: {},
        dailyStreak: 0,
        lastDaily: 0,
        lastEvent: 0
      };
      saveUserData(userData);
    }
    
    const user = userData[userId];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    switch (action) {
      case 'claim':
        // Check if daily reward is available
        const timeSinceLastDaily = now - user.lastDaily;
        if (timeSinceLastDaily < oneDay) {
          const timeLeft = oneDay - timeSinceLastDaily;
          const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
          const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
          
          await interaction.reply({ 
            content: `⏰ You've already claimed your daily reward! Come back in ${hoursLeft}h ${minutesLeft}m.`, 
            ephemeral: true 
          });
          return;
        }
        
        // Check if streak continues (within 48 hours of last claim)
        if (timeSinceLastDaily > (2 * oneDay)) {
          user.dailyStreak = 0; // Reset streak if more than 2 days
        }
        
        // Increment streak and update last daily
        user.dailyStreak += 1;
        user.lastDaily = now;
        
        // Calculate rewards
        const coins = Math.floor(Math.random() * (DAILY_REWARDS.coins.max - DAILY_REWARDS.coins.min + 1)) + DAILY_REWARDS.coins.min;
        const xp = Math.floor(Math.random() * (DAILY_REWARDS.xp.max - DAILY_REWARDS.xp.min + 1)) + DAILY_REWARDS.xp.min;
        
        // Filter available items and select one
        const availableItems = DAILY_REWARDS.items.filter(item => petItems[item]);
        
        if (availableItems.length === 0) {
          console.error('No daily reward items available in petItems! Available items:', Object.keys(petItems));
          await interaction.reply({ content: '❌ Pet items system error. Please contact an administrator.', ephemeral: true });
          return;
        }
        
        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        
        // Add rewards
        user.coins += coins;
        if (!user.inventory[randomItem]) user.inventory[randomItem] = 0;
        user.inventory[randomItem] += 1;
        
        // Add XP to pet
        pet.xp += xp;
        
        // Check for level up
        let leveledUp = false;
        if (pet.xp >= pet.xpToNext) {
          pet.level++;
          pet.xp -= pet.xpToNext;
          pet.xpToNext = Math.floor(pet.xpToNext * 1.5);
          leveledUp = true;
          
          // Increase stats on level up
          pet.stats.attack += Math.floor(Math.random() * 3) + 1;
          pet.stats.defense += Math.floor(Math.random() * 3) + 1;
          pet.stats.speed += Math.floor(Math.random() * 2) + 1;
          pet.stats.maxHp += Math.floor(Math.random() * 5) + 3;
          pet.stats.hp = pet.stats.maxHp;
        }
        
        // Check for streak bonus
        let bonusReward = null;
        if (DAILY_REWARDS.streakBonus[user.dailyStreak]) {
          bonusReward = DAILY_REWARDS.streakBonus[user.dailyStreak];
          // Check if bonus item exists
          if (petItems[bonusReward.item]) {
            user.coins += bonusReward.coins;
            if (!user.inventory[bonusReward.item]) user.inventory[bonusReward.item] = 0;
            user.inventory[bonusReward.item] += 1;
          } else {
            console.error(`Streak bonus item '${bonusReward.item}' not found in petItems! Available:`, Object.keys(petItems));
            bonusReward = null; // Don't show bonus in embed if item doesn't exist
          }
        }
        
        // Save data
        savePet(pet);
        saveUserData(userData);
        
        // Create reward embed
        const rewardEmbed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle('🎁 Daily Reward Claimed!')
          .setDescription(`${interaction.user.username} claimed their daily rewards!`)
          .addFields(
            { name: '💰 Rewards Earned', value: `**Coins:** ${coins}\n**XP:** ${xp}\n**Item:** ${petItems[randomItem]?.emoji || '❓'} ${petItems[randomItem]?.name || 'Unknown Item'}`, inline: true },
            { name: '🔥 Daily Streak', value: `**${user.dailyStreak} days**`, inline: true },
            { name: '💎 Total Coins', value: `${user.coins}`, inline: true }
          );
          
        if (bonusReward && petItems[bonusReward.item]) {
          rewardEmbed.addFields({
            name: '🎉 Streak Bonus!',
            value: `**${user.dailyStreak} Day Bonus:**\n+${bonusReward.coins} coins\n${petItems[bonusReward.item].emoji} ${petItems[bonusReward.item].name}`,
            inline: false
          });
        }
        
        if (leveledUp) {
          rewardEmbed.addFields({
            name: '📈 Level Up!',
            value: `**${pet.name}** reached level ${pet.level}!`,
            inline: false
          });
        }
        
        rewardEmbed.setFooter({ text: 'Come back tomorrow for more rewards!' })
          .setTimestamp();
          
        await interaction.reply({ embeds: [rewardEmbed] });
        break;
        
      case 'streak':
        const streakEmbed = new EmbedBuilder()
          .setColor(0xe67e22)
          .setTitle('🔥 Daily Streak Information')
          .addFields(
            { name: '📅 Current Streak', value: `**${user.dailyStreak} days**`, inline: true },
            { name: '💰 Total Coins', value: `${user.coins}`, inline: true }
          );
          
        // Show next streak milestone
        const nextMilestone = [3, 7, 14, 30].find(milestone => milestone > user.dailyStreak);
        if (nextMilestone) {
          const bonus = DAILY_REWARDS.streakBonus[nextMilestone];
          if (bonus && petItems[bonus.item]) {
            streakEmbed.addFields({
              name: '🎯 Next Milestone',
              value: `**${nextMilestone} days:** +${bonus.coins} coins + ${petItems[bonus.item].emoji} ${petItems[bonus.item].name}`,
              inline: false
            });
          } else if (bonus) {
            streakEmbed.addFields({
              name: '🎯 Next Milestone',
              value: `**${nextMilestone} days:** +${bonus.coins} coins + Special Reward`,
              inline: false
            });
          }
        }
        
        // Show when next daily is available
        const timeUntilNext = oneDay - (now - user.lastDaily);
        if (timeUntilNext > 0) {
          const hoursUntil = Math.floor(timeUntilNext / (60 * 60 * 1000));
          const minutesUntil = Math.floor((timeUntilNext % (60 * 60 * 1000)) / (60 * 1000));
          streakEmbed.addFields({
            name: '⏰ Next Daily Available',
            value: `In ${hoursUntil}h ${minutesUntil}m`,
            inline: true
          });
        } else {
          streakEmbed.addFields({
            name: '✅ Daily Available',
            value: 'Claim now with `/daily claim`!',
            inline: true
          });
        }
        
        await interaction.reply({ embeds: [streakEmbed], ephemeral: true });
        break;
        
      case 'event':
        // Check if random event is available (once every 4-8 hours)
        const eventCooldown = 4 * 60 * 60 * 1000; // 4 hours minimum
        const timeSinceLastEvent = now - user.lastEvent;
        
        if (timeSinceLastEvent < eventCooldown) {
          const timeLeft = eventCooldown - timeSinceLastEvent;
          const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
          const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
          
          await interaction.reply({ 
            content: `⏰ No events available yet! Check back in ${hoursLeft}h ${minutesLeft}m.`, 
            ephemeral: true 
          });
          return;
        }
        
        // 60% chance for an event to occur
        if (Math.random() < 0.6) {
          const randomEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
          user.lastEvent = now;
          
          // Apply rewards
          if (randomEvent.rewards.coins) user.coins += randomEvent.rewards.coins;
          if (randomEvent.rewards.happiness) pet.happiness = Math.min(100, pet.happiness + randomEvent.rewards.happiness);
          if (randomEvent.rewards.energy) pet.energy = Math.min(100, pet.energy + randomEvent.rewards.energy);
          if (randomEvent.rewards.xp) pet.xp += randomEvent.rewards.xp;
          if (randomEvent.rewards.attack) pet.stats.attack += randomEvent.rewards.attack;
          if (randomEvent.rewards.hp) pet.stats.hp = Math.min(pet.stats.maxHp, pet.stats.hp + randomEvent.rewards.hp);
          if (randomEvent.rewards.hunger) pet.hunger = Math.min(100, pet.hunger + randomEvent.rewards.hunger);
          
          // Save data
          savePet(pet);
          saveUserData(userData);
          
          const eventEmbed = new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle(randomEvent.name)
            .setDescription(randomEvent.description)
            .addFields({
              name: '🎁 Rewards',
              value: Object.entries(randomEvent.rewards).map(([key, value]) => {
                switch (key) {
                  case 'coins': return `💰 +${value} coins`;
                  case 'happiness': return `😊 +${value} happiness`;
                  case 'energy': return `⚡ +${value} energy`;
                  case 'xp': return `📈 +${value} XP`;
                  case 'attack': return `⚔️ +${value} attack`;
                  case 'hp': return `❤️ +${value} HP`;
                  case 'hunger': return `🍖 +${value} hunger`;
                  default: return `${key}: +${value}`;
                }
              }).join('\n'),
              inline: false
            })
            .setTimestamp();
            
          await interaction.reply({ embeds: [eventEmbed] });
        } else {
          await interaction.reply({ content: '🌙 Your pet is resting peacefully. Nothing exciting happened this time.', ephemeral: true });
        }
        break;
        
      case 'reminder':
        // Check pet's care status and provide reminders
        const careStatus = {
          hunger: pet.hunger < 30 ? '🟥 Hungry!' : pet.hunger < 60 ? '🟨 Getting hungry' : '🟩 Well fed',
          happiness: pet.happiness < 30 ? '🟥 Sad!' : pet.happiness < 60 ? '🟨 Needs attention' : '🟩 Happy',
          energy: pet.energy < 30 ? '🟥 Exhausted!' : pet.energy < 60 ? '🟨 Getting tired' : '🟩 Energetic'
        };
        
        const reminderEmbed = new EmbedBuilder()
          .setColor(pet.happiness < 30 || pet.hunger < 30 || pet.energy < 30 ? 0xe74c3c : 0x27ae60)
          .setTitle(`📋 ${pet.name}'s Care Status`)
          .addFields(
            { name: '🍖 Hunger', value: careStatus.hunger, inline: true },
            { name: '😊 Happiness', value: careStatus.happiness, inline: true },
            { name: '⚡ Energy', value: careStatus.energy, inline: true }
          );
          
        // Add care suggestions
        const suggestions = [];
        if (pet.hunger < 40) suggestions.push('🍖 Feed your pet with `/pet feed`');
        if (pet.happiness < 40) suggestions.push('🎾 Play with your pet using `/pet play`');
        if (pet.energy < 40) suggestions.push('💤 Let your pet rest or use energy items');
        if (pet.hunger > 80 && pet.happiness > 80 && pet.energy > 60) suggestions.push('💪 Train your pet with `/pet train`');
        
        if (suggestions.length > 0) {
          reminderEmbed.addFields({
            name: '💡 Care Suggestions',
            value: suggestions.join('\n'),
            inline: false
          });
        } else {
          reminderEmbed.addFields({
            name: '✨ Pet Status',
            value: 'Your pet is doing great! Keep up the good care!',
            inline: false
          });
        }
        
        reminderEmbed.setFooter({ text: 'Regular care helps your pet grow stronger!' });
        
        await interaction.reply({ embeds: [reminderEmbed], ephemeral: true });
        break;
    }
    } catch (error) {
      console.error('Error in daily command:', error);
      console.error('Stack trace:', error.stack);
      
      try {
        await interaction.reply({ content: '❌ An error occurred with the daily command. Please try again.', ephemeral: true });
      } catch (replyError) {
        console.error('Could not send error message:', replyError);
      }
    }
  }
};