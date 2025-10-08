const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

const RATING_RESPONSES = [
  {
    rating: 10,
    responses: [
      "**Exceptional Setup** - This represents audiophile excellence at its finest. The component selection and placement demonstrate sophisticated understanding of acoustic principles.",
      "**Professional Grade** - This configuration rivals high-end studio setups. The attention to detail and component quality is immediately apparent.",
      "**Reference Quality** - This system showcases what's possible when proper engineering meets passionate curation. Truly impressive work.",
      "**Masterclass Configuration** - Every element has been carefully considered for optimal performance. This is how reference systems should be built.",
      "**Studio Standard** - This setup demonstrates professional-level understanding of audio reproduction and component synergy."
    ]
  },
  {
    rating: 9,
    responses: [
      "**Outstanding Achievement** - Nearly flawless execution with excellent component choices and thoughtful system integration.",
      "**Highly Impressive** - This setup demonstrates serious commitment to audio quality with sophisticated component selection.",
      "**Excellent Configuration** - Very well thought out system with clear attention to both performance and aesthetics.",
      "**Superior Setup** - This represents the upper echelon of consumer audio with professional-grade attention to detail.",
      "**Premium Quality** - Exceptional work that clearly prioritizes sound quality and proper engineering principles."
    ]
  },
  {
    rating: 8,
    responses: [
      "**Very Well Executed** - Solid component choices with good understanding of system synergy and proper setup techniques.",
      "**Impressive Work** - This setup shows clear knowledge of audio fundamentals with quality component selection.",
      "**Strong Configuration** - Well-balanced system that demonstrates good understanding of acoustic principles.",
      "**Quality Build** - Thoughtful component choices with proper attention to setup and cable management.",
      "**Commendable Setup** - This represents serious dedication to audio quality with smart component decisions."
    ]
  },
  {
    rating: 7,
    responses: [
      "**Good Foundation** - Solid setup with clear potential for improvement. The basic components are well-chosen for the price point.",
      "**Respectable Configuration** - This demonstrates good understanding of the fundamentals with room for future upgrades.",
      "**Well-Considered Build** - Thoughtful component selection that balances performance with budget constraints effectively.",
      "**Competent Setup** - Shows good knowledge of audio basics with practical component choices for the system goals.",
      "**Promising Start** - Strong foundation that could benefit from targeted upgrades to unlock its full potential."
    ]
  },
  {
    rating: 6,
    responses: [
      "**Decent Foundation** - Good starting point with clear upgrade path. The fundamentals are in place for future improvements.",
      "**Functional Setup** - Practical configuration that serves its purpose well within obvious budget considerations.",
      "**Honest Build** - Straightforward approach with no pretense. Sometimes simplicity is exactly what's needed.",
      "**Workable Configuration** - Basic setup that handles the essentials competently with room for enhancement.",
      "**Adequate Performance** - Meets the fundamental requirements with potential for meaningful improvements over time."
    ]
  },
  {
    rating: 5,
    responses: [
      "**Average Performance** - Functional setup that meets basic requirements. Consider targeted upgrades for improved performance.",
      "**Standard Configuration** - Typical entry-level setup with expected performance characteristics for the component class.",
      "**Basic Functionality** - Gets the job done within limitations. Focus on key upgrades to improve overall system performance.",
      "**Conventional Build** - Standard approach with predictable results. Room for improvement in several key areas.",
      "**Modest Setup** - Simple configuration with basic performance. Consider upgrading critical components for better results."
    ]
  },
  {
    rating: 4,
    responses: [
      "**Needs Improvement** - Several areas requiring attention to achieve better performance and system coherence.",
      "**Below Average** - Current configuration has significant limitations that impact overall audio quality.",
      "**Unconventional Approach** - Creative setup choices that may benefit from more traditional component arrangements.",
      "**Challenging Configuration** - Interesting component choices that could benefit from system optimization.",
      "**Experimental Setup** - Unique approach that shows creativity, though performance could be enhanced with adjustments."
    ]
  },
  {
    rating: 3,
    responses: [
      "**Requires Attention** - This configuration presents several challenges that should be addressed for proper operation.",
      "**Significant Issues** - Multiple areas need improvement to achieve acceptable performance standards.",
      "**Problematic Setup** - Current arrangement may be impacting audio quality and component longevity.",
      "**Needs Restructuring** - Consider revising the component layout and connections for better results.",
      "**Maintenance Required** - This system would benefit from careful attention to setup fundamentals."
    ]
  },
  {
    rating: 2,
    responses: [
      "**Critical Issues** - Multiple problems that should be addressed immediately to prevent potential damage.",
      "**Serious Concerns** - This configuration presents risks to both audio quality and equipment safety.",
      "**Immediate Attention Needed** - Several critical issues require prompt correction for safe operation.",
      "**Major Problems** - This setup has significant issues that impact both performance and equipment safety.",
      "**Urgent Improvements Required** - Multiple critical problems need immediate attention."
    ]
  },
  {
    rating: 1,
    responses: [
      "**System Failure** - This configuration requires complete restructuring to achieve basic functionality.",
      "**Critical Malfunction** - Immediate professional attention recommended to prevent equipment damage.",
      "**Complete Overhaul Needed** - This system requires fundamental redesign from the ground up.",
      "**Non-Functional State** - Current configuration is not suitable for safe audio reproduction.",
      "**Emergency Intervention** - This setup poses risks to equipment and should be addressed immediately."
    ]
  }
];

