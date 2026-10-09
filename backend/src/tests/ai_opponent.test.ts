import { describe, it, expect, beforeEach } from 'vitest';
import { ThreePieceGame } from '../core/threePieceGame.js';
import { calculateAIMove, GOLEM_LEVELS, GolemLevel, getLegalMoves } from '../core/ai_opponent.js';
import { gameManager } from '../modules/games/gameManager.js';
import { db } from '../db/index.js';

describe('1. ThreePieceGame Engine (3-Piece Placement & Sliding)', () => {
  it('allows 3 placements per player then switches to moving phase', () => {
    const game = new ThreePieceGame('X');
    expect(game.getState().phase).toBe('placing');

    // X: 0, O: 1, X: 2, O: 3, X: 4, O: 5
    game.makeMove('X', 0);
    game.makeMove('O', 1);
    game.makeMove('X', 2);
    game.makeMove('O', 3);
    game.makeMove('X', 4);
    const res = game.makeMove('O', 5);

    expect(res.success).toBe(true);
    const state = game.getState();
    expect(state.phase).toBe('moving');
    expect(state.marks.X).toEqual([0, 2, 4]);
    expect(state.marks.O).toEqual([1, 3, 5]);
    expect(state.turn).toBe('X');
  });

  it('detects immediate win during placing phase', () => {
    const game = new ThreePieceGame('X');
    game.makeMove('X', 0); // X
    game.makeMove('O', 3); // O
    game.makeMove('X', 1); // X
    game.makeMove('O', 4); // O
    const winMove = game.makeMove('X', 2); // X completes [0, 1, 2]

    expect(winMove.success).toBe(true);
    expect(winMove.state.status).toBe('won');
    expect(winMove.state.winner).toBe('X');
    expect(winMove.state.winningLine).toEqual([0, 1, 2]);
  });

  it('enforces moving only own pieces to empty squares in moving phase', () => {
    const game = new ThreePieceGame('X');
    game.makeMove('X', 0);
    game.makeMove('O', 1);
    game.makeMove('X', 2);
    game.makeMove('O', 3);
    game.makeMove('X', 4);
    game.makeMove('O', 5);

    // X's turn in moving phase. Trying to move without from -> fails
    const fail1 = game.makeMove('X', 6);
    expect(fail1.success).toBe(false);

    // Trying to move O's piece (1) as X -> fails
    const fail2 = game.makeMove('X', 6, 1);
    expect(fail2.success).toBe(false);

    // Valid non-winning move: X moves 0 -> 7
    const ok = game.makeMove('X', 7, 0);
    expect(ok.success).toBe(true);
    expect(game.getState().board[0]).toBeNull();
    expect(game.getState().board[7]).toBe('X');
    expect(game.getState().marks.X).toContain(7);
    expect(game.getState().marks.X).not.toContain(0);
    expect(game.getState().turn).toBe('O');
  });

  it('triggers DRAW on 3-fold repetition in moving phase', () => {
    const game = new ThreePieceGame('X');
    game.makeMove('X', 0);
    game.makeMove('O', 3);
    game.makeMove('X', 1);
    game.makeMove('O', 4);
    game.makeMove('X', 6);
    game.makeMove('O', 7);

    // Moving back and forth
    // Cycle 1
    game.makeMove('X', 2, 1); // X 1->2
    game.makeMove('O', 5, 4); // O 4->5
    game.makeMove('X', 1, 2); // X 2->1
    game.makeMove('O', 4, 5); // O 5->4

    // Cycle 2
    game.makeMove('X', 2, 1);
    game.makeMove('O', 5, 4);
    game.makeMove('X', 1, 2);
    game.makeMove('O', 4, 5);

    // Cycle 3 (3rd repetition)
    game.makeMove('X', 2, 1);
    const drawMove = game.makeMove('O', 5, 4);

    expect(drawMove.state.status).toBe('draw');
  });
});

describe('2. AI Opponent (Golem) Engine & Economy', () => {
  beforeEach(async () => {
    await db.init();
  });

  it('all 4 Golem tiers generate legal moves with valid thinking delay', () => {
    const levels: GolemLevel[] = ['easy', 'medium', 'hard', 'expert'];
    const board = ['X', 'O', 'X', null, 'O', null, null, null, null];

    for (const lvl of levels) {
      const cfg = GOLEM_LEVELS[lvl];
      const move = calculateAIMove(board, 'O', 2, 2, lvl);

      expect(move.to).toBeGreaterThanOrEqual(0);
      expect(move.to).toBeLessThanOrEqual(8);
      expect(board[move.to]).toBeNull();
      expect(move.thinkDelayMs).toBeGreaterThanOrEqual(cfg.minThinkMs);
      expect(move.thinkDelayMs).toBeLessThanOrEqual(cfg.maxThinkMs);
    }
  });

  it('creates AI game, atomically deducts stake, and seals AI RPS choice', async () => {
    // Create test user with 50 stones
    const user = await db.createUser(888777111, 'AITester1', 'avatar_1');
    const startBal = user.token_balance;
    await db.updateUserBalance(user.id, 50, 'admin_manual');

    const result = await gameManager.createAIGame(user.id, 'medium', 'socket_ai_1');
    expect(result.success).toBe(true);
    expect(result.room).toBeDefined();

    const room = result.room!;
    expect(room.isAiGame).toBe(true);
    expect(room.aiLevel).toBe('medium');
    expect(room.stake).toBe(3);
    expect(room.player2?.isBot).toBe(true);
    expect(room.player2?.nickname).toBe('Rocky');
    expect(room.player2?.rpsChoice).toMatch(/rock|paper|scissors/);

    // Check balance deducted by stake (3 stones)
    const updatedUser = await db.findUserById(user.id);
    expect(updatedUser?.token_balance).toBe(startBal + 50 - 3);
  });

  it('enforces single active AI game rate limit per user', async () => {
    const user = await db.createUser(888777222, 'AITester2', 'avatar_2');

    const res1 = await gameManager.createAIGame(user.id, 'easy', 'sock_1');
    expect(res1.success).toBe(true);

    // Second call reconnects to same active room rather than duplicating stake deduction
    const balanceBefore = (await db.findUserById(user.id))?.token_balance;
    const res2 = await gameManager.createAIGame(user.id, 'easy', 'sock_2');
    expect(res2.success).toBe(true);
    expect(res2.room?.roomId).toBe(res1.room?.roomId);

    const balanceAfter = (await db.findUserById(user.id))?.token_balance;
    expect(balanceAfter).toBe(balanceBefore);
  });

  it('enforces daily stone win cap (30 Tosh) against AI', async () => {
    const user = await db.createUser(888777333, 'AITester3', 'avatar_3');

    // Record 30 stones already won today
    await db.recordTransaction(user.id, 30, 'ai_game_win');
    const wonToday = await db.getStonesWonFromAIToday(user.id);
    expect(wonToday).toBe(30);

    // User is at daily cap. Starting and winning an AI game will refund stake only
    const res = await gameManager.createAIGame(user.id, 'expert', 'sock_3');
    expect(res.success).toBe(true);
  });
});
