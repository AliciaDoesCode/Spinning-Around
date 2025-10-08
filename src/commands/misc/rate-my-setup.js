const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

// Collection of cheeky rating responses
const RATING_RESPONSES = [
  // High ratings (8-10/10)
  {
    rating: 10,
    responses: [
      "🔥 **ABSOLUTE FIRE!** This setup is so clean, I'm afraid to breathe near it! Your records probably sound better than the original masters.",
      "💎 **PRISTINE PERFECTION!** This is the kind of setup that makes audiophiles weep tears of joy. I can practically hear the warmth through the photo!",
      "🏆 **LEGENDARY STATUS!** Your setup just made my circuits tingle. If turntables could be art, this would be hanging in the Louvre.",
      "⭐ **COSMIC EXCELLENCE!** This setup is so good, it probably improves the sound quality of digital files just by being in the same room.",
      "🎖️ **HALL OF FAME WORTHY!** I'm not even sure this is legal. Did you steal this from Abbey Road Studios?"
    ]
  },
  {
    rating: 9,
    responses: [
      "🚀 **STELLAR SETUP!** One tiny tweak away from perfection, but honestly, I'm just nitpicking because I'm jealous.",
      "💫 **ALMOST GODLIKE!** This setup makes me want to quit my day job and become a full-time vinyl enthusiast.",
      "🎯 **INCREDIBLY SOLID!** Your neighbors must love you... or hate you. Depends on your music taste, really.",
      "🔊 **AUDIOPHILE APPROVED!** This is the kind of setup that makes people believe in the vinyl revival.",
      "🌟 **NEARLY PERFECT!** Just missing a small 'Do Not Touch' sign to keep mortals away from it."
    ]
  },
  {
    rating: 8,
    responses: [
      "🎵 **REALLY IMPRESSIVE!** Your setup has that 'I know what I'm doing' vibe that I deeply respect.",
      "👑 **ROYALTY VIBES!** This setup screams quality louder than a death metal album on full blast.",
      "🎪 **SHOWSTOPPER!** I bet your records never skip... they wouldn't dare disappoint this beauty.",
      "🏅 **VERY SOLID!** This is the kind of setup that makes people stay for 'just one more song' until 3 AM.",
      "⚡ **ELECTRIC ENERGY!** Your stylus is probably doing a happy dance across those grooves."
    ]
  },
  
  // Mid-high ratings (6-7/10)
  {
    rating: 7,
    responses: [
      "👍 **PRETTY SWEET!** Your setup has potential to make some serious magic happen. Keep tweaking!",
      "🎸 **ROCK SOLID!** Not fancy, but it gets the job done with style. Sometimes that's all you need!",
      "🎼 **RESPECTABLE VIBES!** This setup knows how to have a good time without breaking the bank.",
      "🎨 **ARTISTIC FLAIR!** I can tell you put thought into this. Your records are living their best life.",
      "🌈 **GOOD ENERGY!** This setup has character! It's like the friendly neighborhood turntable that everyone loves."
    ]
  },
  {
    rating: 6,
    responses: [
      "📻 **DECENT FOUNDATION!** You're on the right track! A few upgrades and this could be truly special.",
      "🎪 **CHARMING SETUP!** It's got personality! Sometimes character beats perfection anyway.",
      "🎯 **HONEST WORK!** This setup doesn't pretend to be something it's not, and I respect that authenticity.",
      "🎵 **SOLID START!** Rome wasn't built in a day, and neither are great audio setups. Keep building!",
      "🎶 **PLEASANT VIBES!** Your records are happy, and that's what really matters in the end."
    ]
  },
  
  // Mid ratings (4-5/10)
  {
    rating: 5,
    responses: [
      "🤔 **MIDDLE GROUND!** It's... functional! Sometimes that's a compliment, right? Right?",
      "📐 **PERFECTLY AVERAGE!** Congratulations, you've achieved the golden mean of turntable setups!",
      "🎲 **FLIP A COIN!** Could go either way, but hey, if the music sounds good to you, that's what counts!",
      "🌊 **RIDING THE WAVE!** Not making big waves, but definitely floating. Keep on keeping on!",
      "⚖️ **BALANCED APPROACH!** Right in the middle of 'meh' and 'nice.' The Switzerland of setups!"
    ]
  },
  {
    rating: 4,
    responses: [
      "😅 **BRAVE EFFORT!** Points for trying! Your records are... well, they're definitely spinning.",
      "🎪 **QUIRKY CHARM!** It's unique! And by unique, I mean... very unique. In its own special way.",
      "🎯 **CREATIVE INTERPRETATION!** You're definitely thinking outside the box. Way outside. Like, different dimension outside.",
      "🤷 **MYSTERIOUS VIBES!** I'm not sure what's happening here, but I'm intrigued by your confidence!",
      "🎨 **Abstract Art!** This setup challenges conventional definitions of 'audio equipment.' How avant-garde!"
    ]
  },
  
  // Low ratings (1-3/10)
  {
    rating: 3,
    responses: [
      "😬 **BOLD CHOICES!** I admire your courage in sharing this. That takes real confidence!",
      "🎪 **CIRCUS ENERGY!** This setup is so chaotic, it might just loop back around to being genius. Maybe?",
      "🤯 **MIND BENDING!** I'm genuinely confused, but in a way that makes me question reality itself.",
      "🎲 **GAMBLING VIBES!** Every time you drop the needle, it's a roll of the dice. I respect the thrill-seeking!",
      "🎨 **DADAIST APPROACH!** This setup rejects traditional notions of 'working properly.' How postmodern!"
    ]
  },
  {
    rating: 2,
    responses: [
      "😵 **SURVIVAL MODE!** Your records are living dangerously, but they're still alive! That's... something!",
      "🎪 **EXTREME SPORTS!** Listening to music on this setup is like bungee jumping for your ears.",
      "🤪 **CHAOTIC ENERGY!** I don't know how, but I bet this somehow still sounds better than streaming. Vinyl magic!",
      "🎯 **AGAINST ALL ODDS!** If music comes out of this, it's basically a miracle. I'm rooting for miracles!",
      "🌪️ **TORNADO AESTHETIC!** Looks like your setup survived a natural disaster. Did it? Please say yes."
    ]
  },
  {
    rating: 1,
    responses: [
      "💀 **ARCHAEOLOGICAL FIND!** Is this a turntable or the remains of one? Either way, it belongs in a museum!",
      "🚨 **EMERGENCY SITUATION!** I'm calling the vinyl police! This setup needs immediate medical attention!",
      "😱 **HORROR SHOW!** This isn't a setup, it's a cry for help! Blink twice if your records are holding you hostage!",
      "🎪 **PERFORMANCE ART!** This must be an intentional statement about the death of physical media. So deep!",
      "☠️ **DANGER ZONE!** Playing records on this setup is like extreme sports for vinyl. Thrilling but terrifying!"
    ]
  }
];

