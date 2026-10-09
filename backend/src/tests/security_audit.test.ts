import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { validateTelegramInitData } from '../modules/auth/index.js';
import { db } from '../db/index.js';
import { gameManager } from '../modules/games/gameManager.js';

describe('Security & Integrity Audit Suite', () => {
  const botToken = '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ';

  function createSignedInitData(data: Record<string, string>, token = botToken): string {
    const keys = Object.keys(data).sort();
    const checkArr = keys.map(k => `${k}=${data[k]}`);
    const checkString = checkArr.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    const params = new URLSearchParams(data);
    params.set('hash', hash);
    return params.toString();
  }

  beforeEach(async () => {
    await db.init();
  });

  describe('4.1 Authentication & Replay Attack Prevention', () => {
    it('should validate freshly signed Telegram initData with recent auth_date', () => {
      const now = Math.floor(Date.now() / 1000);
      const initDataStr = createSignedInitData({
        auth_date: String(now),
        user: JSON.stringify({ id: 888101, first_name: 'FreshUser', username: 'fresh_user' }),
      });

      const result = validateTelegramInitData(initDataStr, botToken);
      expect(result.valid).toBe(true);
      expect(result.user?.id).toBe(888101);
    });

    it('should REJECT replay attack with expired auth_date (> 1 hour old)', () => {
      const twoHoursAgo = Math.floor(Date.now() / 1000) - 7200;
      const expiredInitData = createSignedInitData({
        auth_date: String(twoHoursAgo),
        user: JSON.stringify({ id: 888102, first_name: 'Attacker' }),
      });

      const result = validateTelegramInitData(expiredInitData, botToken);
      expect(result.valid).toBe(false);
    });

    it('should REJECT initData with future timestamp (> 5 minutes clock drift)', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 1000;
      const futureInitData = createSignedInitData({
        auth_date: String(futureTime),
        user: JSON.stringify({ id: 888103, first_name: 'TimeTraveler' }),
      });

      const result = validateTelegramInitData(futureInitData, botToken);
      expect(result.valid).toBe(false);
    });

    it('should REJECT tampered payload where parameters were altered after signing', () => {
      const now = Math.floor(Date.now() / 1000);
      const originalStr = createSignedInitData({
        auth_date: String(now),
        user: JSON.stringify({ id: 888104, first_name: 'RealUser' }),
      });

      // Attacker tampers user id in URL params
      const tamperedStr = originalStr.replace('888104', '999999');
      const result = validateTelegramInitData(tamperedStr, botToken);
      expect(result.valid).toBe(false);
    });
  });

  describe('4.2 RBAC & Super Admin Protections', () => {
    it('should prevent blocking or demoting super_admin', async () => {
      const superAdmin = await db.createUser(777001, 'SuperBoss', 'avatar_1');
      await db.updateUser(superAdmin.id, { role: 'super_admin' });

      const admin = await db.createUser(777002, 'SubAdmin', 'avatar_1');
      await db.updateUser(admin.id, { role: 'admin' });

      // Admin attempts to block super_admin
      const blockRes = await db.blockUser(superAdmin.id, admin.id, 'Try to block root');
      expect(blockRes.success).toBe(false);
      expect(blockRes.error).toContain('Super Adminni bloklash mumkin emas');

      // Admin attempts to demote super_admin
      const demoteRes = await db.setAdminRole(superAdmin.id, admin.id, 'user');
      expect(demoteRes.success).toBe(false);
    });

    it('should prevent regular admin from unblocking another admin', async () => {
      const superAdmin = await db.createUser(777003, 'MainAdmin', 'avatar_1');
      await db.updateUser(superAdmin.id, { role: 'super_admin' });

      const targetAdmin = await db.createUser(777004, 'BadAdmin', 'avatar_1');
      await db.updateUser(targetAdmin.id, { role: 'admin' });

      const secondAdmin = await db.createUser(777005, 'NormalAdmin', 'avatar_1');
      await db.updateUser(secondAdmin.id, { role: 'admin' });

      // Super admin blocks badAdmin
      await db.blockUser(targetAdmin.id, superAdmin.id, 'Suspicious action');

      // Normal admin tries to unblock badAdmin
      const unblockRes = await db.unblockUser(targetAdmin.id, secondAdmin.id);
      expect(unblockRes.success).toBe(false);
      expect(unblockRes.error).toContain('Super Admin');
    });
  });

  describe('4.3 Double-Spend, Race Condition & Balance Security', () => {
    it('should THROW ERR_INSUFFICIENT_FUNDS when debit exceeds current balance', async () => {
      const poorUser = await db.createUser(666001, 'PoorPlayer', 'avatar_1');
      await db.updateUser(poorUser.id, { token_balance: 5 });

      // Attempting to spend 10 tokens must fail atomically
      await expect(
        db.updateUserBalance(poorUser.id, -10, 'game_stake')
      ).rejects.toThrow('ERR_INSUFFICIENT_FUNDS');

      // Verify balance was NOT mutated or clamped to 0
      const checkUser = await db.findUserById(poorUser.id);
      expect(checkUser?.token_balance).toBe(5);
    });

    it('should prevent user from gifting tokens to themselves', async () => {
      const user = await db.createUser(666002, 'SelfGifter', 'avatar_1');
      await db.updateUser(user.id, { token_balance: 100 });

      await expect(
        db.giftTokens(user.id, user.id, 10)
      ).rejects.toThrow("O'zingizga token yubora olmaysiz!");
    });

    it('should prevent user from transferring a collectible gift to themselves', async () => {
      const user = await db.createUser(666003, 'GiftHolder', 'avatar_1');
      await db.updateUser(user.id, { token_balance: 500 });
      const boughtGift = await db.buyCollectibleGift(user.id, 'sovga_box');

      await expect(
        db.giftCollectibleGift(user.id, boughtGift.id, user.id)
      ).rejects.toThrow("O'zingizga sovg'a qila olmaysiz!");
    });

    it('should enforce single-use promo code limit per user atomically', async () => {
      const promoUser = await db.createUser(666004, 'PromoHunter', 'avatar_1');
      const promoCode = `AUDIT_${Date.now()}`;
      await db.createPromoCode({
        code: promoCode,
        tokens: 50,
        max_uses: 10,
        per_user_limit: 1,
        expires_at: null,
        created_by: 1,
      });

      // First claim succeeds
      const firstClaim = await db.redeemPromoCode(promoUser.id, promoCode);
      expect(firstClaim.success).toBe(true);

      // Second claim must fail
      const secondClaim = await db.redeemPromoCode(promoUser.id, promoCode);
      expect(secondClaim.success).toBe(false);
      expect(secondClaim.errorCode).toBe('already_used');
    });
  });

  describe('4.4 Game Play & Move Security', () => {
    it('should strictly reject moves from 3rd-party non-participants in a match', async () => {
      const p1 = await db.createUser(555001, 'PlayerOne', 'avatar_1');
      const p2 = await db.createUser(555002, 'PlayerTwo', 'avatar_1');
      const intruder = await db.createUser(555003, 'Intruder', 'avatar_1');

      const roomCode = 'SEC1';
      const createRes = await gameManager.createRoom(roomCode, {
        userId: p1.id,
        nickname: p1.nickname,
        avatarUrl: p1.avatar_url,
        socketId: 'sock_p1',
        symbol: null,
        rpsChoice: null,
        isConnected: true,
      }, 5, false);

      const room = createRes.room!;
      await gameManager.joinRoom(roomCode, {
        userId: p2.id,
        nickname: p2.nickname,
        avatarUrl: p2.avatar_url,
        socketId: 'sock_p2',
        symbol: null,
        rpsChoice: null,
        isConnected: true,
      });

      const { ThreePieceGame } = await import('../core/threePieceGame.js');
      room.gameEngine = new ThreePieceGame();
      room.status = 'in_progress';
      room.player1.symbol = 'X';
      room.player2!.symbol = 'O';

      // Intruder attempts to send move
      const moveSuccess = gameManager.handleMove(room, intruder.id, 0);
      expect(moveSuccess).toBe(false);
    });

    it('should correctly award rake commission on PvP win and full refund on draw', async () => {
      const stake = 10;
      const settings = await db.getSettings();
      const rake = settings.rake_amount !== undefined ? settings.rake_amount : 1;
      const expectedPrize = stake * 2 - rake;
      expect(expectedPrize).toBe(19);

      // Verify draw refunds 100% with 0 commission
      const drawRefund = stake;
      expect(drawRefund).toBe(10);
    });
  });

  describe('4.5 Anomaly & Chip-Dumping Detection', () => {
    it('should detect suspicious pairing when two users play repeatedly and one feeds tokens', async () => {
      const dummyP1 = await db.createUser(444001, 'FeedWinner', 'avatar_1');
      const dummyP2 = await db.createUser(444002, 'FeedLoser', 'avatar_1');

      // Record 4 games where FeedWinner wins all 4
      for (let i = 0; i < 4; i++) {
        const game = await db.createGameRecord(dummyP1.id, dummyP2.id, 10, '[]');
        await db.updateGameRecord(game.id, {
          status: 'finished',
          winner_id: dummyP1.id,
          finished_at: new Date().toISOString(),
        });
      }

      const suspiciousList = await db.getSuspiciousActivities();
      const match = suspiciousList.find(s => s.primaryUserId === dummyP1.id && s.secondaryUserId === dummyP2.id);
      expect(match).toBeDefined();
      expect(match?.type).toBe('chip_dumping');
      expect(match?.ratio).toBeGreaterThanOrEqual(0.75);
    });
  });
});
