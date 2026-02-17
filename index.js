const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const boosterData = new Map();

// Bot ready
client.once('ready', () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

// Detect boost add/remove
client.on('guildMemberUpdate', (oldMember, newMember) => {
  const oldBoost = oldMember.premiumSince;
  const newBoost = newMember.premiumSince;

  // Boost added
  if (!oldBoost && newBoost) {
    boosterData.set(newMember.id, {
      boosts: (boosterData.get(newMember.id)?.boosts || 0) + 1,
      messages: boosterData.get(newMember.id)?.messages || 0
    });

    const channel = newMember.guild.systemChannel;
    if (channel) {
      channel.send(`🚀 ${newMember.user.tag} boosted the server! Thank you!`);
    }
  }

  // Boost removed
  if (oldBoost && !newBoost) {
    const channel = newMember.guild.systemChannel;
    if (channel) {
      channel.send(`❌ ${newMember.user.tag} removed their boost.`);
    }
  }
});

// Count booster messages
client.on('messageCreate', msg => {
  if (!msg.guild || msg.author.bot) return;
  if (!msg.member.premiumSince) return;

  const data = boosterData.get(msg.author.id) || { boosts: 0, messages: 0 };
  data.messages += 1;
  boosterData.set(msg.author.id, data);
});

// Slash command: /booster-info
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'booster-info') {
    const user = interaction.options.getUser('user') || interaction.user;
    const data = boosterData.get(user.id) || { boosts: 0, messages: 0 };

    const embed = new EmbedBuilder()
      .setTitle('Booster Info')
      .setColor('Purple')
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Boost Count', value: String(data.boosts), inline: true },
        { name: 'Messages Sent', value: String(data.messages), inline: true }
      );

    interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
