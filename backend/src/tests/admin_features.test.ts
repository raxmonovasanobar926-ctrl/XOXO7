import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../db/index.js';
import { gameManager, RoomPlayer } from '../modules/games/gameManager.js';
import { executeAirdrop } from '../modules/gifts/index.js';

describe('Admin, Promo, Gifts and Stars In-Depth Tests', () => {
  let superAdmin: any;
  let adminUser: any;
  let regularUser1: any;
  let regularUser2: any;

  beforeAll(async () => {
    await db.init();
    superAdmin = await db.createUser(7770001, 'OwnerSuperAdmin', 'avatar_5');
    await db.updateUser(superAdmin.id, { role: 'super_admin' });

    adminUser = await db.createUser(7770002, 'SubAdminOne', 'avatar_4');
    await db.updateUser(adminUser.id, { role: 'admin' });

    regularUser1 = await db.createUser(7770003, 'RegularGamer1', 'avatar_1');
    regularUser2 = await db.createUser(7770004, 'RegularGamer2', 'avatar_2');
  });

  describe('1. RBAC & Super Admin Protections', () => {
    it('super_admin cannot be blocked', async () => {
      const res = await db.blockUser(superAdmin.id, adminUser.id, 'Test block');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Super Adminni bloklash mumkin emas');
    });

    it('admin cannot block another admin', async () => {
      const secondAdmin = await db.createUser(7770005, 'SubAdminTwo', 'avatar_4');
      await db.updateUser(secondAdmin.id, { role: 'admin' });

      const res = await db.blockUser(secondAdmin.id, adminUser.id, 'Block rival admin');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Super Admin tomonidan');
    });

    it('super_admin CAN block an admin or user', async () => {
      const targetUser = await db.createUser(7770006, 'CheaterUser', 'avatar_3');
      const res = await db.blockUser(targetUser.id, superAdmin.id, 'Qoidabuzarlik');
      expect(res.success).toBe(true);

      const updated = await db.findUserById(targetUser.id);
      expect(updated?.is_blocked).toBe(true);
      expect(updated?.blocked_reason).toBe('Qoidabuzarlik');
    });

    it('super_admin role cannot be changed or demoted', async () => {
      const res = await db.setAdminRole(superAdmin.id, superAdmin.id, 'user');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Super Admin rolini o‘zgartirib bo‘lmaydi');
    });
  });

  describe('2. Promo Code Limits & Race-Condition Safe Redemption', () => {
    const testPromoCode = `RACE_TEST_${Date.now()}`;
    let testPromo: any;

    it('creates promo code with max_uses limit', async () => {
      const res = await db.createPromoCode({
        code: testPromoCode,
        tokens: 50,
        max_uses: 2,
        per_user_limit: 1,
        created_by: superAdmin.id,
      });
      expect(res.success).toBe(true);
      testPromo = res.promo;
    });

    it('allows redemption within limit', async () => {
      const initialBal = (await db.findUserById(regularUser1.id))?.token_balance || 0;
      const res = await db.redeemPromoCode(regularUser1.id, testPromoCode);
      expect(res.success).toBe(true);
      expect(res.tokens).toBe(50);
      expect(res.newBalance).toBe(initialBal + 50);
    });

    it('prevents same user from redeeming twice when per_user_limit is 1', async () => {
      const res = await db.redeemPromoCode(regularUser1.id, testPromoCode);
      expect(res.success).toBe(false);
      expect(res.error).toContain('allaqachon foydalangansiz');
    });

    it('second user consumes remaining usage reaching max_uses', async () => {
      const res = await db.redeemPromoCode(regularUser2.id, testPromoCode);
      expect(res.success).toBe(true);
    });

    it('third user is rejected because max_uses is exhausted', async () => {
      const user3 = await db.createUser(Date.now() + 7770007, 'UserThree', 'avatar_1');
      const res = await db.redeemPromoCode(user3.id, testPromoCode);
      expect(res.success).toBe(false);
      expect(res.error).toContain('limiti tugagan');
    });
  });

  describe('3. Stars Payment Idempotency & Refund', () => {
    const chargeId = `tg_charge_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    it('credits tokens on successful payment', async () => {
      const initialBal = (await db.findUserById(regularUser1.id))?.token_balance || 0;
      const res = await db.recordStarPayment(regularUser1.id, 2, 50, 60, chargeId);
      expect(res.success).toBe(true);

      const updated = await db.findUserById(regularUser1.id);
      expect(updated?.token_balance).toBe(initialBal + 60);
    });

    it('idempotent: duplicate payment update does NOT credit tokens twice', async () => {
      const balBefore = (await db.findUserById(regularUser1.id))?.token_balance || 0;
      const res = await db.recordStarPayment(regularUser1.id, 2, 50, 60, chargeId);
      expect(res.success).toBe(true);

      const balAfter = (await db.findUserById(regularUser1.id))?.token_balance || 0;
      expect(balAfter).toBe(balBefore); // Balances are identical!
    });

    it('refunds payment, deducts granted tokens and updates status', async () => {
      const allPayments = await db.getAllStarPayments();
      const payment = allPayments.find(p => p.telegram_payment_charge_id === chargeId);
      expect(payment).toBeDefined();

      const balBefore = (await db.findUserById(regularUser1.id))?.token_balance || 0;
      const refundRes = await db.refundStarPayment(payment.id, superAdmin.id);
      expect(refundRes.success).toBe(true);

      const balAfter = (await db.findUserById(regularUser1.id))?.token_balance || 0;
      expect(balAfter).toBe(balBefore - 60);
    });
  });

  describe('4. Blocking User & Active Game Cancellation', () => {
    it('cancels active game and refunds opponent when user is blocked', async () => {
      const pA = await db.createUser(7770010, 'PlayerA_Test', 'avatar_1');
      const pB = await db.createUser(7770011, 'PlayerB_Test', 'avatar_2');

      const roomPlayerA: RoomPlayer = {
        userId: pA.id,
        nickname: pA.nickname,
        avatarUrl: pA.avatar_url,
        socketId: 'sock_A',
        symbol: 'X',
        rpsChoice: null,
        isConnected: true,
      };

      const roomPlayerB: RoomPlayer = {
        userId: pB.id,
        nickname: pB.nickname,
        avatarUrl: pB.avatar_url,
        socketId: 'sock_B',
        symbol: 'O',
        rpsChoice: null,
        isConnected: true,
      };

      const roomId = 'active_game_block_test';
      await gameManager.createRoom(roomId, roomPlayerA, 5, false);
      await gameManager.joinRoom(roomId, roomPlayerB);

      const room = gameManager.getRoom(roomId)!;
      room.status = 'in_progress';

      // Record balance of pB before block
      const pBBalBefore = (await db.findUserById(pB.id))?.token_balance || 0;

      // Block player A
      await db.blockUser(pA.id, superAdmin.id, 'Caught exploiting');
      await gameManager.terminateActiveGameForUser(pA.id, 'Bloklangan');

      expect(room.status).toBe('abandoned');

      // Opponent (pB) was refunded their 5 tokens
      const pBBalAfter = (await db.findUserById(pB.id))?.token_balance || 0;
      expect(pBBalAfter).toBe(pBBalBefore + 5);
    });

    it('blocked user is excluded from leaderboard', async () => {
      const leaderboard = await db.getIndividualLeaderboard();
      const blockedFound = leaderboard.find(u => u.nickname === 'PlayerA_Test');
      expect(blockedFound).toBeUndefined();
    });
  });

  describe('5. Gifts Airdrop Execution', () => {
    it('executes airdrop and credits tokens', async () => {
      const u = await db.createUser(7770020, 'GiftRecipient', 'avatar_1');
      const balBefore = u.token_balance;

      const res = await executeAirdrop(
        superAdmin.id,
        'single',
        15,
        'Weekly Community Gift',
        'Bonus!',
        { singleUserId: u.id }
      );

      expect(res.recipientsCount).toBe(1);

      // Wait a tick for async delivery
      await new Promise(r => setTimeout(r, 150));

      const updated = await db.findUserById(u.id);
      expect(updated?.token_balance).toBe(balBefore + 15);
    });
  });
});
