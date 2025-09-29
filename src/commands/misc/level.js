const fs = require('fs');
const path = require('path');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../../data/levels.json');
function getLevels() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return {};
  }
}

module.exports = {
  name: 'level',
  description: 'Check your level and XP',
  options: [
    {
      name: 'user',
      description: 'User to check',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  callback: async (client, interaction) => {
    try {
      const user = interaction.options.getUser('user') || interaction.user;
      const guildId = interaction.guild.id;
      const levels = getLevels();

      const data = levels[guildId]?.[user.id];
      if (!data) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff3366)
              .setTitle('Level Info')
              .setDescription(`${user} has no level data yet.`)
              .setThumbnail(user.displayAvatarURL())
          ]
        });
        return;
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff99)
            .setTitle('Level Info')
            .setDescription(`${user} is level **${data.level}** with **${data.xp} XP**.`)
            .setThumbnail(user.displayAvatarURL())
        ]
      });
    } catch (error) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle('Error')
              .setDescription(`Error: ${error.message}`)
          ]
        });
      }
    }
  },
};