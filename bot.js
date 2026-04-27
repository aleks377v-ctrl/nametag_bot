const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const TOKEN = process.env.DISCORD_TOKEN;
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz_vByViBFDdyqTYYZ0IZJMN7SnMfVry06_F6f8pqC92de-RAej7bcOF2hoRftdQBs/exec';
const ALLOWED_USERS = [
  '598798724290052096',
  '1450406381755564124',
  '649924210638061588',
  '1043791485721649173',
  '1347642766691270778',
  '1078598836307628052',
  '1211293477254463498',
  '1372713231705178166',
  '1489708163384213665'
];
if (!TOKEN) {
  console.error('DISCORD_TOKEN не задан! Добавь его в секреты.');
  process.exit(1);
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
});
client.on('ready', () => {
  console.log(`Бот запущен как ${client.user.tag}`);
});
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;
  if (!ALLOWED_USERS.includes(message.author.id)) {
    return message.reply('У тебя нет доступа к командам бота.');
  }
  const args = message.content.slice(1).split(' ');
  const cmd = args[0].toLowerCase();
  if (cmd === 'nametag') {
    const player = args[1];
    const nametag = args[2];
    const fx = args[3] || 'default';
    if (!player || !nametag) {
      return message.reply('Использование: !nametag <ник> <текст> [fx]');
    }
    try {
      await axios.post(GOOGLE_SHEETS_URL, {
        command: 'nametag',
        player: player,
        args: `${nametag} ${fx}`
      });
      message.reply(`Отправлено! ${player} → ${nametag} (${fx})`);
    } catch (err) {
      console.error('Ошибка при отправке:', err.message);
      message.reply('Ошибка при отправке команды.');
    }
  }
  if (cmd === 'help') {
    message.reply('**Команды:**\n!nametag <ник> <текст> [fx]\n!givemoney <ник> <сумма>\n!gun <ник> <оружие>');
  }
});
client.login(TOKEN);
