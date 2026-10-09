import fs from 'fs';
import path from 'path';

// Read .env
const envPath = path.resolve(process.cwd(), '.env');
const backendEnvPath = path.resolve(process.cwd(), 'backend/.env');
let envFile = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : (fs.existsSync(backendEnvPath) ? fs.readFileSync(backendEnvPath, 'utf-8') : '');

const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) envVars[key.trim()] = val.join('=').trim();
});

const botToken = process.env.BOT_TOKEN || envVars.BOT_TOKEN || '8538420353:AAFyn4LIthhpDndT1wJbfVnbsV-zWsXwzAE';
const tunnelUrl = process.argv[2] || process.env.WEBAPP_URL || envVars.WEBAPP_URL || 'https://rating-sounds-decor-became.trycloudflare.com';
const chatId = process.env.SUPER_ADMIN_TELEGRAM_ID || envVars.SUPER_ADMIN_TELEGRAM_ID || 5252756017;


async function updateBot() {
  try {
    // 1. Set Chat Menu Button (Global & Chat)
    const menuPayload = {
      menu_button: {
        type: 'web_app',
        text: 'Play XOXO',
        web_app: { url: tunnelUrl }
      }
    };
    await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuPayload)
    });
    await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, ...menuPayload })
    });

    // 2. Send Telegram message with web_app button
    const msgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🎮 *XOXO — 4-topshiriq tayyor!*\n\n💎 Valyuta: *Tosh (Stone)*\n🤖 Yangi AI Raqib Golemlar (*Pebble, Rocky, Granite, Obsidian*)\n🎨 Original Zero-Emoji grafika tizimi\n🚫 Kunlik bonus to‘liq olib tashlandi\n\nQuyidagi tugmani bosing va o‘yinni sinab ko‘ring:',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⚔️ XOXO O‘yinini ochish (Mini App)', web_app: { url: tunnelUrl } }
            ],
            [
              { text: '🌐 Brauzer orqali ochish', url: tunnelUrl }
            ]
          ]
        }
      })
    });
    const msgData = await msgRes.json();
    console.log('sendMessage result:', msgData);
  } catch (err) {
    console.error('Error updating bot:', err);
  }
}

updateBot();
