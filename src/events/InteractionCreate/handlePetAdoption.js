const { EmbedBuilder } = require('discord.js');
const { PET_SPECIES, adoptPet } = require('../../utils/petSystem');

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  
  // Check if this is an adoption button
  if (!interaction.customId.startsWith('adopt_')) return;
  
  const species = interaction.customId.replace('adopt_', '');
  const userId = interaction.user.id;
  
  if (!PET_SPECIES[species]) {
    await interaction.reply({
      content: '❌ Invalid pet species!',
      ephemeral: true
    });
    return;
  }
  
  // Attempt adoption
  const result = adoptPet(userId, species);
  
  if (!result.success) {
    await interaction.reply({ 
      content: `❌ ${result.message}`, 
      ephemeral: true 
    });
    return;
  }
  
  const pet = result.pet;
  const speciesData = PET_SPECIES[species];
  const evolution = pet.getCurrentEvolution();
  
  const embed = new EmbedBuilder()
    .setColor(0x51cf66)
    .setTitle('🎉 Pet Adoption Successful!')
    .setDescription(`Congratulations! You've adopted a **${speciesData.name}**!`)
    .addFields(
      { name: '📛 Name', value: pet.name, inline: true },
      { name: '🧬 Species', value: `${speciesData.emoji} ${speciesData.name}`, inline: true },
      { name: '⭐ Level', value: `${pet.level}`, inline: true },
      { name: '🎭 Personality', value: pet.personality, inline: true },
      { name: '🔄 Evolution Stage', value: `${evolution.emoji} ${evolution.name}`, inline: true },
      { name: '💰 Starting Coins', value: '100', inline: true },
      { name: '📊 Base Stats', 
        value: `**HP:** ${pet.stats.hp}/${pet.stats.maxHp}\n**Attack:** ${pet.stats.attack}\n**Defense:** ${pet.stats.defense}\n**Speed:** ${pet.stats.speed}\n**Intelligence:** ${pet.stats.intelligence}`, 
        inline: false 
      },
      { name: '💡 Getting Started', 
        value: '• Use `/pet` to check your pet\'s status\n• Use `/pet feed` to keep them happy\n• Use `/pet play` for fun and bonding\n• Use `/pet train` to improve their stats', 
        inline: false 
      }
    )
    .setFooter({ text: 'Welcome to the world of virtual pets! Take good care of your new companion.' })
    .setTimestamp();
    
  await interaction.reply({ embeds: [embed] });
};