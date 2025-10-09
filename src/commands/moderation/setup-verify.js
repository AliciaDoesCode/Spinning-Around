const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const verificationMessages = new Map();

module.exports = {
  name: 'setup-verify',
  description: 'Setup the verification system (Admin only)',
  testOnly: false,
  options: [
    {
      name: 'force-new',
      description: 'Force create a new verification message',
      type: 5, 
      required: false,
    },
  ],

  callback: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '❌ You need Administrator permissions to use this command!', 
        ephemeral: true 
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Welcome to Spinning Around')
      .setDescription('To get started and access all channels, please click the **Verify** button below.\n\n' +
        'This will give you access to all server features.')
      .setColor('#5865f2') 
      .setThumbnail(interaction.guild.iconURL())
      .setImage('https://media.giphy.com/media/Cmr1OMJ2FN0B2/giphy.gif')
      .setFooter({ 
        text: 'Welcome to the server', 
        iconURL: interaction.guild.iconURL() 
      });

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_user')
          .setLabel('Verify')
          .setStyle(ButtonStyle.Success)
      );

    try {
      const existingMessageId = verificationMessages.get(interaction.guild.id);
      
      if (existingMessageId) {
        try {
          await interaction.channel.messages.fetch(existingMessageId);
          return interaction.reply({ 
            content: 'Verification system is already set up in this server!', 
            ephemeral: true 
          });
        } catch (fetchError) {
          console.log('Previous verification message not found, creating new one...');
        }
      }

      const verificationMessage = await interaction.channel.send({ 
        embeds: [embed], 
        components: [button]
      });

      await interaction.reply({ 
        content: 'Verification system setup complete!', 
        ephemeral: true 
      });

      verificationMessages.set(interaction.guild.id, verificationMessage.id);

      console.log('Verification system setup complete!');

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