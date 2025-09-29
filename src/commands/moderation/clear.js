const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Clear messages in the current channel',
  options: [
    {
      name: 'amount',
      description: 'Number of messages to delete (max 100)',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  callback: async (client, interaction) => {
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) {
      await interaction.reply({ content: 'You can only delete between 1 and 100 messages.', ephemeral: true });
      return;
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `🧹 Deleted ${deleted.size} messages!`, ephemeral: true });

      const logChannel = interaction.guild.channels.cache.get('1422147873675542538');
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor(0xffcc00)
          .setTitle('🧹 Messages Cleared')
          .addFields(
            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: 'Channel', value: `${interaction.channel}`, inline: true },
            { name: 'Amount', value: `${deleted.size}`, inline: true }
          )
          .setTimestamp();
        logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
    }
  },
};