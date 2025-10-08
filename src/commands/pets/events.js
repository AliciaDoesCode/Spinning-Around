const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserPet, savePet, getUserData, saveUserData, PET_SPECIES, PET_ITEMS } = require('../../utils/petSystem');

// Seasonal events and special occasions
const SEASONAL_EVENTS = {
  christmas: {
    name: 'Winter Wonderland Festival',
    description: 'A magical winter celebration with special rewards and festive activities!',
    duration: { start: '12-01', end: '01-07' }, // Dec 1 - Jan 7
    activities: [
      {
        name: 'Gift Exchange',
        description: 'Exchange gifts with other pet owners!',
        rewards: { coins: 200, items: ['premiumFood', 'potion'] }
      },
      {
        name: 'Snow Battle Tournament',
        description: 'Special winter-themed battles with snow effects!',
        rewards: { battleRating: 50, items: ['shield'] }
      }
    ],
    dailyBonus: { coins: 25, happiness: 10 }
  },
  
  halloween: {
    name: 'Spooky Season Spectacular',
    description: 'Mysterious Halloween adventures with spooky rewards!',
    duration: { start: '10-15', end: '11-05' }, // Oct 15 - Nov 5
    activities: [
      {
        name: 'Trick or Treat',
        description: 'Collect candy and mysterious treats!',
        rewards: { coins: 150, items: ['treat', 'energyDrink'] }
      },
      {
        name: 'Haunted House Challenge',
        description: 'Navigate spooky challenges with your pet!',
        rewards: { xp: 100, items: ['dumbbell'] }
      }
    ],
    dailyBonus: { coins: 20, energy: 15 }
  },
  
  valentine: {
    name: 'Love & Friendship Festival',
    description: 'Celebrate love and friendship with heartwarming activities!',
    duration: { start: '02-10', end: '02-20' }, // Feb 10 - Feb 20
    activities: [
      {
        name: 'Pet Matchmaking',
        description: 'Help pets make new friends!',
        rewards: { happiness: 50, items: ['treat'] }
      },
      {
        name: 'Love Potion Brewing',
        description: 'Craft special potions for enhanced bonding!',
        rewards: { coins: 100, items: ['potion', 'premiumFood'] }
      }
    ],
    dailyBonus: { happiness: 20, coins: 15 }
  },
  
  summer: {
    name: 'Summer Beach Party',
    description: 'Enjoy sunny beach activities and summer fun!',
    duration: { start: '06-15', end: '08-31' }, // Jun 15 - Aug 31
    activities: [
      {
        name: 'Beach Volleyball',
        description: 'Play beach games with other pets!',
        rewards: { speed: 2, items: ['toyBall'] }
      },
      {
        name: 'Treasure Hunt',
        description: 'Search for buried treasures on the beach!',
        rewards: { coins: 300, items: ['treat', 'energyDrink'] }
      }
    ],
    dailyBonus: { energy: 25, coins: 10 }
  },
  
  newYear: {
    name: 'New Year Celebration',
    description: 'Ring in the new year with spectacular festivities!',
    duration: { start: '12-31', end: '01-15' }, // Dec 31 - Jan 15
    activities: [
      {
        name: 'Resolution Challenge',
        description: 'Set training goals for your pet!',
        rewards: { xp: 200, items: ['dumbbell', 'shield'] }
      },
      {
        name: 'Fireworks Show',
        description: 'Watch amazing fireworks with your pet!',
        rewards: { happiness: 40, coins: 100 }
      }
    ],
    dailyBonus: { coins: 30, xp: 25 }
  }
};

