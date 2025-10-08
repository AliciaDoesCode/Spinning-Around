const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');
const { EmbedBuilder } = require('discord.js');
const handleSelfRoles = require('./handleSelfRoles');
const handlePetAdoption = require('./handlePetAdoption');
const handleBattles = require('./handleBattles');

module.exports = async (client, interaction) => {
  console.log(`🔄 Interaction received: ${interaction.type} - ${interaction.isChatInputCommand() ? interaction.commandName : interaction.isButton() ? interaction.customId : 'other'}`);
  
  // Handle button interactions first
  if (interaction.isButton()) {
    if (interaction.customId === 'verify_user') {
      await handleVerification(interaction);
      return;
    }
    
    // Handle self-role buttons
    await handleSelfRoles(interaction);
    
    // Handle pet adoption buttons
    await handlePetAdoption(interaction);
    
    // Handle battle buttons
    await handleBattles(interaction);
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