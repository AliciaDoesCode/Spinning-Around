const { EmbedBuilder } = require('discord.js');

// Collection of music history and vinyl facts
const MUSIC_FACTS = [
  // Vinyl & Recording History Facts
  {
    title: "The Birth of Vinyl",
    fact: "The first vinyl record was created in 1930 by RCA Victor. Before vinyl, records were made of shellac, which was much more brittle and broke easily.",
    category: "Vinyl History"
  },
  {
    title: "The LP Revolution", 
    fact: "The 33⅓ RPM long-playing (LP) record was introduced by Columbia Records in 1948, allowing up to 25 minutes of music per side compared to just 3-4 minutes on 78 RPM records.",
    category: "Vinyl History"
  },
  {
    title: "Stereo Sound Discovery",
    fact: "Stereo records were first commercially released in 1958. The groove contains two channels - the left channel is the sum of lateral movement, while the right channel is the difference in vertical movement.",
    category: "Audio Technology"
  },
  {
    title: "The Microphone Revolution",
    fact: "The electric microphone was invented in 1916, but it wasn't until the 1940s that it became standard in recording studios, completely changing how music was captured and produced.",
    category: "Recording History"
  },
  {
    title: "Radio's Golden Impact",
    fact: "The first commercial radio station, KDKA in Pittsburgh, began broadcasting in 1920. By 1930, 12 million American households had radios, creating the first mass music distribution system.",
    category: "Broadcasting History"
  },

  // Music Genre & Artist Facts
  {
    title: "Rock 'n' Roll Origins",
    fact: "The term 'Rock and Roll' was popularized by DJ Alan Freed in 1951. The genre evolved from blues, country, and gospel music in the American South during the 1940s and 1950s.",
    category: "Genre History"
  },
  {
    title: "The Beatles' Vinyl Legacy",
    fact: "The Beatles' 'Sgt. Pepper's Lonely Hearts Club Band' (1967) was one of the first albums designed as a complete artistic statement for the LP format, influencing the concept of the 'album' as art.",
    category: "Artist History"
  },
  {
    title: "Jazz Innovation",
    fact: "Jazz was the first truly American musical genre, emerging in New Orleans around 1900. It was revolutionary for its improvisation and syncopated rhythms, influencing virtually every genre that followed.",
    category: "Genre History"
  },
  {
    title: "Classical Music's Length",
    fact: "Beethoven's 9th Symphony was so long (about 70 minutes) that it influenced the creation of the compact disc format - CDs were designed to hold exactly 74 minutes to fit the entire symphony.",
    category: "Classical History"
  },
  {
    title: "Hip-Hop's Birth",
    fact: "Hip-hop was born on August 11, 1973, when DJ Kool Herc threw a party in the Bronx and invented the technique of isolating and extending the 'break' in funk records using two turntables.",
    category: "Genre History"
  },

  // Vinyl Production & Technical Facts
  {
    title: "Vinyl Production Process",
    fact: "Vinyl records are made from polyvinyl chloride (PVC). The master recording is cut into a lacquer disc, which creates a metal 'mother' disc that stamps thousands of vinyl copies.",
    category: "Production"
  },
  {
    title: "Album Art Innovation",
    fact: "The 12-inch LP format (introduced in 1948) created the canvas for album artwork. The first album cover art is often credited to Alex Steinweiss at Columbia Records in 1939.",
    category: "Visual Arts"
  },
  {
    title: "The Vinyl Resurgence",
    fact: "Vinyl sales have grown for 16 consecutive years since 2005. In 2020, vinyl outsold CDs for the first time since 1986, with over 27 million units sold in the US alone.",
    category: "Modern Trends"
  },
  {
    title: "Precision Engineering",
    fact: "The stylus on a record player must track the groove with incredible precision - it follows curves that are only 0.04-0.08mm wide while the record spins at exactly 33⅓ or 45 RPM.",
    category: "Technical"
  },
  {
    title: "Groove Mathematics",
    fact: "A 12-inch LP has approximately 1,500 feet of groove spiraling from the outside to the center. The outer grooves move faster past the stylus, allowing for better sound quality.",
    category: "Technical"
  },

  // Music Industry History
  {
    title: "The CD Revolution",
    fact: "The compact disc was jointly developed by Sony and Philips and launched in 1982. The first CD ever pressed was ABBA's 'The Visitors' at a Philips factory in Germany.",
    category: "Digital History"
  },
  {
    title: "Sheet Music Era",
    fact: "Before recorded music, the music industry was built on sheet music sales. In 1910, over 2 billion pieces of sheet music were sold in America - that's 25 sheets per person!",
    category: "Industry History"
  },
  {
    title: "Gold Records Origin",
    fact: "The first gold record was awarded to Glenn Miller for 'Chattanooga Choo Choo' in 1942, presented by RCA Victor for selling over 1 million copies. It was literally spray-painted gold.",
    category: "Industry History"
  },
  {
    title: "Headphones History",
    fact: "The first headphones were created in 1910 by Nathaniel Baldwin in his kitchen. He made them by hand and sold them to the US Navy, who were amazed by their quality.",
    category: "Technology History"
  },
  {
    title: "Music Notation Evolution",
    fact: "Modern musical notation was developed by Guido d'Arezzo around 1000 AD. Before this, music was passed down orally or through primitive notation systems that were difficult to read.",
    category: "Music Theory"
  },

  // Interesting Trivia
  {
    title: "Guitar Evolution",
    fact: "The electric guitar was invented in 1931 by George Beauchamp and Adolph Rickenbacker. The first electric guitar was called the 'Rickenbacker Frying Pan' due to its shape.",
    category: "Instrument History"
  },
  {
    title: "Drum Kit Assembly",
    fact: "The modern drum kit was assembled around 1909 when the bass drum pedal was invented, allowing one person to play multiple percussion instruments simultaneously for the first time.",
    category: "Instrument History"
  },
  {
    title: "Piano Power",
    fact: "A grand piano has about 220 strings and can exert up to 20 tons of pressure on its frame. The longest strings are over 6 feet long, while the shortest are just 2 inches.",
    category: "Instrument History"
  },
  {
    title: "Payola Scandal",
    fact: "The payola scandal of the 1950s revealed that record companies were paying radio DJs to play their songs. This led to congressional hearings and the end of many DJs' careers, including Alan Freed.",
    category: "Industry History"
  },
  {
    title: " Muzak Origins",
    fact: "Muzak, the company that created 'elevator music,' was founded in 1934. They scientifically designed music to increase productivity in workplaces and reduce anxiety in elevators.",
    category: "Cultural History"
  }
];

