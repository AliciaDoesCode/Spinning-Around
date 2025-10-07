const { EmbedBuilder } = require('discord.js');

const SELF_ROLES = {
  'he_him': {
    id: '1425086780020887633', 
    emoji: '👱',
    label: 'He/Him',
    description: 'Uses he/him pronouns',
    category: 'pronouns'
  },
  'she_her': {
    id: '1425087029062144038', 
    emoji: '🧒',
    label: 'She/Her',
    description: 'Uses she/her pronouns',
    category: 'pronouns'
  },
  'they_them': {
    id: '1425087349041270946', 
    emoji: '👤',
    label: 'They/Them',
    description: 'Uses they/them pronouns',
    category: 'pronouns'
  },
  'any_pronouns': {
    id: '1425087420638167081', 
    emoji: '🌈',
    label: 'Any Pronouns',
    description: 'Comfortable with any pronouns',
    category: 'pronouns'
  },
  'ask_pronouns': {
    id: '1425087525315280957',
    emoji: '❓',
    label: 'Ask My Pronouns',
    description: 'Please ask for my pronouns',
    category: 'pronouns'
  },
  'male': {
    id: '1425088487060672574',
    emoji: '♂️',
    label: 'Male',
    description: 'Identifies as a male',
    category: 'gender'
  },
  'female': {
    id: '1425088504991584266', 
    emoji: '♀️',
    label: 'Woman',
    description: 'Identifies as a woman',
    category: 'gender'
  },
  'non_binary': {
    id: '1425088886702473296', 
    emoji: '💜',
    label: 'Non-Binary',
    description: 'Non-binary gender identity',
    category: 'gender'
  },
  'genderfluid': {
    id: '1425088969774731366', 
    emoji: '🌊',
    label: 'Genderfluid',
    description: 'Gender identity that varies',
    category: 'gender'
  },
  'agender': {
    id: '1425089150104899646',
    emoji: '⭕',
    label: 'Agender',
    description: 'Without gender identity',
    category: 'gender'
  },
  'trans_mtf': {
    id: '1425089292895518740',
    emoji: '💗',
    label: 'Transgender MTF',
    description: 'Transgender - Male to Female',
    category: 'gender'
  },
  'trans_ftm': {
    id: '1425089371899428914', 
    emoji: '💙',
    label: 'Transgender FTM',
    description: 'Transgender - Female to Male',
    category: 'gender'
  }
};

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  
  if (!interaction.customId.startsWith('selfrole_')) return;
  
  const roleKey = interaction.customId.replace('selfrole_', '');
  const roleConfig = SELF_ROLES[roleKey];
  
  if (!roleConfig) {
    await interaction.reply({
      content: '❌ Invalid role selection!',
      ephemeral: true
    });
    return;
  }
  
  try {
    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleConfig.id);
    
    if (!role) {
      await interaction.reply({
        content: `❌ The ${roleConfig.label} role doesn't exist! Please contact an admin.`,
        ephemeral: true
      });
      return;
    }
    
    const hasRole = member.roles.cache.has(roleConfig.id);
    
    if (hasRole) {
      await member.roles.remove(role);
      
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('🚫 Role Removed')
        .setDescription(`You no longer have the **${roleConfig.emoji} ${roleConfig.label}** ${roleConfig.category === 'pronouns' ? 'pronouns' : 'identity'}!`)
        .setTimestamp();
        
      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
      
    } else {
      await member.roles.add(role);
      
      const embed = new EmbedBuilder()
        .setColor(0x51cf66)
        .setTitle('✅ Role Added')
        .setDescription(`You now have the **${roleConfig.emoji} ${roleConfig.label}** ${roleConfig.category === 'pronouns' ? 'pronouns' : 'identity'}!`)
        .setTimestamp();
        
      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
    
  } catch (error) {
    console.error('Error handling self-role:', error);
    
    await interaction.reply({
      content: '❌ There was an error processing your role request. Please try again or contact an admin.',
      ephemeral: true
    });
  }
};