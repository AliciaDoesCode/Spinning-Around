const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

// Configure pronouns and gender roles here
const SELF_ROLES = {
  // Pronoun roles
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
  // Gender identity roles
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
    id: '1425089150104899646', // Replace with actual role ID
    emoji: '⭕',
    label: 'Agender',
    description: 'Without gender identity',
    category: 'gender'
  },
  'trans_mtf': {
    id: '1425089292895518740', // Replace with actual role ID
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

module.exports = {
  name: 'selfrole',
  description: 'Set up the pronoun and gender role system',
  options: [],
  permissionsRequired: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  callback: async (client, interaction) => {
    // Separate pronoun and gender roles into different categories
    const pronounRoles = Object.entries(SELF_ROLES).filter(([key, role]) => role.category === 'pronouns');
    const genderRoles = Object.entries(SELF_ROLES).filter(([key, role]) => role.category === 'gender');

    // Create Pronoun Embed
    const pronounEmbed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🗣️ Pronoun Roles')
      .setDescription('Click the buttons below to add your preferred pronouns!\n\n**Available Pronouns:**')
      .setFooter({ text: 'Click a button to toggle a pronoun role on/off • You can select multiple!' })
      .setTimestamp();

    // Add pronoun fields
    pronounRoles.forEach(([key, role]) => {
      pronounEmbed.addFields({
        name: `${role.emoji} ${role.label}`,
        value: role.description,
        inline: true
      });
    });

    // Create Gender Identity Embed
    const genderEmbed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle('🏳️‍🌈 Gender Identity Roles')
      .setDescription('Click the buttons below to add your gender identity!\n\n**Available Identities:**')
      .setFooter({ text: 'Click a button to toggle a gender role on/off • You can select multiple!' })
      .setTimestamp();

    // Add gender fields
    genderRoles.forEach(([key, role]) => {
      genderEmbed.addFields({
        name: `${role.emoji} ${role.label}`,
        value: role.description,
        inline: true
      });
    });

    // Create buttons for pronouns
    const pronounRows = [];
    const pronounKeys = pronounRoles.map(([key]) => key);
    
    for (let i = 0; i < pronounKeys.length; i += 5) {
      const row = new ActionRowBuilder();
      const chunk = pronounKeys.slice(i, i + 5);
      
      for (const roleKey of chunk) {
        const roleData = SELF_ROLES[roleKey];
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`selfrole_${roleKey}`)
            .setLabel(roleData.label)
            .setEmoji(roleData.emoji)
            .setStyle(ButtonStyle.Secondary)
        );
      }
      pronounRows.push(row);
    }

    // Create buttons for gender identity
    const genderRows = [];
    const genderKeys = genderRoles.map(([key]) => key);
    
    for (let i = 0; i < genderKeys.length; i += 5) {
      const row = new ActionRowBuilder();
      const chunk = genderKeys.slice(i, i + 5);
      
      for (const roleKey of chunk) {
        const roleData = SELF_ROLES[roleKey];
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`selfrole_${roleKey}`)
            .setLabel(roleData.label)
            .setEmoji(roleData.emoji)
            .setStyle(ButtonStyle.Secondary)
        );
      }
      genderRows.push(row);
    }

    // Send both embeds as separate messages
    await interaction.channel.send({ embeds: [pronounEmbed], components: pronounRows });
    await interaction.channel.send({ embeds: [genderEmbed], components: genderRows });
    
    // Acknowledge the command
    await interaction.reply({ 
      content: '✅ Pronoun and gender role systems have been set up!', 
      ephemeral: true 
    });
  }
};