// Competition types
const COMPETITIONS = {
  beauty: {
    name: 'Beauty Contest',
    description: 'Show off your pet\'s beauty and care!',
    requirements: { happiness: 80, energy: 60 },
    rewards: { winner: { coins: 500, battleRating: 30 }, participant: { coins: 100 } }
  },
  
  strength: {
    name: 'Strength Competition',
    description: 'Test your pet\'s combat prowess!',
    requirements: { level: 10, attack: 25 },
    rewards: { winner: { coins: 400, attack: 3 }, participant: { coins: 80 } }
  },
  
  intelligence: {
    name: 'Intelligence Challenge',
    description: 'Showcase your pet\'s clever mind!',
    requirements: { intelligence: 30, level: 8 },
    rewards: { winner: { coins: 350, intelligence: 5 }, participant: { coins: 70 } }
  },
  
  speed: {
    name: 'Speed Race',
    description: 'Race against other speedy pets!',
    requirements: { speed: 20, energy: 70 },
    rewards: { winner: { coins: 300, speed: 3 }, participant: { coins: 60 } }
  }
};

function getCurrentEvent() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const currentDate = `${month}-${day}`;
  
  for (const [eventId, event] of Object.entries(SEASONAL_EVENTS)) {
    const [startMonth, startDay] = event.duration.start.split('-');
    const [endMonth, endDay] = event.duration.end.split('-');
    
    // Handle events that span across years (like Christmas/New Year)
    if (startMonth > endMonth) {
      if ((month >= startMonth && day >= startDay) || (month <= endMonth && day <= endDay)) {
        return { eventId, ...event };
      }
    } else {
      if ((month > startMonth || (month === startMonth && day >= startDay)) &&
          (month < endMonth || (month === endMonth && day <= endDay))) {
        return { eventId, ...event };
      }
    }
  }
  
  return null;
}