// Fun setup elements to comment on
const SETUP_ELEMENTS = [
  "That cable management though! 🔌",
  "Love the aesthetic vibes! ✨",
  "Those speakers are looking mighty fine! 🔊",
  "The lighting really sets the mood! 💡",
  "Clean desk = clean sound! 🧹",
  "That record collection is calling my name! 📀",
  "The whole vibe is *chef's kiss* 👨‍🍳💋",
  "Setup goals right here! 🎯",
  "This screams 'good taste in music'! 🎵",
  "The attention to detail is impressive! 🔍"
];

// Additional cheeky comments
const BONUS_COMMENTS = [
  "Pro tip: The more expensive it looks, the better it sounds! 💸",
  "I can practically smell the vinyl warmth through this photo! 🌡️",
  "Somewhere, an audiophile just shed a single tear. 🥲",
  "This setup has more personality than most people I know! 👤",
  "Your neighbors either love you or have invested in earplugs. 🏠",
  "I bet your Spotify account is gathering dust! 📱",
  "This is why aliens haven't made contact yet - they're too busy listening to our vinyl! 👽",
  "Someone's been reading the audiophile forums religiously! 📖",
  "Plot twist: The real treasure was the setups we rated along the way! 🗺️",
  "This setup is proof that money CAN buy happiness... sometimes! 💰"
];

