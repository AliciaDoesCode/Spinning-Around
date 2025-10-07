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
    const embed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle('🏳️‍🌈 Pronoun & Gender Identity Roles')
      .setDescription('Click the buttons below to add your pronouns and gender identity!\n\n**Available Options:**')
      .setFooter({ text: 'Click a button to toggle a role on/off • You can select multiple!' })
      .setTimestamp();

    // Separate pronoun and gender roles into different sections
    const pronounRoles = Object.entries(SELF_ROLES).filter(([key, role]) => role.category === 'pronouns');
    const genderRoles = Object.entries(SELF_ROLES).filter(([key, role]) => role.category === 'gender');

    // Add pronoun section
    embed.addFields({
      name: '🗣️ **Pronouns**',
      value: pronounRoles.map(([key, role]) => `${role.emoji} **${role.label}** - ${role.description}`).join('\n'),
      inline: false
    });

    // Add gender section
    embed.addFields({
      name: '⚧️ **Gender Identity**',
      value: genderRoles.map(([key, role]) => `${role.emoji} **${role.label}** - ${role.description}`).join('\n'),
      inline: false
    });

    // Create buttons - Discord allows max 5 buttons per row, 5 rows max
    const rows = [];
    const allRoleKeys = Object.keys(SELF_ROLES);
    
    for (let i = 0; i < allRoleKeys.length; i += 5) {
      const row = new ActionRowBuilder();
      const chunk = allRoleKeys.slice(i, i + 5);
      
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
      rows.push(row);
    }

    // Send as regular message, not reply
    await interaction.channel.send({ embeds: [embed], components: rows });
    
    // Acknowledge the command
    await interaction.reply({ 
      content: '✅ Pronoun and gender role system has been set up!', 
      ephemeral: true 
    });
  }
};