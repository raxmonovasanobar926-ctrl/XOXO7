import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const backendDir = path.resolve(__dirname, '../');

console.log('[Runner] Starting XOXO Bot & Fast Tunnel System...');

// 1. Read existing .env
const envPath = path.join(rootDir, '.env');
const backendEnvPath = path.join(backendDir, '.env');

function getEnvMap(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const map = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...vals] = trimmed.split('=');
    map[key.trim()] = vals.join('=').trim();
  });
  return map;
}

function updateEnvFile(filePath, key, val) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${val}`);
  } else {
    content += `\n${key}=${val}`;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

const envVars = { ...getEnvMap(backendEnvPath), ...getEnvMap(envPath) };
const botToken = envVars.BOT_TOKEN || '8538420353:AAFyn4LIthhpDndT1wJbfVnbsV-zWsXwzAE';
const chatId = envVars.SUPER_ADMIN_TELEGRAM_ID || '5252756017';

// 2. Start Cloudflare Tunnel
const cloudflaredExe = path.join(rootDir, 'cloudflared.exe');
if (!fs.existsSync(cloudflaredExe)) {
  console.error('[Runner] cloudflared.exe not found at:', cloudflaredExe);
  process.exit(1);
}

console.log('[Runner] Launching Cloudflare Tunnel on port 3001...');
const tunnelProc = spawn(cloudflaredExe, ['tunnel', '--url', 'http://localhost:3001'], {
  cwd: rootDir,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let tunnelUrl = '';
let backendProc = null;

async function onTunnelReady(url) {
  tunnelUrl = url;
  console.log(`\n======================================================`);
  console.log(`[Tunnel] LIVE PUBLIC URL: ${tunnelUrl}`);
  console.log(`======================================================\n`);

  // Update .env files
  updateEnvFile(envPath, 'WEBAPP_URL', tunnelUrl);
  updateEnvFile(backendEnvPath, 'WEBAPP_URL', tunnelUrl);
  process.env.WEBAPP_URL = tunnelUrl;

  // Update Telegram Menu Button
  try {
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
    if (chatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, ...menuPayload })
      }).catch(() => {});

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🚀 *XOXO Bot & Tunnel ishga tushirildi!*\n\n🌐 *URL:* ${tunnelUrl}\n\nQuyidagi tugma orqali o'yinni ochishingiz mumkin:`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🎮 O‘yinni ochish (Mini App)', web_app: { url: tunnelUrl } }],
              [{ text: '🌐 Brauzerda ochish', url: tunnelUrl }]
            ]
          }
        })
      }).catch(() => {});
    }
    console.log('[Telegram] Bot Menu Button updated to:', tunnelUrl);
  } catch (err) {
    console.warn('[Telegram] Could not update menu button:', err.message);
  }

  // Build backend TypeScript to ensure latest dist code is running
  try {
    console.log('[Runner] Compiling backend TypeScript...');
    const { execSync } = await import('child_process');
    execSync('npx tsc', { cwd: backendDir, stdio: 'inherit', shell: true });
  } catch (buildErr) {
    console.warn('[Runner] Backend compilation warning:', buildErr.message);
  }

  // Start Backend server
  console.log('[Runner] Starting XOXO Backend & Telegram Bot...');
  backendProc = spawn('node', ['dist/index.js'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...envVars, WEBAPP_URL: tunnelUrl }
  });

  backendProc.on('exit', (code) => {
    console.log(`[Backend] Process exited with code ${code}`);
    cleanup();
  });
}

const handleTunnelData = (chunk) => {
  const text = chunk.toString();
  if (!tunnelUrl) {
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      onTunnelReady(match[0]);
    }
  }
};

tunnelProc.stderr.on('data', handleTunnelData);
tunnelProc.stdout.on('data', handleTunnelData);

tunnelProc.on('exit', (code) => {
  console.log(`[Tunnel] cloudflared exited with code ${code}`);
  cleanup();
});

function cleanup() {
  if (backendProc) {
    try { backendProc.kill(); } catch {}
  }
  if (tunnelProc) {
    try { tunnelProc.kill(); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
