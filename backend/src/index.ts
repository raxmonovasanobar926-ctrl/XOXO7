import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/index.js';
import { db } from './db/index.js';
import { 
  telegramAuthHandler, 
  adminLoginHandler,
  adminVerifyHandler,
  authMiddleware, 
  requireAdmin, 
  requireSuperAdmin 
} from './modules/auth/index.js';
import { 
  getMeHandler, 
  updateProfileHandler, 
  checkNicknameHandler,
  getPublicProfileHandler 
} from './modules/users/index.js';
import { getReferralStatsHandler } from './modules/referrals/index.js';
import { 
  createTeamHandler, 
  joinTeamHandler, 
  leaveTeamHandler, 
  getTeamDetailsHandler 
} from './modules/teams/index.js';
import { 
  getIndividualLeaderboardHandler, 
  getTeamLeaderboardHandler 
} from './modules/leaderboard/index.js';
import { 
  getTransactionHistoryHandler, 
  getGlobalStatsHandler 
} from './modules/transactions/index.js';
import { redeemPromoHandler } from './modules/promo/index.js';
import { 
  getStarPacksHandler, 
  createStarInvoiceHandler, 
  simulateStarPaymentHandler 
} from './modules/payments/index.js';
import { 
  createGiftHandler, 
  getGiftsHistoryHandler 
} from './modules/gifts/index.js';
import {
  getAdminDashboardHandler,
  getAdminUsersHandler,
  blockUserHandler,
  unblockUserHandler,
  adjustBalanceHandler,
  getAdminsHandler,
  addAdminHandler,
  removeAdminHandler,
  getAdminPromoCodesHandler,
  createAdminPromoCodeHandler,
  updateAdminPromoCodeHandler,
  deleteAdminPromoCodeHandler,
  getAdminPaymentsHandler,
  refundPaymentHandler,
  getAdminPacksHandler,
  updateAdminPackHandler,
  getAdminAuditLogHandler,
  getAdminSettingsHandler,
  updateAdminSettingsHandler,
  getAdminAIStatsHandler,
  updateAdminAISettingHandler,
  changeUserIdHandler,
  grantAdminCollectibleGiftHandler,
  resetUserStatsHandler,
  getAdminRakeStatsHandler,
  getSuspiciousActivityHandler,
} from './modules/admin/index.js';
import { setupSocketServer } from './socket/index.js';
import { setupTelegramBot } from './bot/index.js';

const app = express();
const server = http.createServer(app);

