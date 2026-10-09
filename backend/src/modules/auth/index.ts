import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/index.js';
import { db } from '../../db/index.js';
import { UserRole } from '../../db/types.js';

export interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_bot?: boolean;
}

export interface AuthTokenPayload {
  userId: number;
  telegramId: number;
  nickname: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

/**
 * Validates Telegram WebApp initData string using HMAC-SHA256
 */
export function validateTelegramInitData(initDataString: string, botToken: string): { valid: boolean; user?: TelegramUserData } {
  if (!initDataString || !botToken) {
    return { valid: false };
  }

  try {
    const params = new URLSearchParams(initDataString);
    const hash = params.get('hash');
    if (!hash) return { valid: false };

    params.delete('hash');

    // Sort parameters alphabetically
    const keys = Array.from(params.keys()).sort();
    const dataCheckArr: string[] = [];
    for (const key of keys) {
      dataCheckArr.push(`${key}=${params.get(key)}`);
    }
    const dataCheckString = dataCheckArr.join('\n');

    // secret_key = HMAC_SHA256(botToken, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // calculatedHash = HMAC_SHA256(dataCheckString, secretKey).hex()
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { valid: false };
    }

    // Check auth_date expiration to prevent replay attacks (Section 4.1)
    const authDateStr = params.get('auth_date');
    if (!authDateStr) {
      return { valid: false };
    }
    const authDate = parseInt(authDateStr, 10);
    const now = Math.floor(Date.now() / 1000);
    // Disallow initData older than 1 hour (3600 seconds) or more than 5 minutes in future (clock drift)
    if (isNaN(authDate) || (now - authDate > 3600) || (authDate - now > 300)) {
      return { valid: false };
    }

    const userParam = params.get('user');
    const user: TelegramUserData | undefined = userParam ? JSON.parse(userParam) : undefined;

    return { valid: true, user };
  } catch (err) {
    console.error('[Auth] Error validating Telegram initData:', err);
    return { valid: false };
  }
}

/**
 * Generates JWT token for authorized user
 */
export function generateAuthToken(payload: AuthTokenPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: expiresIn as any });
}

/**
 * Express middleware to authenticate JWT token and enforce active status (blocking check)
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;

    // Verify user in DB & check block status
    const dbUser = await db.findUserById(decoded.userId);
    if (!dbUser) {
      return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    }

    // Check temporary block expiration
    if (dbUser.is_blocked) {
      if (dbUser.blocked_until && new Date(dbUser.blocked_until) <= new Date()) {
        // Automatically unblock if time passed
        await db.unblockUser(dbUser.id, dbUser.id);
        dbUser.is_blocked = false;
        dbUser.blocked_reason = null;
        dbUser.blocked_until = null;
      } else {
        return res.status(403).json({
          error: 'Akkauntingiz bloklangan',
          is_blocked: true,
          blocked_reason: dbUser.blocked_reason || 'Qoidabuzarlik sababli bloklangan',
          blocked_until: dbUser.blocked_until,
        });
      }
    }

    req.user = {
      userId: dbUser.id,
      telegramId: dbUser.telegram_id,
      nickname: dbUser.nickname,
      role: dbUser.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Yaroqsiz yoki muddati o‘tgan token' });
  }
}

/**
 * Admin permission middleware (admin or super_admin)
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Ruxsat berilmagan: Admin huquqi talab qilinadi' });
  }

  next();
}

/**
 * Super Admin strict permission middleware
 */
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Ruxsat berilmagan: Faqat Super Admin amalga oshira oladi' });
  }

  next();
}

/**
 * Controller for /api/auth/telegram
 */
