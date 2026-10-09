import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { gameManager, RoomPlayer } from '../modules/games/gameManager.js';
import { AuthTokenPayload } from '../modules/auth/index.js';
import { db } from '../db/index.js';
import { presenceManager } from './presence.js';

export function setupSocketServer(io: SocketIOServer) {
  gameManager.setIO(io);

  // Periodic broadcast of open games and online count every 5 seconds
  setInterval(() => {
    io.emit('open_games_update', {
      games: gameManager.getOpenGames(),
      onlineCount: io.engine.clientsCount,
    });
  }, 4000);

  io.on('connection', (socket: Socket) => {
    let currentUser: AuthTokenPayload | null = null;

    // Authenticate socket connection
    socket.on('auth', async (data: { token: string }) => {
      try {
        if (!data.token) return;
        const decoded = jwt.verify(data.token, config.jwtSecret) as AuthTokenPayload;

        // Check if user is blocked
        const dbUser = await db.findUserById(decoded.userId);
        if (!dbUser) return;

        if (dbUser.is_blocked) {
          socket.emit('account_blocked', {
            is_blocked: true,
            blocked_reason: dbUser.blocked_reason || 'Qoidabuzarlik sababli bloklangan',
            blocked_until: dbUser.blocked_until,
          });
          socket.disconnect(true);
          return;
        }

        currentUser = decoded;
        (socket as any).userId = decoded.userId;

        // Register user presence (Online)
        const becameOnline = presenceManager.userConnected(decoded.userId, socket.id);
        if (becameOnline) {
          io.emit('user_presence_change', { userId: decoded.userId, is_online: true });
        }

        // Send current list of online users to this socket
        socket.emit('initial_presence', {
          onlineUserIds: presenceManager.getOnlineUserIds(),
        });

        // Check if user has an active room to reconnect
        gameManager.reconnectUser(decoded.userId, socket);

        // Send initial open games list
        socket.emit('open_games_update', {
          games: gameManager.getOpenGames(),
          onlineCount: io.engine.clientsCount,
        });
      } catch (err) {
        socket.emit('error', { message: 'Avtorizatsiyadan o‘tishda xatolik' });
      }
    });

    // Create a new room
    socket.on('create_room', async (data: { stake: number; isPrivate?: boolean; customCode?: string }) => {
      if (!currentUser) return socket.emit('error', { message: 'Avtorizatsiya talab qilinadi' });

      const dbUser = await db.findUserById(currentUser.userId);
      if (!dbUser) return;

      const requestedStake = data.stake || config.defaultStake;
      if (dbUser.token_balance < requestedStake) {
        return socket.emit('insufficient_balance', {
          message: 'Yetarli tosh mavjud emas',
          stake: requestedStake,
          balance: dbUser.token_balance,
        });
      }

      let roomId = '';
      if (data.isPrivate && data.customCode) {
        const cleanCode = String(data.customCode).trim();
        if (!/^\d{4}$/.test(cleanCode)) {
          return socket.emit('error', { message: 'Xona kodi 4 xonali faqat raqam bo‘lishi kerak (masalan: 1234)' });
        }
        if (gameManager.getRoom(cleanCode)) {
          return socket.emit('error', { message: 'Bu kodli xona allaqachon mavjud. Boshqa kod kiriting.' });
        }
        roomId = cleanCode;
      } else {
        roomId = gameManager.generateRoomCode();
      }
      const player: RoomPlayer = {
        userId: currentUser.userId,
        nickname: dbUser.nickname,
        avatarUrl: dbUser.avatar_url,
        socketId: socket.id,
        symbol: null,
        rpsChoice: null,
        isConnected: true,
      };

      const result = await gameManager.createRoom(roomId, player, requestedStake, !!data.isPrivate);
      if (!result.success || !result.room) {
        if (result.error?.includes('tosh') || result.error?.includes('mavjud emas')) {
          return socket.emit('insufficient_balance', {
            message: result.error,
            stake: requestedStake,
            balance: dbUser.token_balance,
          });
        }
        return socket.emit('error', { message: result.error || 'Xona yaratib bo‘lmadi' });
      }

      socket.join(roomId);
      socket.emit('room_created', {
        roomId,
        room: {
          roomId: result.room.roomId,
          stake: result.room.stake,
          status: result.room.status,
          player1: result.room.player1,
          isPrivate: result.room.isPrivate,
        },
      });

      // Broadcast new open game to all
      io.emit('open_games_update', {
        games: gameManager.getOpenGames(),
        onlineCount: io.engine.clientsCount,
      });
    });

    // Join room
    socket.on('join_room', async (data: { roomId: string }) => {
      if (!currentUser) return socket.emit('error', { message: 'Avtorizatsiya talab qilinadi' });

      const dbUser = await db.findUserById(currentUser.userId);
      if (!dbUser) return;

      const targetRoom = gameManager.getRoom(data.roomId);
      if (targetRoom && dbUser.token_balance < targetRoom.stake) {
        return socket.emit('insufficient_balance', {
          message: 'Yetarli tosh mavjud emas',
          stake: targetRoom.stake,
          balance: dbUser.token_balance,
        });
      }

      const player: RoomPlayer = {
        userId: currentUser.userId,
        nickname: dbUser.nickname,
        avatarUrl: dbUser.avatar_url,
        socketId: socket.id,
        symbol: null,
        rpsChoice: null,
        isConnected: true,
      };

      const result = await gameManager.joinRoom(data.roomId, player);
      if (!result.success || !result.room) {
        if (result.error?.includes('tosh') || result.error?.includes('mavjud emas')) {
          return socket.emit('insufficient_balance', {
            message: result.error,
            stake: targetRoom?.stake || 1,
            balance: dbUser.token_balance,
          });
        }
        return socket.emit('error', { message: result.error || 'Xonaga qo‘shilib bo‘lmadi' });
      }

      // Ensure both players' sockets are in data.roomId
      const p1Socket = io.sockets.sockets.get(result.room.player1.socketId);
      if (p1Socket) p1Socket.join(data.roomId);
      io.in(result.room.player1.socketId).socketsJoin(data.roomId);

      socket.join(data.roomId);
      io.in(result.room.player2!.socketId).socketsJoin(data.roomId);

      socket.emit('room_joined', {
        roomId: data.roomId,
        room: {
          roomId: result.room.roomId,
          stake: result.room.stake,
          status: result.room.status,
          player1: result.room.player1,
          player2: result.room.player2,
        },
      });

      // If room now has 2 players and is waiting, start RPS!
      if (result.room.player2 && result.room.status === 'waiting') {
        const joinPayload = { player2: result.room.player2 };
        io.to(result.room.player1.socketId).emit('opponent_joined', joinPayload);
        io.to(data.roomId).emit('opponent_joined', joinPayload);

        // Trigger RPS Stage
        setTimeout(() => {
          gameManager.startRPSStage(result.room!);
        }, 1000);
      }
    });

    // Matchmaking queue
    socket.on('queue_match', async (data: { stake: number }) => {
      if (!currentUser) return socket.emit('error', { message: 'Avtorizatsiya talab qilinadi' });

      const dbUser = await db.findUserById(currentUser.userId);
      if (!dbUser) return;

      const requestedStake = data.stake || config.defaultStake;
      if (dbUser.token_balance < requestedStake) {
        return socket.emit('insufficient_balance', {
          message: 'Yetarli tosh mavjud emas',
          stake: requestedStake,
          balance: dbUser.token_balance,
        });
      }

      const player: RoomPlayer = {
        userId: currentUser.userId,
        nickname: dbUser.nickname,
        avatarUrl: dbUser.avatar_url,
        socketId: socket.id,
        symbol: null,
        rpsChoice: null,
        isConnected: true,
      };

      const result = await gameManager.queueMatchmaking(player, requestedStake);

      if (result.error) {
        return socket.emit('insufficient_balance', {
          message: result.error,
          stake: requestedStake,
          balance: dbUser.token_balance,
        });
      }

      if (result.matched && result.roomId && result.room) {
        // Ensure BOTH Player 1 and Player 2 join the socket room
        const p1Socket = io.sockets.sockets.get(result.room.player1.socketId);
        if (p1Socket) {
          p1Socket.join(result.roomId);
        }
        io.in(result.room.player1.socketId).socketsJoin(result.roomId);

        socket.join(result.roomId);
        io.in(result.room.player2!.socketId).socketsJoin(result.roomId);

        const matchPayload = {
          roomId: result.roomId,
          stake: result.room.stake,
          player1: result.room.player1,
          player2: result.room.player2,
        };

        // Guaranteed delivery: emit to both sockets directly and to room
        io.to(result.room.player1.socketId).emit('match_found', matchPayload);
        socket.emit('match_found', matchPayload);
        io.to(result.roomId).emit('match_found', matchPayload);

        setTimeout(() => {
          gameManager.startRPSStage(result.room!);
        }, 1200);
      } else {
        socket.emit('matchmaking_waiting', { stake: data.stake });
      }
    });

    socket.on('leave_match_queue', () => {
      if (currentUser) {
        gameManager.leaveMatchmaking(currentUser.userId);
        socket.emit('matchmaking_cancelled');
      }
    });

    // RPS choice
    socket.on('rps_choice', (data: { roomId: string; choice: 'rock' | 'paper' | 'scissors' }) => {
      if (!currentUser) return;
      const room = gameManager.getRoom(data.roomId);
      if (room) {
        gameManager.submitRPSChoice(room, currentUser.userId, data.choice);
      }
    });

    // Create AI Game (vs Golem)
    socket.on('create_ai_game', async (data: { level: 'easy' | 'medium' | 'hard' | 'expert' }) => {
      if (!currentUser) return socket.emit('error', { message: 'Avtorizatsiya talab qilinadi' });

      const dbUser = await db.findUserById(currentUser.userId);
      if (!dbUser) return;

      const levelSettings = (await db.getAILevelSetting(data.level)) || { stake: data.level === 'easy' ? 1 : data.level === 'medium' ? 3 : data.level === 'hard' ? 5 : 10 };
      if (dbUser.token_balance < levelSettings.stake) {
        return socket.emit('insufficient_balance', {
          message: 'Yetarli tosh mavjud emas',
          stake: levelSettings.stake,
          balance: dbUser.token_balance,
        });
      }

      const result = await gameManager.createAIGame(currentUser.userId, data.level, socket.id);
      if (!result.success || !result.room) {
        if (result.error?.includes('tosh') || result.error?.includes('mavjud emas')) {
          return socket.emit('insufficient_balance', {
            message: result.error,
            stake: levelSettings.stake,
            balance: dbUser.token_balance,
          });
        }
        return socket.emit('error', { message: result.error || 'AI o‘yinini yaratib bo‘lmadi' });
      }

      socket.join(result.room.roomId);
      socket.emit('ai_game_created', {
        roomId: result.room.roomId,
        room: {
          roomId: result.room.roomId,
          stake: result.room.stake,
          status: result.room.status,
          player1: result.room.player1,
          player2: result.room.player2,
          isAiGame: true,
          aiLevel: result.room.aiLevel,
        },
      });

      // Immediately kick off RPS Stage for AI match
      setTimeout(() => {
        gameManager.startRPSStage(result.room!);
      }, 800);
    });

    // Move in ThreePieceGame (Phase 1: { to }, Phase 2: { to, from })
    socket.on('game_move', (data: { roomId: string; cell?: number; to?: number; from?: number }) => {
      if (!currentUser) return;
      const room = gameManager.getRoom(data.roomId);
      if (room) {
        const toCell = data.to !== undefined ? data.to : data.cell!;
        gameManager.handleMove(room, currentUser.userId, toCell, data.from);
      }
    });

    // Battle-chat quick message/reaction
    socket.on('battle_chat', (data: { roomId: string; emoji?: string; phrase?: string }) => {
      if (!currentUser) return;
      const room = gameManager.getRoom(data.roomId);
      if (room) {
        gameManager.handleBattleChat(room, currentUser.userId, data);
      }
    });

    // Leave room / forfeit
    socket.on('leave_room', async (data: { roomId: string }) => {
      if (!currentUser || !data?.roomId) return;
      await gameManager.leaveRoom(data.roomId, currentUser.userId);
      socket.leave(data.roomId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (currentUser) {
        gameManager.leaveMatchmaking(currentUser.userId);
        const becameOffline = presenceManager.userDisconnected(currentUser.userId, socket.id);
        if (becameOffline) {
          io.emit('user_presence_change', { userId: currentUser.userId, is_online: false });
        }
      } else {
        const result = presenceManager.removeSocket(socket.id);
        if (result && result.becameOffline) {
          io.emit('user_presence_change', { userId: result.userId, is_online: false });
        }
      }
      gameManager.handleDisconnect(socket.id);
    });

    // Query presence on demand
    socket.on('get_presence', () => {
      socket.emit('initial_presence', {
        onlineUserIds: presenceManager.getOnlineUserIds(),
      });
    });
  });
}
