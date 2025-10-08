const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

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
    label: 'Female',
    description: 'Identifies as a female',
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

module.exports = {
  name: 'selfrole',
  description: 'Set up the pronoun and gender role system',
  options: [],
  permissionsRequired: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  callback: async (client, interaction) => {
    const pronounRoles = Object.entries(SELF_ROLES).filter(([key, role]) => role.category === 'pronouns');
    const genderRoles = Object.entries(SELF_ROLES).filter(([key, role]) => role.category === 'gender');

    const pronounEmbed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🗣️ Pronoun Roles')
      .setDescription('Click the buttons below to add your preferred pronouns!')
      .setFooter({ text: 'Click a button to toggle a pronoun role on/off • You can select multiple!' })
      .setTimestamp();

    const pronounList = pronounRoles.map(([key, role]) => `${role.emoji} **${role.label}**`).join('\n');
    pronounEmbed.addFields({
      name: 'Available Pronouns',
      value: pronounList,
      inline: false
    });

    const genderEmbed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle('🏳️‍🌈 Gender Identity Roles')
      .setDescription('Click the buttons below to add your gender identity!')
      .setFooter({ text: 'Click a button to toggle a gender role on/off • You can select multiple!' })
      .setTimestamp();

    const genderList = genderRoles.map(([key, role]) => `${role.emoji} **${role.label}**`).join('\n');
    genderEmbed.addFields({
      name: 'Available Identities',
      value: genderList,
      inline: false
    });

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
            .setEmoji(roleData.emoji)
            .setStyle(ButtonStyle.Secondary)
        );
      }
      pronounRows.push(row);
    }

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
            .setEmoji(roleData.emoji)
            .setStyle(ButtonStyle.Secondary)
        );
      }
      genderRows.push(row);
    }

    await interaction.channel.send({ embeds: [pronounEmbed], components: pronounRows });
    await interaction.channel.send({ embeds: [genderEmbed], components: genderRows });
    
    await interaction.reply({ 
      content: '✅ Pronoun and gender role systems have been set up!', 
      ephemeral: true 
    });
  }
};