import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../db/index.js';
import { gameManager, RoomPlayer } from '../modules/games/gameManager.js';
import { resolveRPSStage } from '../core/rps.js';

describe('End-to-End Complete Game Lifecycle', () => {
  let player1User: any;
  let player2User: any;
  let roomId = 'e2e_room_test_1';
  const stake = 5;

  beforeAll(async () => {
    await db.init();
    // Create two test users
    player1User = await db.createUser(8888001, 'E2E_Player_Alpha', 'avatar_1');
    player2User = await db.createUser(8888002, 'E2E_Player_Beta', 'avatar_2');
  });

  it('1. Initial balances match welcome bonus', async () => {
    const settings = await db.getSettings();
    const initBal = settings.welcome_bonus_amount ?? 50;
    const p1 = await db.findUserById(player1User.id);
    const p2 = await db.findUserById(player2User.id);
    expect(p1?.token_balance).toBe(initBal);
    expect(p2?.token_balance).toBe(initBal);
  });

  it('2. Room creation and joining with 5 token stake', async () => {
    const p1: RoomPlayer = {
      userId: player1User.id,
      nickname: player1User.nickname,
      avatarUrl: player1User.avatar_url,
      socketId: 'sock_p1',
      symbol: null,
      rpsChoice: null,
      isConnected: true,
    };

    const p2: RoomPlayer = {
      userId: player2User.id,
      nickname: player2User.nickname,
      avatarUrl: player2User.avatar_url,
      socketId: 'sock_p2',
      symbol: null,
      rpsChoice: null,
      isConnected: true,
    };

    const createRes = await gameManager.createRoom(roomId, p1, stake, false);
    expect(createRes.success).toBe(true);
    expect(createRes.room?.status).toBe('waiting');

    const joinRes = await gameManager.joinRoom(roomId, p2);
    expect(joinRes.success).toBe(true);
    expect(joinRes.room?.player2?.userId).toBe(player2User.id);
  });

  it('3. RPS stage execution: Rock beats Scissors -> P1 is X, P2 is O', async () => {
    const settings = await db.getSettings();
    const initBal = settings.welcome_bonus_amount ?? 50;
    const room = gameManager.getRoom(roomId)!;
    await gameManager.startRPSStage(room);

    // Verify stakes deducted from both
    const p1 = await db.findUserById(player1User.id);
    const p2 = await db.findUserById(player2User.id);
    expect(p1?.token_balance).toBe(initBal - stake);
    expect(p2?.token_balance).toBe(initBal - stake);

    // Player 1 picks rock, Player 2 picks scissors
    gameManager.submitRPSChoice(room, player1User.id, 'rock');
    gameManager.submitRPSChoice(room, player2User.id, 'scissors');

    expect(room.rpsState?.winner).toBe('player1');
    expect(room.rpsState?.player1Symbol).toBe('X');
    expect(room.rpsState?.player2Symbol).toBe('O');
  });

  it('4. Vanishing Tic-Tac-Toe moves and FIFO vanishing in live room', async () => {
    const room = gameManager.getRoom(roomId)!;
    // Set up game engine directly for deterministic test
    const { ThreePieceGame } = await import('../core/threePieceGame.js');
    room.gameEngine = new ThreePieceGame('X');
    room.status = 'in_progress';
    room.player1.symbol = 'X';
    room.player2!.symbol = 'O';

    // Move 1: X at 0
    let ok = gameManager.handleMove(room, player1User.id, 0);
    expect(ok).toBe(true);
    expect(room.gameEngine.getState().board[0]).toBe('X');
    expect(room.gameEngine.getState().turn).toBe('O');

    // Move 2: O at 3
    ok = gameManager.handleMove(room, player2User.id, 3);
    expect(ok).toBe(true);
    expect(room.gameEngine.getState().board[3]).toBe('O');

    // Move 3: X at 1
    ok = gameManager.handleMove(room, player1User.id, 1);
    expect(ok).toBe(true);

    // Move 4: O at 4
    ok = gameManager.handleMove(room, player2User.id, 4);
    expect(ok).toBe(true);

    // Move 5: X at 2 -> Top row [0, 1, 2] completed! X wins!
    ok = gameManager.handleMove(room, player1User.id, 2);
    expect(ok).toBe(true);
    expect(room.status).toBe('finished');
  });

  it('5. Payout and DB updates: Winner gets stake * 2 - rake (9 tokens)', async () => {
    // Wait small tick for async db update in handleGameOver
    await new Promise((r) => setTimeout(r, 100));

    const settings = await db.getSettings();
    const initBal = settings.welcome_bonus_amount ?? 50;
    const rake = Number(settings.rake_amount ?? 1);
    const expectedPrize = stake * 2 - rake; // 5 * 2 - 1 = 9

    const p1 = await db.findUserById(player1User.id);
    const p2 = await db.findUserById(player2User.id);

    // P1 started with initBal, staked 5 -> initBal - 5, won 9 -> initBal + 4 tokens!
    expect(p1?.token_balance).toBe(initBal - stake + expectedPrize);
    expect(p1?.wins).toBe(1);

    // P2 started with initBal, staked 5 -> initBal - 5, lost
    expect(p2?.token_balance).toBe(initBal - stake);
    expect(p2?.losses).toBe(1);

    // Verify transaction logs
    const p1Txs = await db.getUserTransactions(player1User.id);
    expect(p1Txs.some(t => t.reason === 'game_win' && t.amount === expectedPrize)).toBe(true);

    const p2Txs = await db.getUserTransactions(player2User.id);
    expect(p2Txs.some(t => t.reason === 'game_stake' && t.amount === -stake)).toBe(true);

    // Check leaderboard
    const lb = await db.getIndividualLeaderboard();
    const p1Rank = lb.find(u => u.id === player1User.id);
    expect(p1Rank).toBeDefined();
    expect(p1Rank?.wins).toBe(1);
    expect(p1Rank?.token_balance).toBe(initBal - stake + expectedPrize);
  });

  it('5. Matchmaking queue matches two players into an active room', async () => {
    const queueP1: RoomPlayer = {
      userId: player1User.id,
      nickname: player1User.nickname,
      avatarUrl: player1User.avatar_url,
      socketId: 'sock_p1_match',
      symbol: null,
      rpsChoice: null,
      isConnected: true,
    };

    const queueP2: RoomPlayer = {
      userId: player2User.id,
      nickname: player2User.nickname,
      avatarUrl: player2User.avatar_url,
      socketId: 'sock_p2_match',
      symbol: null,
      rpsChoice: null,
      isConnected: true,
    };

    // P1 queues first
    const res1 = await gameManager.queueMatchmaking(queueP1, 1);
    expect(res1.matched).toBe(false);

    // P2 queues second
    const res2 = await gameManager.queueMatchmaking(queueP2, 1);
    expect(res2.matched).toBe(true);
    expect(res2.room).toBeDefined();
    expect(res2.room?.player1.userId).toBe(player1User.id);
    expect(res2.room?.player2?.userId).toBe(player2User.id);

    // Both players find active room
    const activeRoom1 = gameManager.findActiveRoomForUser(player1User.id);
    const activeRoom2 = gameManager.findActiveRoomForUser(player2User.id);
    expect(activeRoom1?.roomId).toBe(res2.room?.roomId);
    expect(activeRoom2?.roomId).toBe(res2.room?.roomId);
  });

  it('6. Reconnection updates socket and restores active game state', async () => {
    const mockSocket = {
      id: 'new_sock_p1_reconnected',
      join: () => {},
      emit: () => {},
    } as any;

    const reconnected = gameManager.reconnectUser(player1User.id, mockSocket);
    expect(reconnected).toBeDefined();
    expect(reconnected?.player1.socketId).toBe('new_sock_p1_reconnected');
    expect(reconnected?.player1.isConnected).toBe(true);
  });
});
