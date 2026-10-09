import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current working dir, parent dir, or project root
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  botToken: process.env.BOT_TOKEN || '',
  webAppUrl: process.env.WEBAPP_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'xoxo-secret-key-12345',
  
  // Database & Cache (PostgreSQL / Supabase / Redis)
  databaseUrl: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '',
  redisUrl: process.env.REDIS_URL || '',
  
  // Economy & rules
  initialTokens: parseInt(process.env.INITIAL_TOKENS || '25', 10),
  referralBonus: parseInt(process.env.REFERRAL_BONUS || '5', 10),
  dailyBonus: parseInt(process.env.DAILY_BONUS || '5', 10),
  
  // RBAC & Super Admin
  superAdminTelegramId: process.env.SUPER_ADMIN_TELEGRAM_ID ? parseInt(process.env.SUPER_ADMIN_TELEGRAM_ID, 10) : 1001,
  adminDailyGiftLimit: parseInt(process.env.ADMIN_DAILY_GIFT_LIMIT || '500', 10),
  adminPortalUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPortalPassword: process.env.ADMIN_PASSWORD || 'AdminXOXO2026!SecureKey',
  
  // Game timers & thresholds
  rpsTimeoutSeconds: parseInt(process.env.RPS_TIMEOUT_SECONDS || '5', 10),
  turnTimeoutSeconds: parseInt(process.env.TURN_TIMEOUT_SECONDS || '20', 10),
  maxRpsDraws: parseInt(process.env.MAX_RPS_DRAWS || '3', 10),
  
  stakes: [2, 4, 6, 10],
  defaultStake: 2,
};
