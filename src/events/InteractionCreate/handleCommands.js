const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');
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

module.exports = async (client, interaction) => {
  console.log(`🔄 Interaction received: ${interaction.type} - ${interaction.isChatInputCommand() ? interaction.commandName : interaction.isButton() ? interaction.customId : 'other'}`);
  
  // Handle button interactions first
  if (interaction.isButton()) {
    if (interaction.customId === 'verify_user') {
      await handleVerification(interaction);
      return;
    }
    
    // Handle self-role buttons
    if (interaction.customId.startsWith('selfrole_')) {
      await handleSelfRoleButton(client, interaction);
      return;
    }
    
    // If it's another type of button, don't handle it here
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) {
      await interaction.reply({ content: "Command not found.", ephemeral: true });
      return;
    }

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        await interaction.reply({
          content: 'Only developers are allowed to run this command.',
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!(interaction.guild.id === testServer)) {
        await interaction.reply({
          content: 'This command cannot be ran here.',
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          await interaction.reply({
            content: 'Not enough permissions.',
            ephemeral: true,
          });
          return;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;

        if (!bot.permissions.has(permission)) {
          await interaction.reply({
            content: "I don't have enough permissions.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
    }
  }
};

async function handleVerification(interaction) {
  const member = interaction.member;
  const guild = interaction.guild;

  try {
    let membersRole = guild.roles.cache.find(role => 
      role.name.toLowerCase() === 'members' || 
      role.name.toLowerCase() === 'member'
    );
    
    if (!membersRole) {
      try {
        membersRole = await guild.roles.create({
          name: 'Members',
          color: '#00ff99',
          reason: 'Verification system - Members role created automatically'
        });
        console.log('Created Members role automatically');
      } catch (roleError) {
        console.error('Failed to create Members role:', roleError);
        return interaction.reply({
          content: 'Could not find or create the "Members" role. Please contact an administrator!',
          ephemeral: true
        });
      }
    }

    if (member.roles.cache.has(membersRole.id)) {
      return interaction.reply({
        content: 'You are already verified and have access to all channels.',
        ephemeral: true
      });
    }

    await member.roles.add(membersRole);

    const successEmbed = new EmbedBuilder()
      .setTitle('Verification Successful')
      .setDescription(`**Welcome ${member.user.displayName}!**\n\n` +
        `You have been successfully verified and given the **${membersRole.name}** role.\n\n` +
        'You now have access to:\n' +
        '• All text channels\n' +
        '• Voice channels\n' +
        '• Bot commands\n' +
        '• Server events\n\n' +
        'Enjoy your time in the server!')
      .setColor('#00ff99')
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: 'Welcome to the server', iconURL: guild.iconURL() })
      .setTimestamp();

    await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true
    });

    console.log(`${member.user.tag} has been verified and given the Members role`);

  } catch (error) {
    console.error('Verification error:', error);
    await interaction.reply({
      content: 'There was an error during verification. Please try again or contact an administrator.',
      ephemeral: true
    });
  }
}

// Track processed interactions to prevent duplicates
const processedInteractions = new Set();

async function handleSelfRoleButton(client, interaction) {
  // Prevent double processing using interaction ID
  if (processedInteractions.has(interaction.id)) {
    console.log(`⚠️ Interaction ${interaction.id} already processed, skipping`);
    return;
  }
  
  // Prevent double processing
  if (interaction.replied || interaction.deferred) {
    console.log('⚠️ Selfrole interaction already processed, skipping');
    return;
  }
  
  // Mark this interaction as being processed
  processedInteractions.add(interaction.id);
  
  // Immediately defer the interaction to prevent timeout
  await interaction.deferReply({ ephemeral: true });
  
  const roleKey = interaction.customId.replace('selfrole_', '');
  const roleConfig = SELF_ROLES[roleKey];
  
  console.log(`🔍 Selfrole button clicked: ${roleKey}`);
  console.log(`🔍 Role config found: ${roleConfig ? 'YES' : 'NO'}`);
  
  if (!roleConfig) {
    console.log(`❌ Invalid role key: ${roleKey}`);
    await interaction.editReply({
      content: '❌ Invalid role selection!'
    });
    return;
  }

  try {
    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleConfig.id);
    
    console.log(`🔍 Looking for role ID: ${roleConfig.id}`);
    console.log(`🔍 Role exists in server: ${role ? 'YES' : 'NO'}`);
    if (role) {
      console.log(`🔍 Role name: ${role.name}`);
    }
    
    if (!role) {
      console.log(`❌ Role ${roleConfig.label} (${roleConfig.id}) not found in server`);
      await interaction.editReply({
        content: `❌ The ${roleConfig.label} role doesn't exist! Please contact an admin to create it or run \`/check-roles\`.`
      });
      return;
    }
    
    // Fetch fresh member data to ensure role cache is up to date
    await member.fetch();
    const hasRole = member.roles.cache.has(roleConfig.id);
    
    console.log(`🔍 User ${member.user.username} has role: ${hasRole ? 'YES' : 'NO'}`);
    console.log(`🔍 User roles: ${member.roles.cache.map(r => r.name).join(', ')}`);
    
    if (hasRole) {
      console.log(`🚫 Removing role ${roleConfig.label} from ${member.user.username}`);
      
      try {
        await member.roles.remove(role);
        console.log(`✅ Role ${roleConfig.label} successfully removed from ${member.user.username}`);
        
        // Refresh member cache after role removal
        await member.fetch();
        console.log(`🔍 After removal - User roles: ${member.roles.cache.map(r => r.name).join(', ')}`);
        console.log(`🔍 After removal - User has ${roleConfig.label}: ${member.roles.cache.has(roleConfig.id) ? 'YES' : 'NO'}`);
        
        const embed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('🚫 Role Removed')
          .setDescription(`You no longer have the **${roleConfig.emoji} ${roleConfig.label}** ${roleConfig.category === 'pronouns' ? 'pronouns' : 'identity'}!`)
          .setTimestamp();
        
        await interaction.editReply({
          embeds: [embed]
        });
        console.log(`✅ Sent removal confirmation to ${member.user.username}`);
      } catch (roleError) {
        console.error(`❌ Failed to remove role ${roleConfig.label}:`, roleError);
        await interaction.editReply({
          content: `❌ Failed to remove the ${roleConfig.label} role. Please try again.`
        });
        return;
      }
      
    } else {
      console.log(`✅ Adding role ${roleConfig.label} to ${member.user.username}`);
      
      try {
        await member.roles.add(role);
        console.log(`✅ Role ${roleConfig.label} successfully added to ${member.user.username}`);
        
        // Refresh member cache after role addition
        await member.fetch();
        console.log(`🔍 After addition - User roles: ${member.roles.cache.map(r => r.name).join(', ')}`);
        console.log(`🔍 After addition - User has ${roleConfig.label}: ${member.roles.cache.has(roleConfig.id) ? 'YES' : 'NO'}`);
        
        const embed = new EmbedBuilder()
          .setColor(0x51cf66)
          .setTitle('✅ Role Added')
          .setDescription(`You now have the **${roleConfig.emoji} ${roleConfig.label}** ${roleConfig.category === 'pronouns' ? 'pronouns' : 'identity'}!`)
          .setTimestamp();
        
        await interaction.editReply({
          embeds: [embed]
        });
        console.log(`✅ Sent addition confirmation to ${member.user.username}`);
      } catch (roleError) {
        console.error(`❌ Failed to add role ${roleConfig.label}:`, roleError);
        await interaction.editReply({
          content: `❌ Failed to add the ${roleConfig.label} role. Please try again.`
        });
        return;
      }
    }
    
  } catch (error) {
    console.error('Error handling self-role:', error);
    
    try {
      await interaction.editReply({
        content: '❌ There was an error processing your role request. Please try again or contact an admin.'
      });
    } catch (editError) {
      console.error('Failed to send error message:', editError);
    }
  }
}