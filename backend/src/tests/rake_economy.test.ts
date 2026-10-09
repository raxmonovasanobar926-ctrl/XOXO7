import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/index.js';
import { gameManager, RoomPlayer } from '../modules/games/gameManager.js';
import { botTranslations } from '../bot/i18n.js';

describe('PvP Platform Commission (Rake) Economy Rules', () => {
  beforeEach(async () => {
    // Reset settings rake_amount to 1
    const s = await db.getSettings();
    if (s.rake_amount !== 1) {
      await db.updateSettings(1001, { rake_amount: 1 });
    }
  });

  it('1. Payout formula calculates exactly 3, 7, 11, 19 for stakes 2, 4, 6, 10 with rake = 1', async () => {
    const stakes = [2, 4, 6, 10];
    const expectedPayouts = [3, 7, 11, 19];
    const settings = await db.getSettings();
    const rake = Number(settings.rake_amount ?? 1);
    expect(rake).toBe(1);

    for (let i = 0; i < stakes.length; i++) {
      const stake = stakes[i];
      const payout = stake * 2 - rake;
      expect(payout).toBe(expectedPayouts[i]);
      expect(payout).toBeGreaterThanOrEqual(stake);
    }
  });

  it('2. PvP game win credits payout (stake*2 - rake) and records entry in rake_ledger', async () => {
    const u1 = await db.createUser(9991001, `RakeTester1_${Date.now()}`, 'fox');
    const u2 = await db.createUser(9991002, `RakeTester2_${Date.now()}`, 'ninja');

    const stake = 2; // Entry stake
    const roomId = `room_rake_${Date.now()}_${Math.random()}`;
    const p1: RoomPlayer = {
      userId: u1.id,
      nickname: u1.nickname,
      avatarUrl: u1.avatar_url,
      socketId: 'sock_p1',
      symbol: 'X',
      rpsChoice: null,
      isConnected: true,
    };
    const p2: RoomPlayer = {
      userId: u2.id,
      nickname: u2.nickname,
      avatarUrl: u2.avatar_url,
      socketId: 'sock_p2',
      symbol: 'O',
      rpsChoice: null,
      isConnected: true,
    };

    const createRes = await gameManager.createRoom(roomId, p1, stake, false);
    expect(createRes.success).toBe(true);
    await gameManager.joinRoom(roomId, p2);

    const room = gameManager.getRoom(roomId)!;
    await gameManager.startRPSStage(room);
    room.player1.symbol = 'X';
    if (room.player2) room.player2.symbol = 'O';

    const u1BalAfterStake = (await db.findUserById(u1.id))?.token_balance || 0;
    const u2BalAfterStake = (await db.findUserById(u2.id))?.token_balance || 0;

    const rakesBefore = (await db.getRakeStats()).totalRake;

    // Trigger game over with winner = X (u1)
    await (gameManager as any).handleGameOver(room, 'X');

    const winnerUser = await db.findUserById(u1.id);
    const loserUser = await db.findUserById(u2.id);

    // Winner gets payout = stake * 2 - rake = 2 * 2 - 1 = 3
    expect(winnerUser?.token_balance).toBe(u1BalAfterStake + 3);
    // Loser remains unchanged after losing their stake
    expect(loserUser?.token_balance).toBe(u2BalAfterStake);

    // Verify rake_ledger recorded 1 stone
    const rakesAfter = (await db.getRakeStats()).totalRake;
    expect(rakesAfter).toBe(rakesBefore + 1);

    // Check recent games history includes prize and rake
    const history = await db.getRecentGames(u1.id, 1);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].result).toBe('win');
    expect(history[0].prize).toBe(3);
    expect(history[0].rake).toBe(1);
  });

  it('3. Draws do NOT collect commission and refund stakes fully', async () => {
    const u1 = await db.createUser(9991003, `DrawTester1_${Date.now()}`, 'fox');
    const u2 = await db.createUser(9991004, `DrawTester2_${Date.now()}`, 'ninja');

    const stake = 6;
    const roomId = `room_draw_${Date.now()}_${Math.random()}`;
    const p1: RoomPlayer = {
      userId: u1.id,
      nickname: u1.nickname,
      avatarUrl: u1.avatar_url,
      socketId: 'sock_p1',
      symbol: 'X',
      rpsChoice: null,
      isConnected: true,
    };
    const p2: RoomPlayer = {
      userId: u2.id,
      nickname: u2.nickname,
      avatarUrl: u2.avatar_url,
      socketId: 'sock_p2',
      symbol: 'O',
      rpsChoice: null,
      isConnected: true,
    };

    await gameManager.createRoom(roomId, p1, stake, false);
    await gameManager.joinRoom(roomId, p2);

    const room = gameManager.getRoom(roomId)!;
    await gameManager.startRPSStage(room);

    const u1BalAfterStake = (await db.findUserById(u1.id))?.token_balance || 0;
    const u2BalAfterStake = (await db.findUserById(u2.id))?.token_balance || 0;

    const rakesBefore = (await db.getRakeStats()).totalRake;

    // Trigger draw
    await (gameManager as any).handleGameDraw(room);

    // Full stake refunded
    expect((await db.findUserById(u1.id))?.token_balance).toBe(u1BalAfterStake + stake);
    expect((await db.findUserById(u2.id))?.token_balance).toBe(u2BalAfterStake + stake);

    // Rake ledger unchanged
    const rakesAfter = (await db.getRakeStats()).totalRake;
    expect(rakesAfter).toBe(rakesBefore);

    // Recent game history for draw
    const history = await db.getRecentGames(u1.id, 1);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].result).toBe('draw');
    expect(history[0].rake).toBe(0);
  });

  it('4. Surrender / forfeit applies the standard PvP rake rule', async () => {
    const u1 = await db.createUser(9991005, `SurrenderP1_${Date.now()}`, 'fox');
    const u2 = await db.createUser(9991006, `SurrenderP2_${Date.now()}`, 'ninja');

    const stake = 4;
    const roomId = `room_surrender_${Date.now()}_${Math.random()}`;
    const p1: RoomPlayer = {
      userId: u1.id,
      nickname: u1.nickname,
      avatarUrl: u1.avatar_url,
      socketId: 'sock_p1',
      symbol: 'X',
      rpsChoice: null,
      isConnected: true,
    };
    const p2: RoomPlayer = {
      userId: u2.id,
      nickname: u2.nickname,
      avatarUrl: u2.avatar_url,
      socketId: 'sock_p2',
      symbol: 'O',
      rpsChoice: null,
      isConnected: true,
    };

    await gameManager.createRoom(roomId, p1, stake, false);
    await gameManager.joinRoom(roomId, p2);

    const room = gameManager.getRoom(roomId)!;
    await gameManager.startRPSStage(room);
    room.player1.symbol = 'X';
    if (room.player2) room.player2.symbol = 'O';
    room.status = 'in_progress';

    const u1BalAfterStake = (await db.findUserById(u1.id))?.token_balance || 0;
    const u2BalAfterStake = (await db.findUserById(u2.id))?.token_balance || 0;

    const rakesBefore = (await db.getRakeStats()).totalRake;

    // Player 2 surrenders
    await gameManager.surrender(room.roomId, u2.id);

    // Winner is Player 1 (X)
    // Payout = 4 * 2 - 1 = 7
    expect((await db.findUserById(u1.id))?.token_balance).toBe(u1BalAfterStake + 7);
    expect((await db.findUserById(u2.id))?.token_balance).toBe(u2BalAfterStake);

    const rakesAfter = (await db.getRakeStats()).totalRake;
    expect(rakesAfter).toBe(rakesBefore + 1);
  });

  it('5. AI opponent games do NOT collect rake and follow AI reward rules', async () => {
    const u1 = await db.createUser(9991007, `AiTester_${Date.now()}`, 'fox');

    const createRes = await gameManager.createAIGame(u1.id, 'easy', 'sock_ai_test');
    expect(createRes.success).toBe(true);
    const aiRoom = createRes.room!;
    expect(aiRoom.isAiGame).toBe(true);

    const rakesBefore = (await db.getRakeStats()).totalRake;

    // Simulate AI win for human player (Pebble easy level: stake 1, win_reward 1)
    await (gameManager as any).handleGameOver(aiRoom, 'X');

    const rakesAfter = (await db.getRakeStats()).totalRake;
    // Rake must NOT increase for AI game
    expect(rakesAfter).toBe(rakesBefore);
  });

  it('6. Dynamic settings: modifying rake_amount changes payout for future games and persists history', async () => {
    const u1 = await db.createUser(9991008, `DynTester1_${Date.now()}`, 'fox');
    const u2 = await db.createUser(9991009, `DynTester2_${Date.now()}`, 'ninja');

    // Test with rake_amount = 0 (no commission)
    await db.updateSettings(1001, { rake_amount: 0 });
    const settings = await db.getSettings();
    expect(settings.rake_amount).toBe(0);

    const stake = 10;
    await db.updateUserBalance(u1.id, -stake, 'game_stake');
    await db.updateUserBalance(u2.id, -stake, 'game_stake');

    const u1BalBefore = (await db.findUserById(u1.id))?.token_balance || 0;

    const roomId = `room_dyn_${Date.now()}_${Math.random()}`;
    const p1: RoomPlayer = {
      userId: u1.id,
      nickname: u1.nickname,
      avatarUrl: u1.avatar_url,
      socketId: 'sock_p1',
      symbol: 'X',
      rpsChoice: null,
      isConnected: true,
    };
    const p2: RoomPlayer = {
      userId: u2.id,
      nickname: u2.nickname,
      avatarUrl: u2.avatar_url,
      socketId: 'sock_p2',
      symbol: 'O',
      rpsChoice: null,
      isConnected: true,
    };

    await gameManager.createRoom(roomId, p1, stake, false);
    await gameManager.joinRoom(roomId, p2);

    const room = gameManager.getRoom(roomId)!;
    room.player1.symbol = 'X';
    if (room.player2) room.player2.symbol = 'O';

    await (gameManager as any).handleGameOver(room, 'X');

    // With rake = 0, winner gets 10 * 2 = 20
    expect((await db.findUserById(u1.id))?.token_balance).toBe(u1BalBefore + 20);

    // Reset rake_amount back to 1
    await db.updateSettings(1001, { rake_amount: 1 });
  });

  it('7. Rake stats breakdown by stake level and 30-day aggregation', async () => {
    const stats = await db.getRakeStats();
    expect(stats).toHaveProperty('totalRake');
    expect(stats).toHaveProperty('todayRake');
    expect(stats).toHaveProperty('weekRake');
    expect(stats).toHaveProperty('monthRake');
    expect(stats).toHaveProperty('byStake');
    expect(stats).toHaveProperty('dailyRake');

    expect(Array.isArray(stats.byStake)).toBe(true);
    expect(stats.byStake.length).toBe(4); // 2, 4, 6, 10
    expect(stats.byStake.map((s: any) => s.stake)).toEqual([2, 4, 6, 10]);
    expect(stats.dailyRake.length).toBe(30);
  });

  it('8. Bot /terms includes the platform commission clause in all 3 languages (uz, ru, en)', () => {
    expect(botTranslations.uz.terms).toContain('platforma komissiyasi');
    expect(botTranslations.uz.terms).toContain('stake × 2 − 1');
    expect(botTranslations.uz.terms).toContain('Durrangda komissiya olinmaydi');

    expect(botTranslations.ru.terms).toContain('комиссией платформы');
    expect(botTranslations.ru.terms).toContain('ставка × 2 − 1');
    expect(botTranslations.ru.terms).toContain('При ничьей комиссия не взимается');

    expect(botTranslations.en.terms).toContain('platform commission');
    expect(botTranslations.en.terms).toContain('stake × 2 − 1');
    expect(botTranslations.en.terms).toContain('In case of a draw, no commission is charged');
  });
});
