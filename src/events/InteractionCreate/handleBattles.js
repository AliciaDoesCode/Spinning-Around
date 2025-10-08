const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserPet, savePet, PET_SPECIES, getUserData, saveUserData } = require('../../utils/petSystem');

// Import battle system from battle command
const activeBattles = new Map();

// Battle system utilities (copied from battle.js for handler use)
class Battle {
  constructor(challenger, opponent) {
    this.challenger = challenger;
    this.opponent = opponent;
    this.turn = 1;
    this.battleLog = [];
    this.isActive = true;
    
    // Create battle copies with current HP
    this.challengerBattle = { ...challenger, currentHP: challenger.stats.maxHp };
    this.opponentBattle = { ...opponent, currentHP: opponent.stats.maxHp };
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

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  
  const customId = interaction.customId;
  const userId = interaction.user.id;
  
  // Handle battle challenge responses
  if (customId.startsWith('battle_accept_') || customId.startsWith('battle_decline_')) {
    const [action, response, challengerId, opponentId] = customId.split('_');
    
    // Check if the user is the target of the challenge
    if (userId !== opponentId) {
      await interaction.reply({ content: '❌ This battle challenge is not for you!', ephemeral: true });
      return;
    }
    
    if (response === 'decline') {
      await interaction.update({ 
        content: '❌ Battle challenge declined.', 
        embeds: [], 
        components: [] 
      });
      return;
    }
    
    // Accept battle
    const challengerPet = getUserPet(challengerId);
    const opponentPet = getUserPet(opponentId);
    
    if (!challengerPet || !opponentPet) {
      await interaction.update({ 
        content: '❌ One of the pets is no longer available for battle.', 
        embeds: [], 
        components: [] 
      });
      return;
    }
    
    // Create new battle
    const battleId = `${challengerId}_${opponentId}_${Date.now()}`;
    const battle = new Battle(challengerPet, opponentPet);
    activeBattles.set(battleId, battle);
    
    // Determine turn order based on speed
    const challengerGoesFirst = challengerPet.stats.speed >= opponentPet.stats.speed;
    battle.currentTurn = challengerGoesFirst ? challengerId : opponentId;
    battle.challengerId = challengerId;
    battle.opponentId = opponentId;
    
    // Create battle action buttons
    const battleRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`battle_move_${battleId}_normal`)
          .setLabel('Standard Attack')
          .setEmoji('⚔️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`battle_move_${battleId}_strong`)
          .setLabel('Power Strike')
          .setEmoji('💥')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`battle_move_${battleId}_precise`)
          .setLabel('Precise Strike')
          .setEmoji('🎯')
          .setStyle(ButtonStyle.Success)
      );
      
    const embed = battle.getBattleEmbed();
    const currentPlayer = challengerGoesFirst ? 'Challenger' : 'Opponent';
    embed.addFields({ 
      name: '🎮 Current Turn', 
      value: `**${currentPlayer}** - Choose your move!`, 
      inline: false 
    });
    
    await interaction.update({ 
      content: '', 
      embeds: [embed], 
      components: [battleRow] 
    });
  }
  
  // Handle battle moves
  else if (customId.startsWith('battle_move_')) {
    const [action, moveType, battleId, moveChoice] = customId.split('_');
    const battle = activeBattles.get(battleId);
    
    if (!battle) {
      await interaction.reply({ content: '❌ This battle is no longer active.', ephemeral: true });
      return;
    }
    
    // Check if it's the user's turn
    if (userId !== battle.currentTurn) {
      await interaction.reply({ content: '❌ It\'s not your turn!', ephemeral: true });
      return;
    }
    
    // Execute the move
    const attackerSide = userId === battle.challengerId ? 'challenger' : 'opponent';
    const winner = battle.executeTurn(attackerSide, moveChoice);
    
    let embed = battle.getBattleEmbed();
    let components = [];
    
    if (winner) {
      // Battle ended - award XP and update stats
      const winnerPet = winner === 'challenger' ? battle.challenger : battle.opponent;
      const loserPet = winner === 'challenger' ? battle.opponent : battle.challenger;
      const winnerId = winner === 'challenger' ? battle.challengerId : battle.opponentId;
      const loserId = winner === 'challenger' ? battle.opponentId : battle.challengerId;
      
      // Update pet stats
      const winnerData = getUserPet(winnerId);
      const loserData = getUserPet(loserId);
      
      if (winnerData && loserData) {
        // Award XP and update battle record
        winnerData.xp += 50;
        winnerData.wins += 1;
        winnerData.battleRating += 25;
        winnerData.energy = Math.max(0, winnerData.energy - 20);
        
        loserData.xp += 10; // Small XP for participation
        loserData.losses += 1;
        loserData.battleRating = Math.max(1000, loserData.battleRating - 15);
        loserData.energy = Math.max(0, loserData.energy - 30);
        
        // Check for level up
        if (winnerData.xp >= winnerData.xpToNext) {
          winnerData.level++;
          winnerData.xp -= winnerData.xpToNext;
          winnerData.xpToNext = Math.floor(winnerData.xpToNext * 1.5);
          
          // Increase stats on level up
          winnerData.stats.attack += Math.floor(Math.random() * 3) + 1;
          winnerData.stats.defense += Math.floor(Math.random() * 3) + 1;
          winnerData.stats.speed += Math.floor(Math.random() * 2) + 1;
          winnerData.stats.maxHp += Math.floor(Math.random() * 5) + 3;
          winnerData.stats.hp = winnerData.stats.maxHp;
          
          embed.addFields({ 
            name: '🎉 Level Up!', 
            value: `**${winnerData.name}** reached level ${winnerData.level}!`, 
            inline: false 
          });
        }
        
        savePet(winnerId, winnerData);
        savePet(loserId, loserData);
      }
      
      // Clean up battle
      activeBattles.delete(battleId);
    } else {
      // Switch turns and continue battle
      battle.currentTurn = battle.currentTurn === battle.challengerId ? battle.opponentId : battle.challengerId;
      
      const battleRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`battle_move_${battleId}_normal`)
            .setLabel('Standard Attack')
            .setEmoji('⚔️')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`battle_move_${battleId}_strong`)
            .setLabel('Power Strike')
            .setEmoji('💥')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`battle_move_${battleId}_precise`)
            .setLabel('Precise Strike')
            .setEmoji('🎯')
            .setStyle(ButtonStyle.Success)
        );
        
      const currentPlayer = battle.currentTurn === battle.challengerId ? 'Challenger' : 'Opponent';
      embed.addFields({ 
        name: '🎮 Current Turn', 
        value: `**${currentPlayer}** - Choose your move!`, 
        inline: false 
      });
      
      components = [battleRow];
    }
    
    await interaction.update({ 
      embeds: [embed], 
      components: components 
    });
  }
};