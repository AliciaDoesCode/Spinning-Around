const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'ticket',
  description: 'Open a support ticket',
  options: [],
  callback: async (client, interaction) => {
  
  const allowedUserId = '1388803859182522429';
    if (interaction.user.id !== allowedUserId) {
      await interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00c3ff)
      .setTitle('Support Ticket')
      .setDescription('Need help? Click the button below to open a support ticket!');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Open Ticket')
        .setStyle(ButtonStyle.Primary)
    );
    
    // Send as a regular message, not a reply
    await interaction.channel.send({ embeds: [embed], components: [row] });
    
    // Acknowledge the slash command without showing anything to the user
    await interaction.reply({ content: 'Ticket embed sent!', ephemeral: true });
  }
};
