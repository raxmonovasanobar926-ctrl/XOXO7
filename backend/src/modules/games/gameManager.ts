import { ThreePieceGame, PlayerSymbol, ThreePieceGameState } from '../../core/threePieceGame.js';
import { RPSChoice, resolveRPSStage, RPSState } from '../../core/rps.js';
import { calculateAIMove, GolemLevel, GOLEM_LEVELS, GOLEM_CHATS, getGolemChatPhrase } from '../../core/ai_opponent.js';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { Server as SocketIOServer, Socket } from 'socket.io';

export interface RoomPlayer {
  userId: number;
  nickname: string;
  avatarUrl: string;
  socketId: string;
  symbol: PlayerSymbol | null; // X or O
  rpsChoice: RPSChoice | null;
  isConnected: boolean;
  isBot?: boolean;
}

export type RoomStatus = 'waiting' | 'rps' | 'in_progress' | 'finished' | 'abandoned';

export interface GameRoom {
  roomId: string;
  stake: number;
  isPrivate: boolean;
  isAiGame: boolean;
  aiLevel?: GolemLevel | null;
  status: RoomStatus;
  player1: RoomPlayer;
  player2: RoomPlayer | null;
  rpsState: RPSState | null;
  rpsRound: number;
  gameEngine: ThreePieceGame | null;
  turnTimeout: NodeJS.Timeout | null;
  turnDeadline: number | null;
  rpsTimeout: NodeJS.Timeout | null;
  disconnectTimeout: { [userId: number]: NodeJS.Timeout | null };
  consecutiveTimeouts: { [userId: number]: number };
  aiThinkingTimeout?: NodeJS.Timeout | null;
  createdAt: number;
  dbGameId: number | null;
}

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();
  private matchmakingQueues: Map<number, RoomPlayer[]> = new Map(); // stake -> players
  private io: SocketIOServer | null = null;
  private userActiveAiGames: Map<number, string> = new Map(); // userId -> roomId

  constructor() {
    for (const stake of config.stakes) {
      this.matchmakingQueues.set(stake, []);
    }
  }

  public setIO(io: SocketIOServer) {
    this.io = io;
  }

  public async notifyUserBalanceUpdate(userId: number) {
    if (!this.io || userId <= 0) return;
    try {
      const u = await db.findUserById(userId);
      if (!u) return;
      for (const [, sock] of this.io.sockets.sockets) {
        if ((sock as any).userId === userId) {
          sock.emit('user_balance_update', { token_balance: u.token_balance });
        }
      }
    } catch (err) {
      console.error('[GameManager] Error notifying balance update:', err);
    }
  }

  public generateRoomCode(): string {
    let code = '';
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.rooms.has(code));
    return code;
  }

  public getRoom(roomId: string): GameRoom | undefined {
    if (!roomId) return undefined;
    const cleanId = roomId.trim().toUpperCase();
    return this.rooms.get(cleanId) || this.rooms.get(roomId);
  }

  public getOpenGames(): Array<{ roomId: string; hostNickname: string; hostAvatar: string; stake: number }> {
    const list: Array<{ roomId: string; hostNickname: string; hostAvatar: string; stake: number }> = [];
    for (const room of this.rooms.values()) {
      if (room.status === 'waiting' && !room.isPrivate && !room.isAiGame && !room.player2) {
        list.push({
          roomId: room.roomId,
          hostNickname: room.player1.nickname,
          hostAvatar: room.player1.avatarUrl,
          stake: room.stake,
        });
      }
    }
    return list;
  }

  /**
   * Create a new room for PvP
   */
  public async createRoom(
    roomId: string,
    player: RoomPlayer,
    stake: number,
    isPrivate = false
  ): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    const user = await db.findUserById(player.userId);
    if (!user || user.is_blocked) {
      return { success: false, error: 'Akkauntingiz bloklangan' };
    }
    if (user.token_balance < stake) {
      return { success: false, error: 'Yetarli tosh mavjud emas' };
    }

    const room: GameRoom = {
      roomId,
      stake,
      isPrivate,
      isAiGame: false,
      aiLevel: null,
      status: 'waiting',
      player1: player,
      player2: null,
      rpsState: null,
      rpsRound: 1,
      gameEngine: null,
      turnTimeout: null,
      turnDeadline: null,
      rpsTimeout: null,
      disconnectTimeout: {},
      consecutiveTimeouts: { [player.userId]: 0 },
      createdAt: Date.now(),
      dbGameId: null,
    };

    this.rooms.set(roomId, room);
    return { success: true, room };
  }

  /**
   * Create an AI Opponent Game (vs Golem)
   */
  public async createAIGame(
    userId: number,
    level: GolemLevel,
    socketId: string
  ): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    const user = await db.findUserById(userId);
    if (!user || user.is_blocked) {
      return { success: false, error: 'Akkauntingiz bloklangan' };
    }

    // Rate-limit: Check active AI game for this user
    const existingRoomId = this.userActiveAiGames.get(userId);
    if (existingRoomId) {
      const existing = this.rooms.get(existingRoomId);
      if (existing && (existing.status === 'rps' || existing.status === 'in_progress')) {
        // Reconnect user to active game
        existing.player1.socketId = socketId;
        existing.player1.isConnected = true;
        return { success: true, room: existing };
      }
    }

    const levelSettings = (await db.getAILevelSetting(level)) || GOLEM_LEVELS[level] || GOLEM_LEVELS.easy;
    if (!levelSettings.is_enabled) {
      return { success: false, error: 'Bu AI darajasi vaqtincha faol emas' };
    }

    if (user.token_balance < levelSettings.stake) {
      return { success: false, error: 'Yetarli tosh mavjud emas' };
    }

    // Atomic stake deduction
    try {
      await db.updateUserBalance(userId, -levelSettings.stake, 'ai_game_stake');
      this.notifyUserBalanceUpdate(userId);
    } catch (e) {
      return { success: false, error: 'Tosh ayirishda xatolik yuz berdi' };
    }

    const golemNames: Record<GolemLevel, string> = {
      easy: 'Pebble',
      medium: 'Rocky',
      hard: 'Granite',
      expert: 'Obsidian',
    };

    const roomId = `ai_${level}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const player1: RoomPlayer = {
      userId: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      socketId,
      symbol: null,
      rpsChoice: null,
      isConnected: true,
      isBot: false,
    };

    const player2: RoomPlayer = {
      userId: -1,
      nickname: golemNames[level],
      avatarUrl: `golem_${level}`,
      socketId: 'ai_bot',
      symbol: null,
      rpsChoice: null,
      isConnected: true,
      isBot: true,
    };

    const room: GameRoom = {
      roomId,
      stake: levelSettings.stake,
      isPrivate: true,
      isAiGame: true,
      aiLevel: level,
      status: 'rps',
      player1,
      player2,
      rpsState: null,
      rpsRound: 1,
      gameEngine: null,
      turnTimeout: null,
      turnDeadline: null,
      rpsTimeout: null,
      disconnectTimeout: {},
      consecutiveTimeouts: { [userId]: 0, [-1]: 0 },
      createdAt: Date.now(),
      dbGameId: null,
    };

    // Record in DB
    const dbGame = await db.createGameRecord(
      player1.userId,
      null,
      room.stake,
      JSON.stringify([]),
      true,
      level
    );
    room.dbGameId = dbGame.id;

    this.rooms.set(roomId, room);
    this.userActiveAiGames.set(userId, roomId);

    // AI sealed RPS choice
    const rpsOptions: RPSChoice[] = ['rock', 'paper', 'scissors'];
    if (room.player2) {
      room.player2.rpsChoice = rpsOptions[Math.floor(Math.random() * 3)];
    }

    return { success: true, room };
  }

  /**
   * Join an existing PvP room
   */
  public async joinRoom(
    roomId: string,
    player: RoomPlayer
  ): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Xona topilmadi' };
    }
    if (room.status !== 'waiting') {
      return { success: false, error: 'O‘yin allaqachon boshlangan' };
    }
    if (room.player1.userId === player.userId) {
      return { success: false, error: 'O‘z xonangizga qo‘shila olmaysiz' };
    }

    const user = await db.findUserById(player.userId);
    if (!user || user.is_blocked) {
      return { success: false, error: 'Akkauntingiz bloklangan' };
    }
    if (user.token_balance < room.stake) {
      return { success: false, error: 'Yetarli tosh mavjud emas' };
    }

    room.player2 = player;
    room.consecutiveTimeouts[player.userId] = 0;
    return { success: true, room };
  }

  /**
   * Queue for matchmaking
   */
  public async queueMatchmaking(
    player: RoomPlayer,
    stake: number
  ): Promise<{ matched: boolean; roomId?: string; room?: GameRoom; error?: string }> {
    const user = await db.findUserById(player.userId);
    if (!user || user.is_blocked) {
      return { matched: false, error: 'Akkauntingiz bloklangan' };
    }
    if (user.token_balance < stake) {
      return { matched: false, error: 'Yetarli tosh mavjud emas' };
    }

    let queue = this.matchmakingQueues.get(stake);
    if (!queue) {
      queue = [];
      this.matchmakingQueues.set(stake, queue);
    }

    // Remove if already in queue
    this.leaveMatchmaking(player.userId);

    // Match with first valid waiting player
    let opponent: RoomPlayer | null = null;
    while (queue.length > 0) {
      const candidate = queue.shift()!;
      if (candidate.userId === player.userId) continue;

      // Verify candidate's socket is still connected (if io initialized)
      if (this.io && this.io.sockets?.sockets) {
        const candSocket = this.io.sockets.sockets.get(candidate.socketId);
        if (candSocket && !candSocket.connected) {
          console.log(`[GameManager] Pruning disconnected queued player ${candidate.userId} (${candidate.nickname})`);
          continue;
        }
      }

      // Verify candidate still has enough balance and not blocked
      const candUser = await db.findUserById(candidate.userId);
      if (!candUser || candUser.is_blocked || candUser.token_balance < stake) {
        console.log(`[GameManager] Pruning ineligible queued player ${candidate.userId}`);
        continue;
      }

      opponent = candidate;
      break;
    }

    if (opponent) {
      const roomId = `match_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const room: GameRoom = {
        roomId,
        stake,
        isPrivate: false,
        isAiGame: false,
        aiLevel: null,
        status: 'waiting',
        player1: opponent,
        player2: player,
        rpsState: null,
        rpsRound: 1,
        gameEngine: null,
        turnTimeout: null,
        turnDeadline: null,
        rpsTimeout: null,
        disconnectTimeout: {},
        consecutiveTimeouts: { [opponent.userId]: 0, [player.userId]: 0 },
        createdAt: Date.now(),
        dbGameId: null,
      };

      this.rooms.set(roomId, room);
      return { matched: true, roomId, room };
    } else {
      queue.push(player);
      return { matched: false };
    }
  }

  public leaveMatchmaking(userId: number) {
    for (const queue of this.matchmakingQueues.values()) {
      const idx = queue.findIndex(p => p.userId === userId);
      if (idx !== -1) {
        queue.splice(idx, 1);
      }
    }
  }

  /**
   * Starts the RPS Stage for the room
   */
  public async startRPSStage(room: GameRoom) {
    if (!room.player2) return;

    if (!room.isAiGame) {
      // Deduct stakes from both PvP players with strict atomic safety
      try {
        await db.updateUserBalance(room.player1.userId, -room.stake, 'game_stake');
      } catch (err) {
        console.error('[GameManager] Failed to deduct PvP stake for player 1:', err);
        if (this.io) {
          this.io.to(room.roomId).emit('game_error', { message: 'Yetarli tosh mavjud emas' });
        }
        this.rooms.delete(room.roomId);
        return;
      }

      try {
        await db.updateUserBalance(room.player2.userId, -room.stake, 'game_stake');
      } catch (err) {
        console.error('[GameManager] Failed to deduct PvP stake for player 2:', err);
        // Refund player 1 immediately
        await db.updateUserBalance(room.player1.userId, room.stake, 'game_refund');
        if (this.io) {
          this.io.to(room.roomId).emit('game_error', { message: 'Yetarli tosh mavjud emas' });
        }
        this.rooms.delete(room.roomId);
        return;
      }

      this.notifyUserBalanceUpdate(room.player1.userId);
      if (room.player2 && !room.player2.isBot) {
        this.notifyUserBalanceUpdate(room.player2.userId);
      }

      // Record in DB
      const dbGame = await db.createGameRecord(
        room.player1.userId,
        room.player2.userId,
        room.stake,
        JSON.stringify([])
      );
      room.dbGameId = dbGame.id;
    }

    room.status = 'rps';
    room.player1.rpsChoice = null;

    if (room.isAiGame) {
      // Sealed choice for AI Golem
      const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
      room.player2.rpsChoice = choices[Math.floor(Math.random() * choices.length)];
    } else {
      room.player2.rpsChoice = null;
    }

    if (this.io) {
      // Force both sockets into room.roomId
      this.io.in(room.player1.socketId).socketsJoin(room.roomId);
      if (room.player2 && !room.player2.isBot) {
        this.io.in(room.player2.socketId).socketsJoin(room.roomId);
      }

      const rpsPayload = {
        roomId: room.roomId,
        round: room.rpsRound,
        timeoutSeconds: config.rpsTimeoutSeconds,
      };

      // Guaranteed delivery: emit to both sockets directly and to room
      this.io.to(room.player1.socketId).emit('rps_started', rpsPayload);
      if (room.player2 && !room.player2.isBot) {
        this.io.to(room.player2.socketId).emit('rps_started', rpsPayload);
      }
      this.io.to(room.roomId).emit('rps_started', rpsPayload);
    }

    // Start countdown timer
    if (room.rpsTimeout) clearTimeout(room.rpsTimeout);
    room.rpsTimeout = setTimeout(() => {
      this.resolveRPS(room);
    }, config.rpsTimeoutSeconds * 1000);
  }

  /**
   * Player submits RPS choice
   */
  public submitRPSChoice(room: GameRoom, userId: number, choice: RPSChoice) {
    if (room.status !== 'rps') return;

    if (room.player1.userId === userId) {
      room.player1.rpsChoice = choice;
    } else if (room.player2 && room.player2.userId === userId) {
      room.player2.rpsChoice = choice;
    }

    if (this.io) {
      this.io.to(room.roomId).emit('rps_choice_sealed', { userId });
    }

    // If both chose, resolve immediately!
    if (room.player1.rpsChoice && room.player2?.rpsChoice) {
      if (room.rpsTimeout) clearTimeout(room.rpsTimeout);
      this.resolveRPS(room);
    }
  }

  /**
   * Resolves RPS choices
   */
  private resolveRPS(room: GameRoom) {
    if (room.status !== 'rps' || !room.player2) return;

    // Timeout fallback if choices not made
    const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
    if (!room.player1.rpsChoice) {
      room.player1.rpsChoice = choices[Math.floor(Math.random() * choices.length)];
    }
    if (!room.player2.rpsChoice) {
      room.player2.rpsChoice = choices[Math.floor(Math.random() * choices.length)];
    }

    const rpsResult = resolveRPSStage(
      room.player1.rpsChoice,
      room.player2.rpsChoice,
      room.rpsRound,
      config.maxRpsDraws
    );

    room.rpsState = rpsResult;

    if (this.io) {
      this.io.to(room.roomId).emit('rps_revealed', {
        player1: {
          userId: room.player1.userId,
          choice: rpsResult.player1Choice,
          symbol: rpsResult.player1Symbol,
        },
        player2: {
          userId: room.player2.userId,
          choice: rpsResult.player2Choice,
          symbol: rpsResult.player2Symbol,
        },
        winner: rpsResult.winner,
        round: room.rpsRound,
      });
    }

    if (rpsResult.winner === 'draw') {
      room.rpsRound++;
      room.player1.rpsChoice = null;
      if (room.isAiGame) {
        room.player2.rpsChoice = choices[Math.floor(Math.random() * choices.length)];
      } else {
        room.player2.rpsChoice = null;
      }

      setTimeout(() => {
        if (room.status === 'rps') {
          this.startRPSStage(room);
        }
      }, 2500);
    } else {
      // Winner determined!
      room.player1.symbol = rpsResult.player1Symbol!;
      room.player2.symbol = rpsResult.player2Symbol!;

      // Transition to 3-Piece Game after 2.5 seconds
      setTimeout(() => {
        this.startThreePieceGame(room);
      }, 2500);
    }
  }

  /**
   * Starts ThreePieceGame (3-piece placement & sliding)
   */
  private startThreePieceGame(room: GameRoom) {
    if (!room.player2) return;

    room.status = 'in_progress';
    room.gameEngine = new ThreePieceGame('X');

    // Update DB record
    if (room.dbGameId) {
      const pX = room.player1.symbol === 'X' ? room.player1.userId : (room.player2.isBot ? null : room.player2.userId);
      const pO = room.player1.symbol === 'O' ? room.player1.userId : (room.player2.isBot ? null : room.player2.userId);
      db.updateGameRecord(room.dbGameId, {
        player_x_id: pX || room.player1.userId,
        player_o_id: pO,
        status: 'in_progress',
      });
    }

    this.broadcastGameState(room);
    this.resetTurnTimer(room);

    // If AI game, send welcoming Golem taunt
    if (room.isAiGame && room.aiLevel) {
      db.findUserById(room.player1.userId).then((user) => {
        const lang = user?.language || 'uz';
        const taunt = getGolemChatPhrase(room.aiLevel!, 'start', lang);
        if (taunt) {
          setTimeout(() => {
            this.handleBattleChat(room, -1, { phrase: taunt });
          }, 800);
        }
      }).catch(() => {});

      // If AI is 'X', schedule AI move first!
      if (room.player2.symbol === 'X') {
        this.scheduleAIMove(room);
      }
    }
  }

  /**
   * Handles player move (Phase 1: { to }, Phase 2: { from, to })
   */
  public handleMove(room: GameRoom, userId: number, to: number, from?: number): boolean {
    if (room.status !== 'in_progress' || !room.gameEngine || !room.player2) return false;

    const playerSymbol = room.player1.userId === userId
      ? room.player1.symbol
      : (room.player2.userId === userId ? room.player2.symbol : null);
    if (!playerSymbol) return false;

    // Reset consecutive timeouts on valid move
    room.consecutiveTimeouts[userId] = 0;

    const moveResult = room.gameEngine.makeMove(playerSymbol, to, from);
    if (!moveResult.success) {
      return false;
    }

    const state = room.gameEngine.getState();

    // Check game termination
    if (state.status === 'won') {
      this.handleGameOver(room, state.winner!);
    } else if (state.status === 'draw') {
      this.handleGameDraw(room);
    } else {
      this.broadcastGameState(room);
      this.resetTurnTimer(room);

      // If playing against AI and it's now AI's turn
      if (room.isAiGame && state.turn === room.player2.symbol) {
        this.scheduleAIMove(room);
      }
    }

    return true;
  }

  /**
   * Schedules AI Golem thinking delay and move calculation
   */
  private scheduleAIMove(room: GameRoom) {
    if (!room.isAiGame || !room.gameEngine || !room.aiLevel || !room.player2) return;

    const state = room.gameEngine.getState();
    const aiSymbol = room.player2.symbol!;

    if (state.turn !== aiSymbol || state.status !== 'in_progress') return;

    // Emit AI thinking indicator to room
    if (this.io) {
      this.io.to(room.roomId).emit('ai_thinking', { isThinking: true });
    }

    try {
      const placedX = state.marks.X.length;
      const placedO = state.marks.O.length;

      const aiMove = calculateAIMove(state.board, aiSymbol, placedX, placedO, room.aiLevel);

      if (room.aiThinkingTimeout) clearTimeout(room.aiThinkingTimeout);

      room.aiThinkingTimeout = setTimeout(() => {
        if (room.status !== 'in_progress' || !room.gameEngine) return;

        if (this.io) {
          this.io.to(room.roomId).emit('ai_thinking', { isThinking: false });
        }

        const moveRes = room.gameEngine.makeMove(aiSymbol, aiMove.to, aiMove.from);
        if (moveRes.success) {
          const nextState = room.gameEngine.getState();
          if (nextState.status === 'won') {
            this.handleGameOver(room, nextState.winner!);
          } else if (nextState.status === 'draw') {
            this.handleGameDraw(room);
          } else {
            this.broadcastGameState(room);
            this.resetTurnTimer(room);
          }
        }
      }, aiMove.thinkDelayMs);
    } catch (err) {
      console.error('[GameManager] Error calculating AI move:', err);
    }
  }

  /**
   * Resets turn countdown timer
   */
  private resetTurnTimer(room: GameRoom) {
    if (room.turnTimeout) clearTimeout(room.turnTimeout);

    const deadline = Date.now() + config.turnTimeoutSeconds * 1000;
    room.turnDeadline = deadline;

    if (this.io) {
      this.io.to(room.roomId).emit('turn_timer', {
        turn: room.gameEngine?.getState().turn,
        deadline,
        seconds: config.turnTimeoutSeconds,
      });
    }

    room.turnTimeout = setTimeout(() => {
      this.handleTurnTimeout(room);
    }, config.turnTimeoutSeconds * 1000);
  }

  /**
   * Handles timeout when a player doesn't move
   */
  private handleTurnTimeout(room: GameRoom) {
    if (room.status !== 'in_progress' || !room.gameEngine) return;

    const state = room.gameEngine.getState();
    const activeTurn = state.turn;
    const activePlayer = room.player1.symbol === activeTurn ? room.player1 : room.player2!;

    // Increment consecutive timeouts
    const count = (room.consecutiveTimeouts[activePlayer.userId] || 0) + 1;
    room.consecutiveTimeouts[activePlayer.userId] = count;

    // Rule 4.4 #7: 2 consecutive timeouts = loss by forfeit
    if (count >= 2) {
      const winnerSymbol = activeTurn === 'X' ? 'O' : 'X';
      this.handleGameOver(room, winnerSymbol);
      return;
    }

    // Auto-move for 1st timeout
    const emptyCells: number[] = [];
    state.board.forEach((val, idx) => {
      if (val === null) emptyCells.push(idx);
    });

    if (emptyCells.length > 0) {
      const randomTo = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      if (state.phase === 'placing') {
        this.handleMove(room, activePlayer.userId, randomTo);
      } else {
        const myMarks = state.marks[activeTurn];
        const randomFrom = myMarks[Math.floor(Math.random() * myMarks.length)];
        this.handleMove(room, activePlayer.userId, randomTo, randomFrom);
      }
    }
  }

  /**
   * Handles game completion and payouts
   */
  private async handleGameOver(room: GameRoom, winningSymbol: PlayerSymbol) {
    if (room.turnTimeout) clearTimeout(room.turnTimeout);
    if (room.aiThinkingTimeout) clearTimeout(room.aiThinkingTimeout);
    room.status = 'finished';

    const winner = room.player1.symbol === winningSymbol ? room.player1 : room.player2!;
    const loser = room.player1.symbol === winningSymbol ? room.player2! : room.player1;

    let prize = 0;
    let netReward = 0;
    let effectiveRake = 0;
    let isCapped = false;
    let capNotice: string | null = null;

    if (room.isAiGame && room.aiLevel) {
      const humanIsWinner = winner.userId === room.player1.userId;
      const levelSetting = (await db.getAILevelSetting(room.aiLevel)) || GOLEM_LEVELS[room.aiLevel] || GOLEM_LEVELS.easy;
      const settings = await db.getSettings();
      const dailyCap = settings.bot_max_stones_won_per_day || 30;

      if (humanIsWinner) {
        // Daily win cap check
        const stonesWonToday = await db.getStonesWonFromAIToday(room.player1.userId);
        if (stonesWonToday + levelSetting.win_reward <= dailyCap) {
          prize = room.stake + levelSetting.win_reward;
          netReward = levelSetting.win_reward;
          await db.updateUserBalance(room.player1.userId, prize, 'ai_game_win', room.dbGameId || undefined);
        } else {
          // Cap reached: refund stake only
          prize = room.stake;
          netReward = 0;
          isCapped = true;
          capNotice = `Kunlik yutuq chegarasi (${dailyCap} tosh) to‘lgan. Faqat stavka qaytarildi.`;
          await db.updateUserBalance(room.player1.userId, prize, 'ai_game_refund', room.dbGameId || undefined);
        }
        this.notifyUserBalanceUpdate(room.player1.userId);

        await db.recordAIStat(room.player1.userId, room.aiLevel, 'win');

        // Check if bot games count to rating
        if (settings.bot_games_count_to_rating) {
          const u = await db.findUserById(room.player1.userId);
          if (u) await db.updateUser(u.id, { wins: (u.wins || 0) + 1 });
        }

        // Golem defeat reaction phrase
        const u = await db.findUserById(room.player1.userId);
        const lang = u?.language || 'uz';
        const lossTaunt = getGolemChatPhrase(room.aiLevel, 'loss', lang);
        if (lossTaunt) {
          setTimeout(() => {
            this.handleBattleChat(room, -1, { phrase: lossTaunt });
          }, 600);
        }
      } else {
        // AI won: stake is lost to bank (already deducted)
        await db.recordAIStat(room.player1.userId, room.aiLevel, 'loss');
        const u = await db.findUserById(room.player1.userId);
        if (settings.bot_games_count_to_rating) {
          if (u) await db.updateUser(u.id, { losses: (u.losses || 0) + 1 });
        }

        // Golem victory reaction phrase
        const lang = u?.language || 'uz';
        const winTaunt = getGolemChatPhrase(room.aiLevel, 'win', lang);
        if (winTaunt) {
          setTimeout(() => {
            this.handleBattleChat(room, -1, { phrase: winTaunt });
          }, 600);
        }
      }

      this.userActiveAiGames.delete(room.player1.userId);
    } else {
      // PvP game: winner takes stake * 2 - rake
      const currentSettings = await db.getSettings();
      const rawRake = Number(currentSettings.rake_amount !== undefined ? currentSettings.rake_amount : 1);
      // Safety validation: rake must satisfy 0 <= rake < room.stake to prevent payout < stake or negative
      effectiveRake = (rawRake >= 0 && rawRake < room.stake) ? rawRake : 0;

      prize = Math.max(room.stake, room.stake * 2 - effectiveRake);
      netReward = prize - room.stake;

      try {
        await db.updateUserBalance(winner.userId, prize, 'game_win', room.dbGameId || undefined);
        if (effectiveRake > 0) {
          await db.recordRake(room.dbGameId || null, effectiveRake, room.stake);
        }
        this.notifyUserBalanceUpdate(winner.userId);
        if (loser && loser.userId > 0) {
          this.notifyUserBalanceUpdate(loser.userId);
        }

        const winnerUser = await db.findUserById(winner.userId);
        if (winnerUser) {
          await db.updateUser(winner.userId, { wins: (winnerUser.wins || 0) + 1 });
        }

        const loserUser = await db.findUserById(loser.userId);
        if (loserUser) {
          await db.updateUser(loser.userId, { losses: (loserUser.losses || 0) + 1 });
        }
      } catch (err) {
        console.error('[GameManager] Error handling PvP game over payouts:', err);
      }
    }

    // Update game record in DB
    if (room.dbGameId) {
      await db.updateGameRecord(room.dbGameId, {
        status: 'finished',
        winner_id: winner.userId > 0 ? winner.userId : null,
        board: JSON.stringify(room.gameEngine?.getState()),
        finished_at: new Date().toISOString(),
      });
    }

    if (this.io) {
      this.io.to(room.roomId).emit('game_over', {
        winnerId: winner.userId,
        winnerNickname: winner.nickname,
        winnerSymbol: winningSymbol,
        winningLine: room.gameEngine?.getState().winningLine,
        prize,
        netReward,
        rakeAmount: effectiveRake,
        isCapped,
        capNotice,
        isAiGame: room.isAiGame,
        state: room.gameEngine?.getState(),
      });
    }

    setTimeout(() => {
      this.rooms.delete(room.roomId);
    }, 10 * 60 * 1000);
  }

  /**
   * Handles game draw (repetition or 20-move limit)
   */
  private async handleGameDraw(room: GameRoom) {
    if (room.turnTimeout) clearTimeout(room.turnTimeout);
    if (room.aiThinkingTimeout) clearTimeout(room.aiThinkingTimeout);
    room.status = 'finished';

    // Refund full stakes
    if (room.isAiGame) {
      await db.updateUserBalance(room.player1.userId, room.stake, 'ai_game_refund', room.dbGameId || undefined);
      this.notifyUserBalanceUpdate(room.player1.userId);
      if (room.aiLevel) {
        await db.recordAIStat(room.player1.userId, room.aiLevel, 'draw');
      }
      this.userActiveAiGames.delete(room.player1.userId);
    } else {
      await db.updateUserBalance(room.player1.userId, room.stake, 'game_refund', room.dbGameId || undefined);
      this.notifyUserBalanceUpdate(room.player1.userId);
      if (room.player2) {
        await db.updateUserBalance(room.player2.userId, room.stake, 'game_refund', room.dbGameId || undefined);
        this.notifyUserBalanceUpdate(room.player2.userId);
      }

      const p1 = await db.findUserById(room.player1.userId);
      if (p1) await db.updateUser(p1.id, { draws: (p1.draws || 0) + 1 });
      if (room.player2) {
        const p2 = await db.findUserById(room.player2.userId);
        if (p2) await db.updateUser(p2.id, { draws: (p2.draws || 0) + 1 });
      }
    }

    if (room.dbGameId) {
      await db.updateGameRecord(room.dbGameId, {
        status: 'finished',
        winner_id: null,
        board: JSON.stringify(room.gameEngine?.getState()),
        finished_at: new Date().toISOString(),
      });
    }

    if (this.io) {
      this.io.to(room.roomId).emit('game_draw', {
        prize: room.stake,
        isAiGame: room.isAiGame,
        state: room.gameEngine?.getState(),
      });
    }

    setTimeout(() => {
      this.rooms.delete(room.roomId);
    }, 10 * 60 * 1000);
  }

  /**
   * Broadcast updated game state
   */
  public broadcastGameState(room: GameRoom) {
    if (!this.io || !room.gameEngine) return;
    const state = room.gameEngine.getState();
    this.io.to(room.roomId).emit('game_state_update', {
      roomId: room.roomId,
      state,
      player1: {
        userId: room.player1.userId,
        nickname: room.player1.nickname,
        avatarUrl: room.player1.avatarUrl,
        symbol: room.player1.symbol,
        isBot: !!room.player1.isBot,
      },
      player2: room.player2
        ? {
            userId: room.player2.userId,
            nickname: room.player2.nickname,
            avatarUrl: room.player2.avatarUrl,
            symbol: room.player2.symbol,
            isBot: !!room.player2.isBot,
          }
        : null,
      stake: room.stake,
      isAiGame: room.isAiGame,
      aiLevel: room.aiLevel,
    });
  }

  /**
   * Battle-chat reaction
   */
  public handleBattleChat(room: GameRoom, senderId: number, data: { emoji?: string; phrase?: string }) {
    // Validate sender belongs to the room
    const isParticipant = senderId === -1 || 
      (room.player1 && room.player1.userId === senderId) || 
      (room.player2 && room.player2.userId === senderId);
    if (!isParticipant) return;

    // Sanitize emoji and phrase against XSS and limit length
    const cleanEmoji = typeof data.emoji === 'string' ? data.emoji.slice(0, 30).replace(/[<>]/g, '') : null;
    const cleanPhrase = typeof data.phrase === 'string' ? data.phrase.slice(0, 100).replace(/[<>]/g, '') : null;

    if (this.io && (cleanEmoji || cleanPhrase)) {
      this.io.to(room.roomId).emit('battle_chat_message', {
        senderId,
        emoji: cleanEmoji,
        phrase: cleanPhrase,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Disconnect handling
   */
  public handleDisconnect(socketId: string) {
    for (const room of this.rooms.values()) {
      let disconnectedUser: RoomPlayer | null = null;
      if (room.player1.socketId === socketId) {
        room.player1.isConnected = false;
        disconnectedUser = room.player1;
      } else if (room.player2 && room.player2.socketId === socketId) {
        room.player2.isConnected = false;
        disconnectedUser = room.player2;
      }

      if (disconnectedUser && room.status === 'in_progress') {
        const uid = disconnectedUser.userId;
        room.disconnectTimeout[uid] = setTimeout(async () => {
          if (!disconnectedUser?.isConnected && room.status === 'in_progress') {
            const remaining = room.player1.userId === uid ? room.player2! : room.player1;
            if (remaining.symbol) {
              await this.handleGameOver(room, remaining.symbol);
            }
          }
        }, 60 * 1000);
      }
    }
  }

  /**
   * Terminate active game for blocked user
   */
  public async terminateActiveGameForUser(userId: number, reason: string) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.player1.userId === userId || room.player2?.userId === userId) {
        if (room.turnTimeout) clearTimeout(room.turnTimeout);
        if (room.rpsTimeout) clearTimeout(room.rpsTimeout);
        if (room.aiThinkingTimeout) clearTimeout(room.aiThinkingTimeout);

        const opponent = room.player1.userId === userId ? room.player2 : room.player1;

        if (room.status === 'in_progress' || room.status === 'rps') {
          room.status = 'abandoned';
          // Refund opponent if human
          if (opponent && !opponent.isBot) {
            try {
              await db.updateUserBalance(opponent.userId, room.stake, 'game_refund');
            } catch (e) {
              console.error('[GameManager] Error refunding opponent on user block:', e);
            }
          }

          if (this.io) {
            this.io.to(roomId).emit('game_cancelled', {
              reason,
              refunded: true,
            });
          }

          if (room.dbGameId) {
            db.updateGameRecord(room.dbGameId, {
              status: 'abandoned',
              finished_at: new Date().toISOString(),
            });
          }
        } else if (room.status === 'waiting') {
          this.rooms.delete(roomId);
        }
      }
    }
  }

  /**
   * Player voluntarily leaves / forfeits room
   */
  public async leaveRoom(roomId: string, userId: number) {
    const room = this.getRoom(roomId);
    if (!room) return;

    if (room.turnTimeout) clearTimeout(room.turnTimeout);
    if (room.rpsTimeout) clearTimeout(room.rpsTimeout);
    if (room.aiThinkingTimeout) clearTimeout(room.aiThinkingTimeout);

    if (room.status === 'waiting') {
      if (room.player1.userId === userId) {
        if (room.player2 && this.io) {
          this.io.to(room.roomId).emit('opponent_left', { reason: 'Xona egasi xonani tark etdi' });
        }
        this.rooms.delete(room.roomId);
      } else if (room.player2?.userId === userId) {
        room.player2 = null;
        if (this.io) {
          this.io.to(room.roomId).emit('opponent_left', { reason: 'Raqib xonani tark etdi' });
        }
      }
    } else if (room.status === 'rps' || room.status === 'in_progress') {
      const remainingPlayer = room.player1.userId === userId ? room.player2 : room.player1;
      
      if (room.isAiGame) {
        this.userActiveAiGames.delete(userId);
        this.rooms.delete(room.roomId);
        return;
      }

      if (remainingPlayer && !remainingPlayer.isBot) {
        // Assign symbol if not assigned yet
        const winningSymbol: PlayerSymbol = remainingPlayer === room.player1 
          ? (room.player1.symbol || 'X') 
          : (room.player2?.symbol || 'O');

        if (!room.player1.symbol) room.player1.symbol = 'X';
        if (room.player2 && !room.player2.symbol) room.player2.symbol = 'O';

        const currentSettings = await db.getSettings();
        const rawRake = Number(currentSettings.rake_amount !== undefined ? currentSettings.rake_amount : 1);
        const effectiveRake = (rawRake >= 0 && rawRake < room.stake) ? rawRake : 0;
        const forfeitPrize = Math.max(room.stake, room.stake * 2 - effectiveRake);

        if (this.io) {
          this.io.to(room.roomId).emit('opponent_left', { 
            reason: 'Raqib o\'yinni tark etdi! Siz g\'olib bo\'ldingiz. 🎉',
            winnerId: remainingPlayer.userId,
            prize: forfeitPrize,
            rakeAmount: effectiveRake,
          });
        }

        await this.handleGameOver(room, winningSymbol);
      } else {
        this.rooms.delete(room.roomId);
      }
    }
  }

  /**
   * Surrender/forfeit active game
   */
  public async surrender(roomId: string, userId: number) {
    return this.leaveRoom(roomId, userId);
  }

  /**
   * Find any active game room for a user (waiting, rps, in_progress)
   */
  public findActiveRoomForUser(userId: number): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (
        (room.player1.userId === userId || room.player2?.userId === userId) &&
        (room.status === 'rps' || room.status === 'in_progress' || room.status === 'waiting')
      ) {
        return room;
      }
    }
    return undefined;
  }

  /**
   * Reconnect user socket to their active room
   */
  public reconnectUser(userId: number, newSocket: Socket): GameRoom | null {
    const room = this.findActiveRoomForUser(userId);
    if (!room) return null;

    if (room.player1.userId === userId) {
      room.player1.socketId = newSocket.id;
      room.player1.isConnected = true;
    } else if (room.player2 && room.player2.userId === userId) {
      room.player2.socketId = newSocket.id;
      room.player2.isConnected = true;
    }

    if (room.disconnectTimeout && room.disconnectTimeout[userId]) {
      clearTimeout(room.disconnectTimeout[userId]!);
      room.disconnectTimeout[userId] = null;
    }

    newSocket.join(room.roomId);

    // Notify opponent
    const opponent = room.player1.userId === userId ? room.player2 : room.player1;
    if (opponent && !opponent.isBot && this.io) {
      this.io.to(opponent.socketId).emit('opponent_reconnected', { userId });
    }

    // Send room state to reconnected user
    newSocket.emit('room_joined', {
      roomId: room.roomId,
      room: {
        roomId: room.roomId,
        stake: room.stake,
        status: room.status,
        player1: room.player1,
        player2: room.player2,
        isAiGame: room.isAiGame,
        aiLevel: room.aiLevel,
      },
    });

    if (room.status === 'rps') {
      newSocket.emit('rps_started', {
        roomId: room.roomId,
        round: room.rpsRound,
        timeoutSeconds: config.rpsTimeoutSeconds,
      });
      if (room.player1.rpsChoice && room.player1.userId === userId) {
        newSocket.emit('rps_choice_sealed', { userId });
      }
      if (room.player2?.rpsChoice && room.player2.userId === userId) {
        newSocket.emit('rps_choice_sealed', { userId });
      }
    } else if (room.status === 'in_progress') {
      const state = room.gameEngine?.getState();
      if (state) {
        newSocket.emit('game_state_update', {
          roomId: room.roomId,
          state,
          player1: room.player1,
          player2: room.player2,
          stake: room.stake,
          isAiGame: room.isAiGame,
          aiLevel: room.aiLevel,
        });
      }
      if (room.turnDeadline) {
        newSocket.emit('turn_timer', {
          turn: room.gameEngine?.getState().turn,
          deadline: room.turnDeadline,
          seconds: config.turnTimeoutSeconds,
        });
      }
    }

    return room;
  }
}

export const gameManager = new GameManager();