module.exports = {
  name: 'events',
  description: 'Participate in seasonal events and competitions!',
  options: [
    {
      name: 'action',
      description: 'Event action to perform',
      type: 3, // STRING
      required: true,
      choices: [
        { name: 'Current Events', value: 'current' },
        { name: 'Join Activity', value: 'join' },
        { name: 'Competitions', value: 'compete' },
        { name: 'Event Calendar', value: 'calendar' },
        { name: 'Claim Event Bonus', value: 'bonus' }
      ]
    },
    {
      name: 'activity',
      description: 'Specific activity or competition to join',
      type: 3, // STRING
      required: false
    }
  ],

  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    const action = interaction.options.getString('action');
    const activityChoice = interaction.options.getString('activity');
    
    // Get user data and pet
    const userData = getUserData();
    if (!userData[userId]) {
      userData[userId] = {
        coins: 100,
        inventory: {},
        dailyStreak: 0,
        lastDaily: 0,
        lastEvent: 0,
        eventParticipation: {},
        lastEventBonus: 0
      };
      saveUserData(userData);
    }
    
    const user = userData[userId];
    const pet = getUserPet(userId);
    
    switch (action) {
      case 'current':
        const currentEvent = getCurrentEvent();
        
        if (!currentEvent) {
          const nextEventEmbed = new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle('📅 No Active Events')
            .setDescription('No seasonal events are currently running. Check back during holidays and special occasions!')
            .addFields({
              name: '🔮 Upcoming Events',
              value: '🎃 Halloween (Oct 15 - Nov 5)\n🎄 Winter Festival (Dec 1 - Jan 7)\n💝 Valentine\'s (Feb 10 - Feb 20)\n☀️ Summer Party (Jun 15 - Aug 31)',
              inline: false
            })
            .setFooter({ text: 'Events bring special rewards and activities!' });
            
          await interaction.reply({ embeds: [nextEventEmbed] });
          return;
        }
        
        const eventEmbed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle(currentEvent.name)
          .setDescription(currentEvent.description)
          .addFields({
            name: '🎯 Available Activities',
            value: currentEvent.activities.map((activity, index) => 
              `**${index + 1}.** ${activity.name}\n${activity.description}`
            ).join('\n\n'),
            inline: false
          });
          
        if (currentEvent.dailyBonus) {
          const bonusText = Object.entries(currentEvent.dailyBonus).map(([key, value]) => {
            switch (key) {
              case 'coins': return `💰 +${value} coins`;
              case 'happiness': return `😊 +${value} happiness`;
              case 'energy': return `⚡ +${value} energy`;
              case 'xp': return `📈 +${value} XP`;
              default: return `${key}: +${value}`;
            }
          }).join('\n');
          
          eventEmbed.addFields({
            name: '🎁 Daily Event Bonus',
            value: bonusText,
            inline: true
          });
        }
        
        eventEmbed.setFooter({ text: 'Use /events join [activity] to participate!' });
        
        await interaction.reply({ embeds: [eventEmbed] });
        break;
        
      case 'join':
        if (!pet) {
          await interaction.reply({ content: '❌ You need a pet to participate in events! Use `/adopt` to get one.', ephemeral: true });
          return;
        }
        
        const activeEvent = getCurrentEvent();
        if (!activeEvent) {
          await interaction.reply({ content: '❌ No events are currently active!', ephemeral: true });
          return;
        }
        
        if (!activityChoice) {
          const activityList = activeEvent.activities.map((activity, index) => 
            `**${index + 1}.** ${activity.name}`
          ).join('\n');
          
          await interaction.reply({ 
            content: `❌ Please specify an activity to join:\n${activityList}\n\nExample: \`/events join activity:1\``, 
            ephemeral: true 
          });
          return;
        }
        
        const activityIndex = parseInt(activityChoice) - 1;
        const selectedActivity = activeEvent.activities[activityIndex];
        
        if (!selectedActivity) {
          await interaction.reply({ content: '❌ Invalid activity number!', ephemeral: true });
          return;
        }
        
        // Check if already participated today
        const today = new Date().toDateString();
        if (user.eventParticipation[activeEvent.eventId] === today) {
          await interaction.reply({ content: '❌ You\'ve already participated in an event activity today! Come back tomorrow.', ephemeral: true });
          return;
        }
        
        // Check basic requirements (energy, happiness)
        if (pet.energy < 30) {
          await interaction.reply({ content: '❌ Your pet is too tired to participate! Rest or use energy items first.', ephemeral: true });
          return;
        }
        
        // Participate in activity
        user.eventParticipation[activeEvent.eventId] = today;
        pet.energy = Math.max(0, pet.energy - 25);
        
        // Apply rewards
        const rewards = selectedActivity.rewards;
        if (rewards.coins) user.coins += rewards.coins;
        if (rewards.battleRating) pet.battleRating += rewards.battleRating;
        if (rewards.happiness) pet.happiness = Math.min(100, pet.happiness + rewards.happiness);
        if (rewards.xp) pet.xp += rewards.xp;
        if (rewards.speed) pet.stats.speed += rewards.speed;
        if (rewards.items) {
          rewards.items.forEach(item => {
            if (!user.inventory[item]) user.inventory[item] = 0;
            user.inventory[item] += 1;
          });
        }
        
        // Save data
        savePet(userId, pet);
        saveUserData(userData);
        
        const participationEmbed = new EmbedBuilder()
          .setColor(0x27ae60)
          .setTitle(`🎉 ${selectedActivity.name} Complete!`)
          .setDescription(`**${pet.name}** participated in ${selectedActivity.name}!`)
          .addFields({
            name: '🎁 Rewards Earned',
            value: Object.entries(rewards).map(([key, value]) => {
              switch (key) {
                case 'coins': return `💰 +${value} coins`;
                case 'battleRating': return `⭐ +${value} battle rating`;
                case 'happiness': return `😊 +${value} happiness`;
                case 'xp': return `📈 +${value} XP`;
                case 'speed': return `🏃 +${value} speed`;
                case 'items': return `📦 Items: ${value.map(item => PET_ITEMS[item].name).join(', ')}`;
                default: return `${key}: +${value}`;
              }
            }).join('\n'),
            inline: false
          })
          .setFooter({ text: 'Come back tomorrow for more event activities!' })
          .setTimestamp();
          
        await interaction.reply({ embeds: [participationEmbed] });
        break;
        
      case 'compete':
        if (!pet) {
          await interaction.reply({ content: '❌ You need a pet to enter competitions! Use `/adopt` to get one.', ephemeral: true });
          return;
        }
        
        // Show available competitions
        const competitionEmbed = new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle('🏆 Pet Competitions')
          .setDescription('Test your pet in various competitive challenges!')
          .addFields(
            Object.entries(COMPETITIONS).map(([compId, comp], index) => ({
              name: `${index + 1}. ${comp.name}`,
              value: `${comp.description}\n**Requirements:** ${Object.entries(comp.requirements).map(([stat, min]) => 
                `${stat}: ${min}+`
              ).join(', ')}\n**Rewards:** ${comp.rewards.winner.coins} coins (winner)`,
              inline: false
            }))
          )
          .setFooter({ text: 'Competitions reset weekly! Winners are chosen randomly among qualified pets.' });
          
        await interaction.reply({ embeds: [competitionEmbed] });
        break;
        
      case 'bonus':
        const eventForBonus = getCurrentEvent();
        if (!eventForBonus) {
          await interaction.reply({ content: '❌ No events are currently active!', ephemeral: true });
          return;
        }
        
        if (!pet) {
          await interaction.reply({ content: '❌ You need a pet to claim event bonuses! Use `/adopt` to get one.', ephemeral: true });
          return;
        }
        
        // Check if already claimed today
        const todayTimestamp = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
        if (user.lastEventBonus === todayTimestamp) {
          await interaction.reply({ content: '❌ You\'ve already claimed your daily event bonus today!', ephemeral: true });
          return;
        }
        
        // Claim bonus
        user.lastEventBonus = todayTimestamp;
        const bonus = eventForBonus.dailyBonus;
        
        if (bonus.coins) user.coins += bonus.coins;
        if (bonus.happiness) pet.happiness = Math.min(100, pet.happiness + bonus.happiness);
        if (bonus.energy) pet.energy = Math.min(100, pet.energy + bonus.energy);
        if (bonus.xp) pet.xp += bonus.xp;
        
        // Save data
        savePet(userId, pet);
        saveUserData(userData);
        
        const bonusEmbed = new EmbedBuilder()
          .setColor(0xe67e22)
          .setTitle('🎁 Event Bonus Claimed!')
          .setDescription(`Daily bonus from **${eventForBonus.name}**`)
          .addFields({
            name: '🎉 Bonus Rewards',
            value: Object.entries(bonus).map(([key, value]) => {
              switch (key) {
                case 'coins': return `💰 +${value} coins`;
                case 'happiness': return `😊 +${value} happiness`;
                case 'energy': return `⚡ +${value} energy`;
                case 'xp': return `📈 +${value} XP`;
                default: return `${key}: +${value}`;
              }
            }).join('\n'),
            inline: false
          })
          .setFooter({ text: 'Come back tomorrow for another bonus!' })
          .setTimestamp();
          
        await interaction.reply({ embeds: [bonusEmbed] });
        break;
        
      case 'calendar':
        const calendarEmbed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle('📅 Annual Event Calendar')
          .setDescription('Plan ahead for all the exciting seasonal events!')
          .addFields(
            { name: '🎊 New Year Celebration', value: 'Dec 31 - Jan 15\nResolution challenges and fireworks!', inline: true },
            { name: '💝 Love & Friendship Festival', value: 'Feb 10 - Feb 20\nPet matchmaking and love potions!', inline: true },
            { name: '☀️ Summer Beach Party', value: 'Jun 15 - Aug 31\nBeach games and treasure hunts!', inline: true },
            { name: '🎃 Spooky Season Spectacular', value: 'Oct 15 - Nov 5\nTrick-or-treating and haunted challenges!', inline: true },
            { name: '🎄 Winter Wonderland Festival', value: 'Dec 1 - Jan 7\nGift exchanges and snow battles!', inline: true }
          )
          .setFooter({ text: 'Each event brings unique activities and exclusive rewards!' })
          .setTimestamp();
          
        await interaction.reply({ embeds: [calendarEmbed] });
        break;
    }
  }
};