module.exports = {
  name: 'rate-my-setup',
  description: 'Share a photo of your turntable/audio setup and get a cheeky rating!',
  options: [
    {
      name: 'photo',
      description: 'Upload a photo of your turntable/audio setup',
      type: 11, // ATTACHMENT
      required: true
    },
    {
      name: 'description',
      description: 'Optional: Tell us about your setup!',
      type: 3, // STRING
      required: false,
      max_length: 500
    }
  ],

  callback: async (client, interaction) => {
    try {
      const attachment = interaction.options.getAttachment('photo');
      const description = interaction.options.getString('description');

      // Validate attachment is an image
      if (!attachment || !attachment.contentType || !attachment.contentType.startsWith('image/')) {
        await interaction.reply({
          content: '❌ Please upload a valid image file of your turntable setup!',
          ephemeral: true
        });
        return;
      }

      // Generate random rating (weighted towards higher scores for engagement)
      const ratingWeights = [
        { min: 8, max: 10, weight: 30 },  // High ratings - 30% chance
        { min: 6, max: 7, weight: 35 },   // Mid-high ratings - 35% chance
        { min: 4, max: 5, weight: 20 },   // Mid ratings - 20% chance
        { min: 1, max: 3, weight: 15 }    // Low ratings - 15% chance
      ];

      let random = Math.random() * 100;
      let rating = 5; // Default fallback

      for (const weight of ratingWeights) {
        if (random <= weight.weight) {
          rating = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
          break;
        }
        random -= weight.weight;
      }

      // Find appropriate response for the rating
      const ratingCategory = RATING_RESPONSES.find(category => category.rating === rating) ||
                            RATING_RESPONSES.find(category => 
                              category.rating <= rating && 
                              category.rating === Math.max(...RATING_RESPONSES.filter(r => r.rating <= rating).map(r => r.rating))
                            );

      const response = ratingCategory.responses[Math.floor(Math.random() * ratingCategory.responses.length)];
      
      // Add some randomness to make it more engaging
      const includeBonus = Math.random() < 0.4; // 40% chance for bonus comment
      const includeElement = Math.random() < 0.3; // 30% chance for element comment
      
      let bonusComment = "";
      if (includeBonus) {
        bonusComment = "\n\n" + BONUS_COMMENTS[Math.floor(Math.random() * BONUS_COMMENTS.length)];
      }
      
      let elementComment = "";
      if (includeElement) {
        elementComment = "\n\n" + SETUP_ELEMENTS[Math.floor(Math.random() * SETUP_ELEMENTS.length)];
      }

      // Create the rating embed
      const ratingEmbed = new EmbedBuilder()
        .setColor(rating >= 8 ? 0x00ff00 : rating >= 6 ? 0xffff00 : rating >= 4 ? 0xff8800 : 0xff0000)
        .setTitle('🎛️ Turntable Setup Rating 🎛️')
        .setDescription(`**Rating: ${rating}/10** ⭐\n\n${response}${elementComment}${bonusComment}`)
        .setImage(attachment.url)
        .setFooter({ 
          text: `Rated by ${client.user.username} • Keep spinning! 🎵`,
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      // Add user's description if provided
      if (description) {
        ratingEmbed.addFields({
          name: '📝 Owner\'s Notes',
          value: description,
          inline: false
        });
      }

      // Add some rating context
      let ratingContext = "";
      if (rating >= 9) ratingContext = "🏆 **ELITE TIER** - Setup Hall of Fame!";
      else if (rating >= 7) ratingContext = "💎 **PREMIUM TIER** - Seriously impressive!";
      else if (rating >= 5) ratingContext = "🎵 **SOLID TIER** - Gets the job done!";
      else if (rating >= 3) ratingContext = "🎪 **UNIQUE TIER** - One of a kind!";
      else ratingContext = "💀 **LEGENDARY TIER** - Legendary for... reasons!";

      ratingEmbed.addFields({
        name: '🏅 Tier Classification',
        value: ratingContext,
        inline: true
      });

      // Add some fun statistics
      const fakeStats = {
        warmth: Math.floor(Math.random() * 100) + 1,
        vibes: Math.floor(Math.random() * 100) + 1,
        coolness: Math.floor(Math.random() * 100) + 1
      };

      ratingEmbed.addFields({
        name: '📊 Technical Analysis*',
        value: `**Warmth Factor:** ${fakeStats.warmth}%\n**Vibe Level:** ${fakeStats.vibes}%\n**Coolness Rating:** ${fakeStats.coolness}%\n\n*Results may vary. Science not included.`,
        inline: true
      });

      await interaction.reply({ embeds: [ratingEmbed] });

      // Sometimes add a follow-up reaction for extra engagement
      if (Math.random() < 0.3) { // 30% chance
        setTimeout(async () => {
          try {
            const message = await interaction.fetchReply();
            const reactions = ['🎵', '🔥', '👏', '💿', '🎧', '⭐'];
            const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
            await message.react(randomReaction);
          } catch (error) {
            // Silently fail if we can't add reactions
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Error in rate-my-setup command:', error);
      await interaction.reply({
        content: '❌ An error occurred while rating your setup. Maybe your setup broke my circuits with its awesomeness!',
        ephemeral: true
      });
    }
  }
};