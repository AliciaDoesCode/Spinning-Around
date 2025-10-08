const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserPet, savePet, PET_SPECIES, getUserData, saveUserData } = require('../../utils/petSystem');

// Battle system utilities
class Battle {
  constructor(challenger, opponent) {
    this.challenger = challenger;
    this.opponent = opponent;
    this.turn = 1;
    this.battleLog = [];
    this.isActive = true;
    
    // Create battle copies with current HP
    this.challengerBattle = { ...challenger, currentHP: challenger.stats.hp };
    this.opponentBattle = { ...opponent, currentHP: opponent.stats.hp };
  }
  
  calculateDamage(attacker, defender, moveType = 'normal') {
    let baseDamage = attacker.stats.attack;
    const defense = defender.stats.defense;
    
    // Move type modifiers
    switch (moveType) {
      case 'strong':
        baseDamage *= 1.5;
        break;
      case 'precise':
        baseDamage *= 1.2;
        break;
      case 'normal':
      default:
        break;
    }
    
    // Add some randomness (80-120% of calculated damage)
    const variance = 0.2;
    const multiplier = 1 + (Math.random() - 0.5) * 2 * variance;
    
    const damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * multiplier));
    return damage;
  }
  
  executeTurn(attackerSide, moveType) {
    const attacker = attackerSide === 'challenger' ? this.challengerBattle : this.opponentBattle;
    const defender = attackerSide === 'challenger' ? this.opponentBattle : this.challengerBattle;
    
    const damage = this.calculateDamage(attacker, defender, moveType);
    defender.currentHP = Math.max(0, defender.currentHP - damage);
    
    const moveNames = {
      normal: 'Standard Attack',
      strong: 'Power Strike',
      precise: 'Precise Strike'
    };
    
    this.battleLog.push(`**${attacker.name}** used ${moveNames[moveType]} and dealt **${damage}** damage to **${defender.name}**!`);
    
    if (defender.currentHP <= 0) {
      this.battleLog.push(`**${defender.name}** was defeated! **${attacker.name}** wins!`);
      this.isActive = false;
      return attackerSide; // Return winner
    }
    
    this.turn++;
    return null; // Battle continues
  }
  
  getBattleEmbed() {
    const embed = new EmbedBuilder()
      .setColor(this.isActive ? 0xe74c3c : 0x27ae60)
      .setTitle(this.isActive ? '⚔️ Pet Battle in Progress!' : '🏆 Battle Complete!')
      .addFields(
        { 
          name: `${PET_SPECIES[this.challenger.species].emoji} ${this.challengerBattle.name}`, 
          value: `**HP:** ${this.challengerBattle.currentHP}/${this.challenger.stats.maxHp}\n**Level:** ${this.challenger.level}`, 
          inline: true 
        },
        { name: '🆚', value: 'VS', inline: true },
        { 
          name: `${PET_SPECIES[this.opponent.species].emoji} ${this.opponentBattle.name}`, 
          value: `**HP:** ${this.opponentBattle.currentHP}/${this.opponent.stats.maxHp}\n**Level:** ${this.opponent.level}`, 
          inline: true 
        }
      )
      .addFields(
        { name: '📜 Battle Log', value: this.battleLog.slice(-3).join('\n') || 'Battle is starting...', inline: false }
      )
      .setFooter({ text: `Turn ${this.turn}` })
      .setTimestamp();
      
    return embed;
  }
}

// Store active battles
const activeBattles = new Map();