// CORS and body parser
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers (Section 4.5)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://web.telegram.org');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org;");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// In-memory rate limiting against brute force and DoS (Section 4.5)
const apiRateLimits = new Map<string, { count: number; resetAt: number }>();
function apiRateLimiter(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${ip}_${req.baseUrl || req.path}`;
    const now = Date.now();
    let record = apiRateLimits.get(key);
    if (!record || record.resetAt <= now) {
      record = { count: 1, resetAt: now + windowMs };
      apiRateLimits.set(key, record);
      return next();
    }
    record.count++;
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: 'Juda ko‘p so‘rovlar. Iltimos, birozdan so‘ng qayta urinib ko‘ring.' });
    }
    next();
  };
}

// Global API rate limiter (120 requests per minute)
app.use('/api', apiRateLimiter(120, 60000));

import {
  getDailyBonusStatusHandler,
  claimDailyBonusHandler,
} from './modules/daily_bonus/index.js';
import {
  getFriendsHandler,
  addFriendHandler,
  sendFriendRequestHandler,
  respondFriendRequestHandler,
  giftTokensHandler,
} from './modules/friends/index.js';
import {
  getCollectibleCatalogHandler,
  getMyCollectibleGiftsHandler,
  getUserCollectibleGiftsHandler,
  buyCollectibleGiftHandler,
  sellCollectibleGiftHandler,
  giftCollectibleGiftHandler,
  getTopGiftersLeaderboardHandler,
} from './modules/collectible_gifts/index.js';
import {
  getCelebratoryNotificationsHandler,
  markCelebratoryNotificationReadHandler,
} from './modules/notifications/index.js';

// Routes
// 1. Auth
app.post('/api/auth/telegram', telegramAuthHandler);
app.post('/api/admin/auth/login', adminLoginHandler);
app.get('/api/admin/auth/verify', authMiddleware, requireAdmin, adminVerifyHandler);

// 2. Users
app.get('/api/users/me', authMiddleware, getMeHandler);
app.get('/api/users/check-nickname', authMiddleware, checkNicknameHandler);
app.patch('/api/users/me', authMiddleware, updateProfileHandler);
app.get('/api/users/:id', authMiddleware, getPublicProfileHandler);

// 3. Referrals
app.get('/api/referrals/stats', authMiddleware, getReferralStatsHandler);

// 4. Teams
app.post('/api/teams', authMiddleware, createTeamHandler);
app.post('/api/teams/join', authMiddleware, joinTeamHandler);
app.post('/api/teams/leave', authMiddleware, leaveTeamHandler);
app.get('/api/teams/:id', authMiddleware, getTeamDetailsHandler);

// 5. Leaderboard
app.get('/api/leaderboard/individual', getIndividualLeaderboardHandler);
app.get('/api/leaderboard/teams', getTeamLeaderboardHandler);

// 6. Transactions & Global Stats
app.get('/api/transactions/history', authMiddleware, getTransactionHistoryHandler);
app.get('/api/stats/global', getGlobalStatsHandler);

// 7. Promo codes (User)
app.post('/api/promo/redeem', authMiddleware, redeemPromoHandler);

// 8. Payments (Stars)
app.get('/api/payments/packs', getStarPacksHandler);
app.post('/api/payments/create-invoice', authMiddleware, createStarInvoiceHandler);
app.post('/api/payments/simulate', authMiddleware, simulateStarPaymentHandler);

// 9. Daily Bonus
app.get('/api/daily-bonus/status', authMiddleware, getDailyBonusStatusHandler);
app.post('/api/daily-bonus/claim', authMiddleware, claimDailyBonusHandler);

// 10. Friends & Token Gifting
app.get('/api/friends', authMiddleware, getFriendsHandler);
app.post('/api/friends/add', authMiddleware, addFriendHandler);
app.post('/api/friends/request', authMiddleware, sendFriendRequestHandler);
app.post('/api/friends/respond', authMiddleware, respondFriendRequestHandler);
app.post('/api/friends/gift-tokens', authMiddleware, giftTokensHandler);

// 11. Celebratory Notifications
app.get('/api/notifications/celebratory', authMiddleware, getCelebratoryNotificationsHandler);
app.post('/api/notifications/celebratory/:id/read', authMiddleware, markCelebratoryNotificationReadHandler);

// 12. Collectible Gifts
app.get('/api/gifts/catalog', getCollectibleCatalogHandler);
app.get('/api/gifts/my', authMiddleware, getMyCollectibleGiftsHandler);
app.get('/api/gifts/user/:userId', authMiddleware, getUserCollectibleGiftsHandler);
app.post('/api/gifts/buy', authMiddleware, buyCollectibleGiftHandler);
app.post('/api/gifts/sell', authMiddleware, sellCollectibleGiftHandler);
app.post('/api/gifts/send', authMiddleware, giftCollectibleGiftHandler);
app.post('/api/gifts/transfer', authMiddleware, giftCollectibleGiftHandler);
app.get('/api/gifts/leaderboard', getTopGiftersLeaderboardHandler);


// 9. Admin routes (Admin & Super Admin)
app.get('/api/admin/dashboard', authMiddleware, requireAdmin, getAdminDashboardHandler);
app.get('/api/admin/users', authMiddleware, requireAdmin, getAdminUsersHandler);
app.post('/api/admin/users/:id/block', authMiddleware, requireAdmin, blockUserHandler);
app.post('/api/admin/users/:id/unblock', authMiddleware, requireAdmin, unblockUserHandler);
app.post('/api/admin/users/:id/balance', authMiddleware, requireAdmin, adjustBalanceHandler);
app.post('/api/admin/users/:id/change-id', authMiddleware, requireAdmin, changeUserIdHandler);
app.post('/api/admin/users/:id/grant-gift', authMiddleware, requireAdmin, grantAdminCollectibleGiftHandler);
app.post('/api/admin/users/:id/reset-stats', authMiddleware, requireAdmin, resetUserStatsHandler);
app.get('/api/admin/promo', authMiddleware, requireAdmin, getAdminPromoCodesHandler);
app.post('/api/admin/promo', authMiddleware, requireAdmin, createAdminPromoCodeHandler);
app.patch('/api/admin/promo/:id', authMiddleware, requireAdmin, updateAdminPromoCodeHandler);
app.delete('/api/admin/promo/:id', authMiddleware, requireAdmin, deleteAdminPromoCodeHandler);
app.post('/api/admin/gifts', authMiddleware, requireAdmin, createGiftHandler);
app.get('/api/admin/gifts', authMiddleware, requireAdmin, getGiftsHistoryHandler);
app.get('/api/admin/packs', authMiddleware, requireAdmin, getAdminPacksHandler);
app.get('/api/admin/audit-log', authMiddleware, requireAdmin, getAdminAuditLogHandler);
app.get('/api/admin/suspicious-activity', authMiddleware, requireAdmin, getSuspiciousActivityHandler);

// 10. Super Admin only routes
app.get('/api/admin/admins', authMiddleware, requireSuperAdmin, getAdminsHandler);
app.post('/api/admin/admins', authMiddleware, requireSuperAdmin, addAdminHandler);
app.delete('/api/admin/admins/:id', authMiddleware, requireSuperAdmin, removeAdminHandler);
app.get('/api/admin/payments', authMiddleware, requireSuperAdmin, getAdminPaymentsHandler);
app.post('/api/admin/payments/refund', authMiddleware, requireSuperAdmin, refundPaymentHandler);
app.patch('/api/admin/packs/:id', authMiddleware, requireSuperAdmin, updateAdminPackHandler);
app.get('/api/admin/settings', authMiddleware, requireSuperAdmin, getAdminSettingsHandler);
app.patch('/api/admin/settings', authMiddleware, requireSuperAdmin, updateAdminSettingsHandler);
app.get('/api/admin/rake/stats', authMiddleware, requireSuperAdmin, getAdminRakeStatsHandler);

// AI Opponent Admin
app.get('/api/admin/ai/stats', authMiddleware, requireSuperAdmin, getAdminAIStatsHandler);
app.patch('/api/admin/ai/settings/:level', authMiddleware, requireSuperAdmin, updateAdminAISettingHandler);

// AI Opponent Client Endpoints
app.get('/api/ai/levels', async (req, res) => {
  const settings = await db.getAILevelSettings();
  res.json({ levels: settings });
});

app.get('/api/ai/stats', authMiddleware, async (req: any, res) => {
  const stats = await db.getUserAIStats(req.user.userId);
  const stonesWonToday = await db.getStonesWonFromAIToday(req.user.userId);
  const settings = await db.getSettings();
  res.json({
    stats,
    stonesWonToday,
    maxStonesWonPerDay: settings.bot_max_stones_won_per_day || 30,
  });
});

// 11. System config (Public / Client)
app.get('/api/config', async (req, res) => {
  const dynamicSettings = await db.getSettings();
  res.json({
    stakes: config.stakes,
    defaultStake: config.defaultStake,
    rakeAmount: dynamicSettings.rake_amount !== undefined ? dynamicSettings.rake_amount : 1,
    rpsTimeoutSeconds: dynamicSettings.rps_timeout_seconds || config.rpsTimeoutSeconds,
    turnTimeoutSeconds: dynamicSettings.turn_timeout_seconds || config.turnTimeoutSeconds,
    maxRpsDraws: config.maxRpsDraws,
    referralBonus: dynamicSettings.referral_bonus || config.referralBonus,
    initialStones: dynamicSettings.initial_tokens || config.initialTokens,
    initialTokens: dynamicSettings.initial_tokens || config.initialTokens,
  });
});

// Serve frontend build if available
const possibleFrontendPaths = [
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../../../frontend/dist'),
];
const frontendDist = possibleFrontendPaths.find(p => fs.existsSync(p));
if (frontendDist) {
  console.log('[Server] Serving frontend build from:', frontendDist);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
setupSocketServer(io);

// Start server
async function bootstrap() {
  try {
    await db.init();
    
    setupTelegramBot();

    server.listen(config.port, () => {
      console.log(`[Server] XOXO Backend running at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('[Server] Fatal bootstrap error:', err);
    process.exit(1);
  }
}

bootstrap();
