const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const SELF_ROLES = {
  'he_him': '1425086780020887633',
  'she_her': '1425087029062144038',
  'they_them': '1425087349041270946',
  'any_pronouns': '1425087420638167081',
  'ask_pronouns': '1425087525315280957',
  'male': '1425088487060672574',
  'female': '1425088504991584266',
  'non_binary': '1425088886702473296',
  'genderfluid': '1425088969774731366',
  'agender': '1425089150104899646',
  'trans_mtf': '1425089292895518740',
  'trans_ftm': '1425089371899428914'
};

module.exports = {
  name: 'check-roles',
  description: 'Check if selfrole roles exist in the server',
  permissionsRequired: [PermissionFlagsBits.ManageRoles],
  
  callback: async (client, interaction) => {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setTitle('🔍 Selfrole Status Check')
      .setColor(0x3498db)
      .setTimestamp();

    let existingRoles = [];
    let missingRoles = [];

    for (const [key, roleId] of Object.entries(SELF_ROLES)) {
      const role = guild.roles.cache.get(roleId);
      if (role) {
        existingRoles.push(`✅ **${key}**: ${role.name} (ID: ${roleId})`);
      } else {
        missingRoles.push(`❌ **${key}**: Missing (ID: ${roleId})`);
      }
    }

    if (existingRoles.length > 0) {
      embed.addFields({
        name: '✅ Existing Roles',
        value: existingRoles.join('\n'),
        inline: false
      });
    }

    if (missingRoles.length > 0) {
      embed.addFields({
        name: '❌ Missing Roles',
        value: missingRoles.join('\n'),
        inline: false
      });
      
      embed.addFields({
        name: '🔧 How to Fix',
        value: '1. Create the missing roles manually in Discord\n2. Update the role IDs in the code to match your server roles',
        inline: false
      });
    }

    if (missingRoles.length === 0) {
      embed.setDescription('🎉 All selfrole roles exist! Buttons should work properly.');
      embed.setColor(0x00ff00);
    } else {
      embed.setDescription(`⚠️ ${missingRoles.length} roles are missing. This is why the buttons fail.`);
      embed.setColor(0xff6b6b);
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};