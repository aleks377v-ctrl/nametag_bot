const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const TOKEN = process.env.DISCORD_TOKEN;
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz_vByViBFDdyqTYYZ0IZJMN7SnMfVry06_F6f8pqC92de-RAej7bcOF2hoRftdQBs/exec';

const ROLES = {
  BAN: ['1482818344661811291'],
  KICK: ['1482818344661811291'],
  WARN: ['1482818344661811291'],
  UNWARN: ['1482818344661811291'],
  NAMETAG: ['1482818344661811291']
};

const ALL_ALLOWED_ROLES = [
  ...ROLES.BAN,
  ...ROLES.KICK,
  ...ROLES.WARN,
  ...ROLES.UNWARN,
  ...ROLES.NAMETAG
];

if (!TOKEN) {
  console.error('DISCORD_TOKEN не задан');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
});

function hasPermission(message, command) {
  const member = message.member;
  if (!member) return false;
  
  const allowedRoles = ROLES[command];
  if (!allowedRoles) return false;
  
  return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

function hasAnyRole(message) {
  const member = message.member;
  if (!member) return false;
  
  return member.roles.cache.some(role => ALL_ALLOWED_ROLES.includes(role.id));
}

client.on('ready', () => {
  console.log(`Бот запущен как ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(' ');
  const cmd = args[0].toLowerCase();
  
  if (cmd === 'help') {
    if (!hasAnyRole(message)) {
      return message.reply('У тебя нет доступа к командам бота.');
    }
    
    message.reply(`
Команды бота:
!nametag <ник> <текст> [fx] - выдать неймтег
!ban <ник> [причина] - забанить игрока
!kick <ник> [причина] - кикнуть игрока
!warn <ник> [причина] - выдать варн
!unwarn <ник> <название варна или all> - снять варн
!help - это меню
    `);
  }
  
  if (cmd === 'nametag') {
    if (!hasPermission(message, 'NAMETAG')) {
      return message.reply('У тебя нет прав на использование этой команды.');
    }
    
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
      message.reply(`Отправлено: ${player} -> ${nametag} (${fx})`);
    } catch (err) {
      console.error('Ошибка:', err.message);
      message.reply('Ошибка при отправке команды.');
    }
  }
  
  if (cmd === 'ban') {
    if (!hasPermission(message, 'BAN')) {
      return message.reply('У тебя нет прав на использование этой команды.');
    }
    
    const player = args[1];
    const reason = args.slice(2).join(' ') || 'Не указана';
    
    if (!player) {
      return message.reply('Использование: !ban <ник> [причина]');
    }
    
    try {
      await axios.post(GOOGLE_SHEETS_URL, {
        command: 'ban',
        player: player,
        args: reason
      });
      message.reply(`Бан отправлен: ${player} | Причина: ${reason}`);
    } catch (err) {
      console.error('Ошибка:', err.message);
      message.reply('Ошибка при отправке команды.');
    }
  }
  
  if (cmd === 'kick') {
    if (!hasPermission(message, 'KICK')) {
      return message.reply('У тебя нет прав на использование этой команды.');
    }
    
    const player = args[1];
    const reason = args.slice(2).join(' ') || 'Не указана';
    
    if (!player) {
      return message.reply('Использование: !kick <ник> [причина]');
    }
    
    try {
      await axios.post(GOOGLE_SHEETS_URL, {
        command: 'kick',
        player: player,
        args: reason
      });
      message.reply(`Кик отправлен: ${player} | Причина: ${reason}`);
    } catch (err) {
      console.error('Ошибка:', err.message);
      message.reply('Ошибка при отправке команды.');
    }
  }
  
  if (cmd === 'warn') {
    if (!hasPermission(message, 'WARN')) {
      return message.reply('У тебя нет прав на использование этой команды.');
    }
    
    const player = args[1];
    const reason = args.slice(2).join(' ') || 'Не указана';
    
    if (!player) {
      return message.reply('Использование: !warn <ник> [причина]');
    }
    
    try {
      await axios.post(GOOGLE_SHEETS_URL, {
        command: 'warn',
        player: player,
        args: reason
      });
      message.reply(`Варн отправлен: ${player} | Причина: ${reason}`);
    } catch (err) {
      console.error('Ошибка:', err.message);
      message.reply('Ошибка при отправке команды.');
    }
  }
  
  if (cmd === 'unwarn') {
    if (!hasPermission(message, 'UNWARN')) {
      return message.reply('У тебя нет прав на использование этой команды.');
    }
    
    const player = args[1];
    const warnName = args[2] || 'all';
    
    if (!player) {
      return message.reply('Использование: !unwarn <ник> <название варна или all>');
    }
    
    try {
      await axios.post(GOOGLE_SHEETS_URL, {
        command: 'unwarn',
        player: player,
        args: warnName
      });
      message.reply(`Снятие варна отправлено: ${player} | Варн: ${warnName}`);
    } catch (err) {
      console.error('Ошибка:', err.message);
      message.reply('Ошибка при отправке команды.');
    }
  }
});

client.login(TOKEN);