module.exports = {
  name: 'battle',
  description: 'Battle with other players\' pets!',
  options: [
    {
      name: 'action',
      description: 'Battle action',
      type: 3, // STRING
      required: true,
      choices: [
        { name: 'Challenge Player', value: 'challenge' },
        { name: 'View Rankings', value: 'rankings' },
        { name: 'Battle Stats', value: 'stats' }
      ]
    },
    {
      name: 'target',
      description: 'Player to challenge (for challenge action)',
      type: 6, // USER
      required: false
    }
  ],

  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    const action = interaction.options.getString('action');
    const target = interaction.options.getUser('target');
    
    // Get user's pet
    const pet = getUserPet(userId);
    if (!pet) {
      await interaction.reply({ content: 'You need a pet to battle! Use `/adopt` to get one.', ephemeral: true });
      return;
    }
    
    switch (action) {
      case 'challenge':
        if (!target || target.id === userId) {
          await interaction.reply({ content: '❌ Please mention a valid user to challenge!', ephemeral: true });
          return;
        }
        
        if (target.bot) {
          await interaction.reply({ content: '❌ You can\'t challenge bots to pet battles!', ephemeral: true });
          return;
        }
        
        const opponentPet = getUserPet(target.id);
        if (!opponentPet) {
          await interaction.reply({ content: `❌ ${target.username} doesn't have a pet to battle with!`, ephemeral: true });
          return;
        }
        
        // Check if pets are ready to battle (not too tired/unhappy)
        if (pet.energy < 30 || pet.happiness < 30) {
          await interaction.reply({ content: '❌ Your pet is too tired or unhappy to battle! Take care of them first.', ephemeral: true });
          return;
        }
        
        if (opponentPet.energy < 30 || opponentPet.happiness < 30) {
          await interaction.reply({ content: `❌ ${target.username}'s pet is too tired or unhappy to battle!`, ephemeral: true });
          return;
        }
        
        // Create battle challenge
        const challengeEmbed = new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle('⚔️ Battle Challenge!')
          .setDescription(`${interaction.user.username}'s **${pet.name}** wants to battle ${target.username}'s **${opponentPet.name}**!`)
          .addFields(
            { 
              name: `${PET_SPECIES[pet.species].emoji} ${pet.name} (Lv.${pet.level})`, 
              value: `**HP:** ${pet.stats.hp}\n**Attack:** ${pet.stats.attack}\n**Defense:** ${pet.stats.defense}\n**Speed:** ${pet.stats.speed}`, 
              inline: true 
            },
            { name: '🆚', value: 'VS', inline: true },
            { 
              name: `${PET_SPECIES[opponentPet.species].emoji} ${opponentPet.name} (Lv.${opponentPet.level})`, 
              value: `**HP:** ${opponentPet.stats.hp}\n**Attack:** ${opponentPet.stats.attack}\n**Defense:** ${opponentPet.stats.defense}\n**Speed:** ${opponentPet.stats.speed}`, 
              inline: true 
            }
          )
          .setFooter({ text: `${target.username}, click Accept to start the battle!` })
          .setTimestamp();
          
        const challengeRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`battle_accept_${userId}_${target.id}`)
              .setLabel('Accept Battle')
              .setEmoji('⚔️')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`battle_decline_${userId}_${target.id}`)
              .setLabel('Decline')
              .setEmoji('❌')
              .setStyle(ButtonStyle.Danger)
          );
          
        await interaction.reply({ embeds: [challengeEmbed], components: [challengeRow] });
        break;
        
      case 'rankings':
        const userData = getUserData();
        const rankings = [];
        
        for (const [userId, user] in Object.entries(userData)) {
          if (user.activePet) {
            const userPet = getUserPet(userId);
            if (userPet) {
              rankings.push({
                userId,
                pet: userPet,
                rating: userPet.battleRating,
                wins: userPet.wins,
                losses: userPet.losses
              });
            }
          }
        }
        
        rankings.sort((a, b) => b.rating - a.rating);
        const top10 = rankings.slice(0, 10);
        
        const rankingsEmbed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle('🏆 Pet Battle Rankings')
          .setDescription('Top pet battlers by rating!')
          .setTimestamp();
          
        if (top10.length > 0) {
          const rankingText = top10.map((entry, index) => {
            const user = client.users.cache.get(entry.userId);
            const username = user ? user.username : 'Unknown';
            const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
            return `${medal} **${entry.pet.name}** (${username})\n Rating: ${entry.rating} | W: ${entry.wins} L: ${entry.losses}`;
          }).join('\n\n');
          
          rankingsEmbed.addFields({ name: 'Rankings', value: rankingText, inline: false });
        } else {
          rankingsEmbed.addFields({ name: 'Rankings', value: 'No battles recorded yet! Be the first to start battling!', inline: false });
        }
        
        await interaction.reply({ embeds: [rankingsEmbed] });
        break;
        
      case 'stats':
        const winRate = pet.wins + pet.losses > 0 ? ((pet.wins / (pet.wins + pet.losses)) * 100).toFixed(1) : 0;
        
        const statsEmbed = new EmbedBuilder()
          .setColor(0x9b59b6)
          .setTitle(`📊 ${pet.name}'s Battle Stats`)
          .addFields(
            { name: '🏆 Battle Record', value: `**Wins:** ${pet.wins}\n**Losses:** ${pet.losses}\n**Win Rate:** ${winRate}%`, inline: true },
            { name: '⭐ Rating', value: `**Current Rating:** ${pet.battleRating}\n**Rank:** Coming soon!`, inline: true },
            { name: '⚔️ Combat Stats', value: `**Attack:** ${pet.stats.attack}\n**Defense:** ${pet.stats.defense}\n**Speed:** ${pet.stats.speed}\n**HP:** ${pet.stats.maxHp}`, inline: true }
          )
          .setFooter({ text: 'Keep battling to improve your stats and rating!' })
          .setTimestamp();
          
        await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
        break;
    }
  }
};