const { EmbedBuilder } = require('discord.js');
const { getUserPet, savePet, PET_SPECIES } = require('../../utils/petSystem');

module.exports = {
  name: 'pet',
  description: 'Interact with your virtual pet',
  options: [
    {
      name: 'action',
      description: 'Choose what to do with your pet',
      type: 3, // STRING
      required: true,
      choices: [
        { name: 'Check Status', value: 'status' },
        { name: 'Feed Pet', value: 'feed' },
        { name: 'Play with Pet', value: 'play' },
        { name: 'Train Pet', value: 'train' },
        { name: 'Pet Care Info', value: 'care' }
      ]
    },
    {
      name: 'type',
      description: 'Training type (for train action) or food type (for feed action)',
      type: 3, // STRING
      required: false,
      choices: [
        // Training types
        { name: 'Attack Training', value: 'attack' },
        { name: 'Defense Training', value: 'defense' },
        { name: 'Speed Training', value: 'speed' },
        { name: 'Intelligence Training', value: 'intelligence' },
        // Food types
        { name: 'Basic Food', value: 'basicFood' },
        { name: 'Premium Food', value: 'premiumFood' },
        { name: 'Special Treat', value: 'treat' }
      ]
    }
  ],

  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    const action = interaction.options.getString('action');
    const type = interaction.options.getString('type');
    
    // Get user's pet
    const pet = getUserPet(userId);
    if (!pet) {
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('❌ No Pet Found')
        .setDescription('You don\'t have a pet yet! Use `/adopt` to get your first virtual companion.')
        .setFooter({ text: 'Adopt a pet to start your journey!' })
        .setTimestamp();
        
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    
    const speciesData = PET_SPECIES[pet.species];
    const evolution = pet.getCurrentEvolution();
    
    switch (action) {
      case 'status':
        // Update pet condition
        const condition = pet.updateCondition();
        savePet(pet);
        
        const nextEvo = pet.getNextEvolution();
        
        const statusEmbed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle(`${evolution.emoji} ${pet.name} the ${evolution.name}`)
          .setDescription(`*${pet.name} ${condition.message}* ${condition.emoji}`)
          .addFields(
            { name: '📊 Level & XP', value: `**Level:** ${pet.level}\n**XP:** ${pet.xp}/${pet.xpToNext}\n**Progress:** ${'▓'.repeat(Math.floor((pet.xp/pet.xpToNext)*10))}${'░'.repeat(10-Math.floor((pet.xp/pet.xpToNext)*10))}`, inline: true },
            { name: '❤️ Care Stats', value: `**Happiness:** ${pet.happiness}/100\n**Hunger:** ${pet.hunger}/100\n**Energy:** ${pet.energy}/100`, inline: true },
            { name: '⚔️ Battle Stats', value: `**HP:** ${pet.stats.hp}/${pet.stats.maxHp}\n**Attack:** ${pet.stats.attack}\n**Defense:** ${pet.stats.defense}`, inline: true },
            { name: '🏃 Other Stats', value: `**Speed:** ${pet.stats.speed}\n**Intelligence:** ${pet.stats.intelligence}\n**Personality:** ${pet.personality}`, inline: true },
            { name: '🏆 Battle Record', value: `**Wins:** ${pet.wins}\n**Losses:** ${pet.losses}\n**Rating:** ${pet.battleRating}`, inline: true },
            { name: '🔄 Evolution', value: nextEvo ? `**Next:** ${nextEvo.emoji} ${nextEvo.name}\n**Required Level:** ${nextEvo.level}` : '**Max Evolution Reached!**', inline: true }
          )
          .setFooter({ text: `${speciesData.name} • Adopted ${new Date(pet.createdAt).toLocaleDateString()}` })
          .setTimestamp();
          
        await interaction.reply({ embeds: [statusEmbed] });
        break;
        
      case 'feed':
        const foodType = type || 'basicFood';
        const feedResult = pet.feed(foodType);
        
        if (!feedResult.success) {
          await interaction.reply({ content: `❌ ${feedResult.message}`, ephemeral: true });
          return;
        }
        
        savePet(pet);
        
        const feedEmbed = new EmbedBuilder()
          .setColor(0x51cf66)
          .setTitle('🍖 Feeding Time!')
          .setDescription(feedResult.message)
          .addFields(
            { name: '📈 Effects', value: Object.entries(feedResult.effects).map(([stat, value]) => `**${stat}:** ${value > 0 ? '+' : ''}${value}`).join('\n'), inline: true },
            { name: '📊 Current Stats', value: `**Happiness:** ${pet.happiness}/100\n**Hunger:** ${pet.hunger}/100\n**Energy:** ${pet.energy}/100`, inline: true }
          )
          .setTimestamp();
          
        await interaction.reply({ embeds: [feedEmbed] });
        break;
        
      case 'play':
        const playResult = pet.play();
        
        if (!playResult.success) {
          await interaction.reply({ content: `❌ ${playResult.message}`, ephemeral: true });
          return;
        }
        
        const leveledUp = pet.addXP(0); // Check if level up occurred from play XP
        savePet(pet);
        
        const playEmbed = new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle('🎾 Playtime!')
          .setDescription(playResult.message + (leveledUp ? '\n🎉 **Level Up!** Your pet grew stronger!' : ''))
          .addFields(
            { name: '📊 Current Stats', value: `**Happiness:** ${pet.happiness}/100\n**Energy:** ${pet.energy}/100\n**Level:** ${pet.level}`, inline: false }
          )
          .setTimestamp();
          
        await interaction.reply({ embeds: [playEmbed] });
        break;
        
      case 'train':
        if (!type || !['attack', 'defense', 'speed', 'intelligence'].includes(type)) {
          await interaction.reply({ content: '❌ Please specify a training type: attack, defense, speed, or intelligence', ephemeral: true });
          return;
        }
        
        const trainResult = pet.train(type);
        
        if (!trainResult.success) {
          await interaction.reply({ content: `❌ ${trainResult.message}`, ephemeral: true });
          return;
        }
        
        const trainLevelUp = pet.addXP(0); // Check if level up occurred from train XP
        savePet(pet);
        
        const trainEmbed = new EmbedBuilder()
          .setColor(0x9b59b6)
          .setTitle('💪 Training Session!')
          .setDescription(trainResult.message + (trainLevelUp ? '\n🎉 **Level Up!** Your pet grew stronger!' : ''))
          .addFields(
            { name: '📈 Stat Gain', value: Object.entries(trainResult.statGain).map(([stat, value]) => `**${stat}:** +${value}`).join('\n'), inline: true },
            { name: '📊 Current Stats', value: `**Attack:** ${pet.stats.attack}\n**Defense:** ${pet.stats.defense}\n**Speed:** ${pet.stats.speed}\n**Intelligence:** ${pet.stats.intelligence}`, inline: true },
            { name: '❤️ Care Stats', value: `**Happiness:** ${pet.happiness}/100\n**Energy:** ${pet.energy}/100\n**Level:** ${pet.level}`, inline: true }
          )
          .setTimestamp();
          
        await interaction.reply({ embeds: [trainEmbed] });
        break;
        
      case 'care':
        const careEmbed = new EmbedBuilder()
          .setColor(0xe91e63)
          .setTitle('❤️ Pet Care Guide')
          .setDescription(`Taking care of **${pet.name}** is important for their growth and happiness!`)
          .addFields(
            { name: '🍖 Feeding', value: '• Feed every 1+ hours\n• Different foods have different effects\n• Premium food provides better benefits\n• Treats boost happiness significantly', inline: false },
            { name: '🎾 Playing', value: '• Play every 2+ hours\n• Increases happiness and bonding\n• Costs energy but gives XP\n• Tired pets need rest first', inline: false },
            { name: '💪 Training', value: '• Train every 3+ hours\n• Improves specific stats\n• Requires energy and reduces happiness slightly\n• Essential for battle preparation', inline: false },
            { name: '📈 Growth Tips', value: '• Regular care leads to faster growth\n• Happy pets gain XP bonuses\n• Well-fed pets stay healthier\n• Balanced care is key to success', inline: false },
            { name: '🔄 Evolution', value: '• Pets evolve at certain levels\n• Each evolution unlocks new abilities\n• Evolution also improves base stats\n• Some evolutions have special requirements', inline: false }
          )
          .setFooter({ text: 'Consistent care leads to a strong and happy pet!' })
          .setTimestamp();
          
        await interaction.reply({ embeds: [careEmbed], ephemeral: true });
        break;
    }
  }
};