const SETUP_ELEMENTS = [
  "Excellent cable management and organization.",
  "Well-considered aesthetic and functional design.",
  "Quality speaker placement and positioning.",
  "Proper lighting enhances both function and appearance.",
  "Clean workspace reflects attention to system care.",
  "Impressive record collection curation.",
  "Thoughtful integration of all system components.",
  "Clear evidence of careful planning and execution.",
  "Demonstrates refined musical taste and knowledge.",
  "Impressive attention to setup details and optimization."
];

const BONUS_COMMENTS = [
  "Component quality and system synergy are clearly prioritized here.",
  "The acoustic considerations in this setup are well thought out.",
  "This demonstrates serious commitment to audio reproduction quality.",
  "Evidence of careful research and component selection throughout.",
  "The room acoustics and speaker placement show good understanding.",
  "This setup reflects both technical knowledge and musical passion.",
  "Clear attention to both performance and long-term system care.",
  "The component matching and system balance are well considered.",
  "This represents a mature approach to audio system building.",
  "Excellent balance of performance, aesthetics, and practicality."
];

module.exports = {
  name: 'rate-my-setup',
  description: 'Share a photo of your turntable/audio setup and get a cheeky rating!',
  options: [
    {
      name: 'photo',
      description: 'Upload a photo of your turntable/audio setup',
      type: 11,
      required: true
    },
    {
      name: 'description',
      description: 'Optional: Tell us about your setup!',
      type: 3,
      required: false,
      max_length: 500
    }
  ],

  callback: async (client, interaction) => {
    try {
      const attachment = interaction.options.getAttachment('photo');
      const description = interaction.options.getString('description');

      if (!attachment || !attachment.contentType || !attachment.contentType.startsWith('image/')) {
        await interaction.reply({
          content: '❌ Please upload a valid image file of your turntable setup!',
          ephemeral: true
        });
        return;
      }

      const ratingWeights = [
        { min: 8, max: 10, weight: 30 },
        { min: 6, max: 7, weight: 35 },
        { min: 4, max: 5, weight: 20 },
        { min: 1, max: 3, weight: 15 }
      ];

      let random = Math.random() * 100;
      let rating = 5;

      for (const weight of ratingWeights) {
        if (random <= weight.weight) {
          rating = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
          break;
        }
        random -= weight.weight;
      }

      const ratingCategory = RATING_RESPONSES.find(category => category.rating === rating) ||
                            RATING_RESPONSES.find(category => 
                              category.rating <= rating && 
                              category.rating === Math.max(...RATING_RESPONSES.filter(r => r.rating <= rating).map(r => r.rating))
                            );

      const response = ratingCategory.responses[Math.floor(Math.random() * ratingCategory.responses.length)];
      
      const includeBonus = Math.random() < 0.4;
      const includeElement = Math.random() < 0.3;
      
      let bonusComment = "";
      if (includeBonus) {
        bonusComment = "\n\n" + BONUS_COMMENTS[Math.floor(Math.random() * BONUS_COMMENTS.length)];
      }
      
      let elementComment = "";
      if (includeElement) {
        elementComment = "\n\n" + SETUP_ELEMENTS[Math.floor(Math.random() * SETUP_ELEMENTS.length)];
      }

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

      if (description) {
        ratingEmbed.addFields({
          name: '📝 Owner\'s Notes',
          value: description,
          inline: false
        });
      }

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

      if (Math.random() < 0.3) {
        setTimeout(async () => {
          try {
            const message = await interaction.fetchReply();
            const reactions = ['🎵', '🔥', '👏', '💿', '🎧', '⭐'];
            const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
            await message.react(randomReaction);
          } catch (error) {
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