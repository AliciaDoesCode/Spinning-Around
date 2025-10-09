const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserCollection, RARITY_CONFIG } = require('../../utils/artistSpawner');

module.exports = {
  name: 'artists',
  description: 'View your artist collection',
  options: [
    {
      name: 'user',
      description: 'View another user\'s collection',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'rarity',
      description: 'Filter by rarity',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: 'Common', value: 'common' },
        { name: 'Uncommon', value: 'uncommon' },
        { name: 'Rare', value: 'rare' },
        { name: 'Legendary', value: 'legendary' }
      ]
    }
  ],
  testOnly: false,

  callback: async (client, interaction) => {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const rarityFilter = interaction.options.getString('rarity');
      
      const collection = getUserCollection(targetUser.id);
      
      if (collection.totalCaught === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setTitle('Artist Collection')
          .setDescription(`${targetUser.id === interaction.user.id ? 'You haven\'t' : `**${targetUser.displayName}** hasn't`} caught any artists yet!\n\nArtists spawn randomly in the chat. Be the first to guess their name to catch them!`)
          .setColor('#e74c3c')
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: 'Stay alert for artist spawns!' })
          .setTimestamp();

        return interaction.reply({ embeds: [emptyEmbed] });
      }

      let filteredArtists = collection.artists;
      if (rarityFilter) {
        filteredArtists = collection.artists.filter(artist => artist.rarity === rarityFilter);
      }

      const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
      filteredArtists.sort((a, b) => {
        const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        if (rarityDiff !== 0) return rarityDiff;
        return new Date(b.caughtAt) - new Date(a.caughtAt);
      });

      const itemsPerPage = 8;
      const totalPages = Math.ceil(filteredArtists.length / itemsPerPage);
      let currentPage = 0;

      const generateEmbed = (page) => {
        const startIdx = page * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const pageArtists = filteredArtists.slice(startIdx, endIdx);

        const rarityCounts = {
          legendary: collection.artists.filter(a => a.rarity === 'legendary').length,
          rare: collection.artists.filter(a => a.rarity === 'rare').length,
          uncommon: collection.artists.filter(a => a.rarity === 'uncommon').length,
          common: collection.artists.filter(a => a.rarity === 'common').length
        };

        const embed = new EmbedBuilder()
          .setTitle(`${targetUser.displayName}'s Artist Collection`)
          .setColor('#9b59b6')
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
          .setTimestamp();


        let statsText = `**Total Artists:** ${collection.totalCaught}\n\n`;
        statsText += `**Legendary:** ${rarityCounts.legendary}\n`;
        statsText += `**Rare:** ${rarityCounts.rare}\n`;
        statsText += `**Uncommon:** ${rarityCounts.uncommon}\n`;
        statsText += `**Common:** ${rarityCounts.common}`;

        if (rarityFilter) {
          statsText += `\n\n**Showing:** ${rarityFilter.toUpperCase()} artists`;
        }

        embed.addFields({ name: 'Collection Stats', value: statsText, inline: false });

        if (pageArtists.length > 0) {
          let artistsList = '';
          pageArtists.forEach((artist, index) => {
            const globalIndex = startIdx + index + 1;
            const caughtDate = new Date(artist.caughtAt).toLocaleDateString();
            artistsList += `**${artist.name}** (${artist.rarity})\n`;
            artistsList += `   Caught: ${caughtDate}\n\n`;
          });

          embed.addFields({ 
            name: `Artists (${startIdx + 1}-${Math.min(endIdx, filteredArtists.length)} of ${filteredArtists.length})`, 
            value: artistsList,
            inline: false 
          });
        }

        if (totalPages > 1) {
          embed.setFooter({ 
            text: `Page ${page + 1} of ${totalPages} • ${filteredArtists.length} artists shown`, 
            iconURL: interaction.guild.iconURL() 
          });
        } else {
          embed.setFooter({ 
            text: `${filteredArtists.length} artists shown`, 
            iconURL: interaction.guild.iconURL() 
          });
        }

        return embed;
      };

      const generateButtons = (page) => {
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('Previous')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('⬅️')
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId('page_info')
              .setLabel(`${page + 1}/${totalPages}`)
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('➡️')
              .setDisabled(page === totalPages - 1)
          );
      };

      if (filteredArtists.length === 0 && rarityFilter) {
        const noFilterEmbed = new EmbedBuilder()
          .setTitle('Artist Collection')
          .setDescription(`${targetUser.displayName} doesn't have any **${rarityFilter.toUpperCase()}** artists yet!`)
          .setColor('#e74c3c')
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));

        return interaction.reply({ embeds: [noFilterEmbed] });
      }

      const embed = generateEmbed(currentPage);
      const buttons = totalPages > 1 ? [generateButtons(currentPage)] : [];

      const response = await interaction.reply({ 
        embeds: [embed], 
        components: buttons,
        fetchReply: true 
      });

      if (totalPages > 1) {
        const collector = response.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 300000
        });

        collector.on('collect', async (buttonInteraction) => {
          if (buttonInteraction.user.id !== interaction.user.id) {
            return buttonInteraction.reply({ 
              content: '❌ You cannot interact with this collection!', 
              ephemeral: true 
            });
          }

          if (buttonInteraction.customId === 'prev') {
            currentPage = Math.max(0, currentPage - 1);
          } else if (buttonInteraction.customId === 'next') {
            currentPage = Math.min(totalPages - 1, currentPage + 1);
          }

          const newEmbed = generateEmbed(currentPage);
          const newButtons = generateButtons(currentPage);

          await buttonInteraction.update({ 
            embeds: [newEmbed], 
            components: [newButtons] 
          });
        });

        collector.on('end', async () => {
          try {
            const disabledButtons = ActionRowBuilder.from(buttons[0]);
            disabledButtons.components.forEach(button => button.setDisabled(true));
            await response.edit({ components: [disabledButtons] });
          } catch (error) {

          }
        });
      }

    } catch (error) {
      console.error('Artists command error:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while loading the collection.', 
        ephemeral: true 
      });
    }
  },
};