module.exports = {
  name: 'music-fact',
  description: 'Get a random fact about music history, vinyl records, or audio technology!',
  
  callback: async (client, interaction) => {
    try {
      // Select a random fact
      const randomFact = MUSIC_FACTS[Math.floor(Math.random() * MUSIC_FACTS.length)];
      
      // Create embed with the fact
      const factEmbed = new EmbedBuilder()
        .setColor(0x9b59b6) // Purple color
        .setTitle(randomFact.title)
        .setDescription(randomFact.fact)
        .addFields({
          name: '📚 Category',
          value: randomFact.category,
          inline: true
        })
        .setFooter({ 
          text: `Music Fact ${Math.floor(Math.random() * 1000) + 1} • Did you know?` 
        })
        .setTimestamp();
      
      // Add a random music-related emoji to make it more engaging
      const musicEmojis = ['🎵', '🎶', '🎼', '🎤', '🎸', '🥁', '🎹', '🎧', '📻', '💿', '📀', '🎺', '🎷', '🎻'];
      const randomEmoji = musicEmojis[Math.floor(Math.random() * musicEmojis.length)];
      
      factEmbed.setAuthor({ 
        name: `${randomEmoji} Music History Facts`,
        iconURL: client.user.displayAvatarURL()
      });
      
      await interaction.reply({ embeds: [factEmbed] });
      
    } catch (error) {
      console.error('Error in music-fact command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while fetching a music fact. Please try again!', 
        ephemeral: true 
      });
    }
  }
};