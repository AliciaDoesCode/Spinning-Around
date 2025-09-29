const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

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

    // Create cute verification embed
    const embed = new EmbedBuilder()
      .setTitle('✨ Welcome to Our Amazing Server! ✨')
      .setDescription('🌟 **Hey there, new friend!** 🌟\n\n' +
        '💫 We\'re so excited to have you join our community! To get started and access all the awesome channels, please click the **Verify** button below.\n\n' +
        '🎭 Once verified, you\'ll receive the **Members** role and unlock:\n' +
        '• 💬 All chat channels\n' +
        '• 🎵 Music commands and profiles\n' +
        '• 🎮 Fun activities and games\n' +
        '• 👥 Community events\n\n' +
        '🤗 Ready to join the fun? Click below!')
      .setColor('#ff69b4') 
      .setThumbnail(interaction.guild.iconURL())
      .setImage('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif') // Cute welcome gif
      .setFooter({ 
        text: '🌈 Welcome to the family! 💖', 
        iconURL: interaction.guild.iconURL() 
      })
      .setTimestamp();

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_user')
          .setLabel('✨ Verify Me! ✨')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎀')
      );

    try {
      await interaction.reply({ 
        content: '✅ Verification system has been set up!', 
        ephemeral: true 
      });

      const verificationMessage = await interaction.followUp({ 
        embeds: [embed], 
        components: [button],
        fetchReply: true
      });

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
    // Find the "Members" role (case insensitive)
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
        console.log('✅ Created Members role automatically');
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
        content: '🎉 You\'re already verified! Welcome to the community! 💖',
        ephemeral: true
      });
    }

    await member.roles.add(membersRole);

    const successEmbed = new EmbedBuilder()
      .setTitle('🎉 Verification Successful! 🎉')
      .setDescription(`✨ **Welcome ${member.user.displayName}!** ✨\n\n` +
        `🎀 You've been successfully verified and given the **${membersRole.name}** role!\n\n` +
        '🌟 You now have access to all server features:\n' +
        '• 💬 Chat in all channels\n' +
        '• 🎵 Use music commands\n' +
        '• 🎮 Join games and activities\n' +
        '• 👥 Participate in events\n\n' +
        '🤗 Enjoy your stay and have fun!')
      .setColor('#00ff99') // Success green
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: '💖 Happy to have you here!', iconURL: guild.iconURL() })
      .setTimestamp();

    await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true
    });

    console.log(`✅ ${member.user.tag} has been verified and given the Members role`);

  } catch (error) {
    console.error('Verification error:', error);
    await interaction.reply({
      content: '❌ There was an error during verification. Please try again or contact an administrator!',
      ephemeral: true
    });
  }
}