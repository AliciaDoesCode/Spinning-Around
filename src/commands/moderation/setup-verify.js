const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

// Store verification messages by guild ID
const verificationMessages = new Map();

module.exports = {
  name: 'setup-verify',
  description: 'Setup the verification system (Admin only)',
  testOnly: false,

  callback: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '❌ You need Administrator permissions to use this command!', 
        ephemeral: true 
      });
    }

    // Create verification embed
    const embed = new EmbedBuilder()
      .setTitle('Welcome to Spinning Around')
      .setDescription('**Welcome to our community!**\n\n' +
        'To get started and access all channels, please click the **Verify** button below.\n\n' +
        'This will give you access to all server features.')
      .setColor('#5865f2') 
      .setThumbnail(interaction.guild.iconURL()) 
      .setFooter({ 
        text: 'Welcome to the server', 
        iconURL: interaction.guild.iconURL() 
      })
      .setTimestamp();

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_user')
          .setLabel('Verify')
          .setStyle(ButtonStyle.Success)
      );

    try {
      // Check if there's an existing verification message for this guild
      const existingMessageId = verificationMessages.get(interaction.guild.id);
      let verificationMessage;

      if (existingMessageId) {
        try {
          // Try to fetch and update the existing message
          const existingMessage = await interaction.channel.messages.fetch(existingMessageId);
          await existingMessage.edit({ 
            embeds: [embed], 
            components: [button] 
          });
          verificationMessage = existingMessage;
          
          await interaction.reply({ 
            content: '✅ Verification message has been updated!', 
            ephemeral: true 
          });
        } catch (fetchError) {
          // If message doesn't exist anymore, create a new one
          console.log('Previous verification message not found, creating new one...');
          await interaction.reply({ 
            content: '✅ Creating new verification message...', 
            ephemeral: true 
          });
          
          verificationMessage = await interaction.followUp({ 
            embeds: [embed], 
            components: [button],
            fetchReply: true
          });
          
          // Store the new message ID
          verificationMessages.set(interaction.guild.id, verificationMessage.id);
        }
      } else {
        // No existing message, create a new one
        await interaction.reply({ 
          content: '✅ Verification system has been set up!', 
          ephemeral: true 
        });

        verificationMessage = await interaction.followUp({ 
          embeds: [embed], 
          components: [button],
          fetchReply: true
        });
        
        // Store the message ID for future updates
        verificationMessages.set(interaction.guild.id, verificationMessage.id);
      }

      const filter = i => i.customId === 'verify_user';
      const collector = verificationMessage.createMessageComponentCollector({ filter });

      collector.on('collect', async (buttonInteraction) => {
        await handleVerification(buttonInteraction);
      });

      console.log('✅ Verification system setup complete!');

    } catch (error) {
      console.error('Setup verification error:', error);
      await interaction.editReply({ 
        content: '❌ There was an error setting up the verification system.', 
        ephemeral: true 
      });
    }
  },
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
          content: '❌ Could not find or create the "Members" role. Please contact an administrator!',
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