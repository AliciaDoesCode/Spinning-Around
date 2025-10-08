const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PET_SPECIES, adoptPet, getUserPet } = require('../../utils/petSystem');

module.exports = {
  name: 'adopt',
  description: 'Adopt your first virtual pet!',
  options: [
    {
      name: 'species',
      description: 'Choose a pet species',
      type: 3, // STRING
      required: false,
      choices: [
        { name: 'Dragon - Fierce and Noble', value: 'dragon' },
        { name: 'Phoenix - Mystical and Wise', value: 'phoenix' },
        { name: 'Unicorn - Pure and Magical', value: 'unicorn' },
        { name: 'Wolf - Loyal and Brave', value: 'wolf' },
        { name: 'Mystic Cat - Curious and Agile', value: 'cat' }
      ]
    },
    {
      name: 'name',
      description: 'Give your pet a custom name (optional)',
      type: 3, // STRING
      required: false
    }
  ],

  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    
    // Check if user already has a pet
    const existingPet = getUserPet(userId);
    if (existingPet) {
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('Pet Already Adopted')
        .setDescription(`You already have **${existingPet.name}** the ${PET_SPECIES[existingPet.species].name}!\n\nUse \`/pet status\` to check on them or \`/pet\` commands to take care of them.`)
        .setTimestamp();
        
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    
    const species = interaction.options.getString('species');
    const customName = interaction.options.getString('name');
    
    if (species) {
      // Direct adoption with specified species
      const result = adoptPet(userId, species, customName);
      
      if (!result.success) {
        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
        return;
      }
      
      const pet = result.pet;
      const speciesData = PET_SPECIES[species];
      const evolution = pet.getCurrentEvolution();
      
      const embed = new EmbedBuilder()
        .setColor(0x51cf66)
        .setTitle('Pet Adoption Successful!')
        .setDescription(`Congratulations! You've adopted **${pet.name}** the ${speciesData.name}!`)
        .addFields(
          { name: 'Name', value: pet.name, inline: true },
          { name: 'Species', value: `${speciesData.emoji} ${speciesData.name}`, inline: true },
          { name: 'Level', value: `${pet.level}`, inline: true },
          { name: 'Personality', value: pet.personality.join(', '), inline: true },
          { name: 'Evolution Stage', value: `${evolution.name}`, inline: true },
          { name: 'Starting Coins', value: '100', inline: true },
          { name: 'Base Stats', 
            value: `**HP:** ${pet.stats.hp}/${pet.stats.maxHp}\n**Attack:** ${pet.stats.attack}\n**Defense:** ${pet.stats.defense}\n**Speed:** ${pet.stats.speed}\n**Intelligence:** ${pet.stats.intelligence}`, 
            inline: false 
          },
          { name: 'Getting Started', 
            value: '• Use `/pet status` to check your pet\n• Use `/pet feed` to keep them happy\n• Use `/pet play` for fun and bonding\n• Use `/pet train` to improve their stats', 
            inline: false 
          }
        )
        .setFooter({ text: 'Welcome to the world of virtual pets! Take good care of your new companion.' })
        .setTimestamp();
        
      await interaction.reply({ embeds: [embed] });
      
    } else {
      // Show adoption selection menu
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('Pet Adoption Center')
        .setDescription('Welcome to the Virtual Pet Adoption Center! Choose a species to adopt your new companion.')
        .addFields(
          { 
            name: 'Dragon 🐲', 
            value: '**Traits:** Fierce, Noble, Protective\n**Growth:** Medium\n**Specialty:** High HP and Attack', 
            inline: true 
          },
          { 
            name: 'Phoenix 🔥', 
            value: '**Traits:** Mystical, Resilient, Wise\n**Growth:** Fast\n**Specialty:** Balanced stats, quick leveling', 
            inline: true 
          },
          { 
            name: 'Unicorn 🦄', 
            value: '**Traits:** Pure, Magical, Graceful\n**Growth:** Slow\n**Specialty:** High Intelligence and Defense', 
            inline: true 
          },
          { 
            name: 'Wolf 🐺', 
            value: '**Traits:** Loyal, Brave, Pack-minded\n**Growth:** Medium\n**Specialty:** High Speed and Attack', 
            inline: true 
          },
          { 
            name: 'Mystic Cat 🐱', 
            value: '**Traits:** Curious, Independent, Agile\n**Growth:** Fast\n**Specialty:** High Speed and Intelligence', 
            inline: true 
          },
          { 
            name: 'Choose Your Companion', 
            value: 'Each species has unique traits and growth patterns. Click a button below to adopt, or use `/adopt <species> [name]` for quick adoption!', 
            inline: false 
          }
        )
        .setFooter({ text: 'You can only have one active pet at a time' })
        .setTimestamp();
      
      // Create adoption buttons
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('adopt_dragon')
            .setLabel('Dragon')
            .setEmoji('🐲')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('adopt_phoenix')
            .setLabel('Phoenix')
            .setEmoji('🔥')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('adopt_unicorn')
            .setLabel('Unicorn')
            .setEmoji('🦄')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('adopt_wolf')
            .setLabel('Wolf')
            .setEmoji('🐺')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('adopt_cat')
            .setLabel('Cat')
            .setEmoji('🐱')
            .setStyle(ButtonStyle.Secondary)
        );
      
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  }
};