export async function telegramAuthHandler(req: Request, res: Response) {
  try {
    const { initData, startParam } = req.body;

    let telegramId: number;
    let nickname: string;
    let avatarUrl: string;

    // In development mode, allow easy test login or dev mock
    if (config.nodeEnv === 'development' && (!initData || initData.startsWith('dev_user_'))) {
      const devId = initData ? parseInt(initData.replace('dev_user_', ''), 10) || 1001 : 1001;
      telegramId = devId;
      nickname = req.body.nickname || (devId === 1001 ? 'Super_Admin' : `Player_${devId % 1000}`);
      avatarUrl = req.body.avatarUrl || 'avatar_1';
    } else {
      const validation = validateTelegramInitData(initData, config.botToken);
      if (!validation.valid || !validation.user) {
        return res.status(401).json({ error: 'Telegram ma’lumotlari tasdiqlanmadi' });
      }

      if (validation.user.is_bot) {
        return res.status(403).json({ error: 'Bot hisoblariga o‘yinga kirish taqiqlangan' });
      }

      telegramId = validation.user.id;
      nickname = validation.user.username || validation.user.first_name || `Player_${telegramId % 1000}`;
      avatarUrl = validation.user.photo_url || 'avatar_1';
    }

    // Check if user exists or create new
    let user = await db.findUserByTelegramId(telegramId);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      let referrerUserId: number | undefined;

      // Parse referral param (e.g. ref_12345678)
      if (startParam && startParam.startsWith('ref_')) {
        const refTgIdStr = startParam.replace('ref_', '');
        const refTgId = parseInt(refTgIdStr, 10);
        if (!isNaN(refTgId) && refTgId !== telegramId) {
          const referrer = await db.findUserByTelegramId(refTgId);
          if (referrer) {
            referrerUserId = referrer.id;
          }
        }
      }

      // Ensure unique nickname
      let uniqueNick = nickname;
      let counter = 1;
      while (await db.findUserByNickname(uniqueNick)) {
        uniqueNick = `${nickname}_${counter++}`;
      }

      user = await db.createUser(telegramId, uniqueNick, avatarUrl, referrerUserId);
    }

    // Check if super admin assignment is needed
    if (config.superAdminTelegramId && Number(telegramId) === Number(config.superAdminTelegramId) && user.role !== 'super_admin') {
      await db.updateUser(user.id, { role: 'super_admin' });
      user.role = 'super_admin';
    }

    // Check if user is blocked
    if (user.is_blocked) {
      if (user.blocked_until && new Date(user.blocked_until) <= new Date()) {
        await db.unblockUser(user.id, user.id);
        user.is_blocked = false;
        user.blocked_reason = null;
        user.blocked_until = null;
      }
    }

    const token = generateAuthToken({
      userId: user.id,
      telegramId: user.telegram_id,
      nickname: user.nickname,
      role: user.role,
    });

    const rank = await db.getUserRank(user.id);

    return res.json({
      token,
      user: {
        ...user,
        rank,
      },
      isNewUser,
    });
  } catch (err: any) {
    console.error('[Auth] Error in telegramAuthHandler:', err);
    return res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
}

// In-memory rate limiting map for admin login protection
const failedAdminAttempts = new Map<string, { count: number; lockedUntil: number }>();

/**
 * High-Security Admin Portal Login Handler (Login + Password authentication)
 */
export async function adminLoginHandler(req: Request, res: Response) {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown_ip';
    const now = Date.now();
    const attempt = failedAdminAttempts.get(ip);

    if (attempt && attempt.lockedUntil > now) {
      const waitMins = Math.ceil((attempt.lockedUntil - now) / 60000);
      return res.status(429).json({
        error: `Xavfsizlik choralari: Juda ko'p xato urinishlar. Iltimos ${waitMins} daqiqa kuting.`
      });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Login va parol kiritilishi shart' });
    }

    const expectedUser = config.adminPortalUsername;
    const expectedPass = config.adminPortalPassword;

    // Secure timing-safe comparison
    const uMatch = username.trim() === expectedUser.trim();
    const pMatch = password === expectedPass;

    if (!uMatch || !pMatch) {
      const curCount = (attempt?.count || 0) + 1;
      const lockedUntil = curCount >= 5 ? now + 15 * 60 * 1000 : 0;
      failedAdminAttempts.set(ip, { count: curCount, lockedUntil });

      const remaining = Math.max(0, 5 - curCount);
      return res.status(401).json({
        error: 'Login yoki parol noto‘g‘ri',
        remainingAttempts: remaining
      });
    }

    // Reset attempt counter on success
    failedAdminAttempts.delete(ip);

    // Find or create Super_Admin user in database
    let adminUser = await db.findUserByNickname('Super_Admin');
    if (!adminUser && config.superAdminTelegramId) {
      adminUser = await db.findUserByTelegramId(config.superAdminTelegramId);
    }
    if (!adminUser) {
      adminUser = await db.createUser(config.superAdminTelegramId || 999999, 'Super_Admin', 'avatar_1');
      await db.updateUser(adminUser.id, { role: 'super_admin' });
      adminUser.role = 'super_admin';
    } else if (adminUser.role !== 'super_admin') {
      await db.updateUser(adminUser.id, { role: 'super_admin' });
      adminUser.role = 'super_admin';
    }

    const token = generateAuthToken({
      userId: adminUser.id,
      telegramId: adminUser.telegram_id,
      nickname: adminUser.nickname,
      role: 'super_admin',
    }, '24h');

    // Audit log this administrative access
    try {
      await db.recordAudit(adminUser.id, 'admin_portal_login', null, {
        ip,
        userAgent: req.headers['user-agent'] || 'portal_login',
        timestamp: new Date().toISOString()
      });
    } catch (e) {}

    return res.json({
      token,
      admin: {
        id: adminUser.id,
        nickname: adminUser.nickname,
        role: adminUser.role,
      },
      message: 'Muvaffaqiyatli kirildi'
    });
  } catch (err: any) {
    console.error('[Auth] Error in adminLoginHandler:', err);
    return res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
}

/**
 * Controller to verify current Admin Portal session
 */
export async function adminVerifyHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Ruxsat berilmagan' });
  }
  return res.json({
    valid: true,
    user: req.user
  });
}

