import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { BACKEND_URL } from '../config/api.ts';

export interface OpenGameItem {
  roomId: string;
  hostNickname: string;
  hostAvatar: string;
  stake: number;
}

export interface ChatMessage {
  id: string;
  senderId: number;
  emoji: string | null;
  phrase: string | null;
  timestamp: number;
}

export interface ActiveGameState {
  board: (string | null)[];
  turn: 'X' | 'O';
  phase?: 'placing' | 'moving';
  marks: {
    X: number[];
    O: number[];
  };
  nextToVanish?: {
    X: number | null;
    O: number | null;
  };
  winner: 'X' | 'O' | null;
  winningLine: number[] | null;
  status: 'in_progress' | 'won' | 'draw' | 'abandoned';
  moveCount: number;
  movingPhaseMoves?: number;
  history: Array<{
    player: 'X' | 'O';
    from?: number;
    to: number;
    timestamp: number;
  }>;
}

export interface GameRoomView {
  roomId: string;
  stake: number;
  status: 'waiting' | 'rps' | 'in_progress' | 'finished' | 'abandoned';
  isAiGame?: boolean;
  aiLevel?: 'easy' | 'medium' | 'hard' | 'expert' | null;
  player1: {
    userId: number;
    nickname: string;
    avatarUrl: string;
    symbol: 'X' | 'O' | null;
    isBot?: boolean;
  };
  player2: {
    userId: number;
    nickname: string;
    avatarUrl: string;
    symbol: 'X' | 'O' | null;
    isBot?: boolean;
  } | null;
  isPrivate?: boolean;
}

export interface RPSViewData {
  round: number;
  timeoutSeconds: number;
  sealedUsers: number[];
  revealed: boolean;
  player1Choice: 'rock' | 'paper' | 'scissors' | null;
  player2Choice: 'rock' | 'paper' | 'scissors' | null;
  winner: 'player1' | 'player2' | 'draw' | null;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineCount: number;
  openGames: OpenGameItem[];
  currentRoom: GameRoomView | null;
  gameState: ActiveGameState | null;
  rpsData: RPSViewData | null;
  turnDeadline: number | null;
  isMatchmaking: boolean;
  matchmakingStake: number;
  chatMessages: ChatMessage[];
  aiThinking: boolean;
  insufficientBalanceInfo: { message: string; stake: number; balance: number } | null;
  clearInsufficientBalanceInfo: () => void;
  lastGameOver: {
    winnerId?: number | null;
    winnerNickname?: string;
    winnerSymbol?: 'X' | 'O';
    winningLine?: number[] | null;
    prize: number;
    netReward?: number;
    rakeAmount?: number;
    isCapped?: boolean;
    capNotice?: string | null;
    isAiGame?: boolean;
    isDraw?: boolean;
    reason?: string | null;
  } | null;
  createRoom: (stake: number, isPrivate?: boolean, customCode?: string) => void;
  createAIGame: (level: 'easy' | 'medium' | 'hard' | 'expert') => void;
  joinRoom: (roomId: string) => void;
  queueMatch: (stake: number) => void;
  leaveMatchQueue: () => void;
  submitRPSChoice: (choice: 'rock' | 'paper' | 'scissors') => void;
  makeMove: (to: number, from?: number) => void;
  sendBattleChat: (emoji?: string, phrase?: string) => void;
  leaveGame: () => void;
  onlineUserIds: Set<number>;
  isUserOnline: (userId: number) => boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, refreshUser } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [openGames, setOpenGames] = useState<OpenGameItem[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoomView | null>(null);
  const [gameState, setGameState] = useState<ActiveGameState | null>(null);
  const [rpsData, setRpsData] = useState<RPSViewData | null>(null);
  const [turnDeadline, setTurnDeadline] = useState<number | null>(null);
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [matchmakingStake, setMatchmakingStake] = useState<number>(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [insufficientBalanceInfo, setInsufficientBalanceInfo] = useState<{ message: string; stake: number; balance: number } | null>(null);
  const [lastGameOver, setLastGameOver] = useState<any>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  const isUserOnline = (userId: number) => onlineUserIds.has(Number(userId));

  useEffect(() => {
    const s = io(BACKEND_URL || '/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      setIsConnected(true);
      if (token) {
        s.emit('auth', { token });
      }
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('open_games_update', (data: { games: OpenGameItem[]; onlineCount: number }) => {
      setOpenGames(data.games || []);
      setOnlineCount(data.onlineCount || 1);
    });

    s.on('initial_presence', (data: { onlineUserIds: number[] }) => {
      setOnlineUserIds(new Set((data.onlineUserIds || []).map(Number)));
    });

    s.on('user_presence_change', (data: { userId: number; is_online: boolean }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (data.is_online) {
          next.add(Number(data.userId));
        } else {
          next.delete(Number(data.userId));
        }
        return next;
      });
    });

    s.on('room_created', (data: { roomId: string; room: GameRoomView }) => {
      setCurrentRoom(data.room);
      setGameState(null);
      setRpsData(null);
      setLastGameOver(null);
      sounds.playClick();
      haptics.selection();
    });

    s.on('ai_game_created', (data: { roomId: string; room: GameRoomView }) => {
      setCurrentRoom(data.room);
      setGameState(null);
      setRpsData(null);
      setLastGameOver(null);
      sounds.playClick();
      haptics.selection();
    });

    s.on('ai_thinking', (data: { isThinking: boolean }) => {
      setAiThinking(data.isThinking);
    });

    s.on('room_joined', (data: { roomId: string; room: GameRoomView }) => {
      setCurrentRoom(data.room);
      setGameState(null);
      setRpsData(null);
      setLastGameOver(null);
      sounds.playClick();
      haptics.selection();
    });

    s.on('opponent_joined', (data: { player2: any }) => {
      setCurrentRoom(prev => (prev ? { ...prev, player2: data.player2 } : null));
      sounds.playClick();
      haptics.impact('medium');
    });

    s.on('match_found', (data: { roomId: string; stake: number; player1: any; player2: any }) => {
      setIsMatchmaking(false);
      setCurrentRoom({
        roomId: data.roomId,
        stake: data.stake,
        status: 'waiting',
        player1: data.player1,
        player2: data.player2,
      });
      sounds.playClick();
      haptics.notification('success');
    });

    s.on('rps_started', (data: { roomId: string; round: number; timeoutSeconds: number }) => {
      setCurrentRoom(prev => (prev ? { ...prev, status: 'rps' } : null));
      setRpsData({
        round: data.round,
        timeoutSeconds: data.timeoutSeconds,
        sealedUsers: [],
        revealed: false,
        player1Choice: null,
        player2Choice: null,
        winner: null,
      });
      sounds.playClick();
      haptics.impact('light');
    });

    s.on('rps_choice_sealed', (data: { userId: number }) => {
      setRpsData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sealedUsers: [...prev.sealedUsers, data.userId],
        };
      });
      haptics.selection();
    });

    s.on('rps_revealed', (data: any) => {
      setRpsData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          revealed: true,
          player1Choice: data.player1.choice,
          player2Choice: data.player2.choice,
          winner: data.winner,
        };
      });

      // Update room player symbols
      setCurrentRoom(prev => {
        if (!prev) return null;
        return {
          ...prev,
          player1: { ...prev.player1, symbol: data.player1.symbol },
          player2: prev.player2 ? { ...prev.player2, symbol: data.player2.symbol } : null,
        };
      });

      if (data.winner === 'draw') {
        haptics.impact('medium');
      } else {
        haptics.notification('success');
        sounds.playClick();
      }
    });

    s.on('game_state_update', (data: { state: ActiveGameState; player1: any; player2: any }) => {
      setGameState(prevState => {
        // Sound trigger on moves
        if (prevState && data.state.moveCount > prevState.moveCount) {
          const lastMove = data.state.history[data.state.history.length - 1];
          if (lastMove) {
            sounds.playMove(lastMove.player);
            if (lastMove.from !== undefined) {
              haptics.impact('heavy');
            } else {
              haptics.impact('medium');
            }
          }
        }
        return data.state;
      });

      setCurrentRoom(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'in_progress',
          player1: data.player1,
          player2: data.player2,
        };
      });
    });

    s.on('turn_timer', (data: { turn: 'X' | 'O'; deadline: number; seconds: number }) => {
      setTurnDeadline(data.deadline);
    });

    s.on('battle_chat_message', (msg: { senderId: number; emoji: string | null; phrase: string | null; timestamp: number }) => {
      const newMsg: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random()}`,
        ...msg,
      };
      setChatMessages(prev => [...prev.slice(-10), newMsg]);
      sounds.playChatPop();
      haptics.impact('light');
    });

    s.on('game_over', (data: any) => {
      setLastGameOver({
        ...data,
        winnerSymbol: data.winnerSymbol || data.winner || null,
        winningLine: data.winningLine || null,
        reason: data.reason || null,
      });
      setCurrentRoom(prev => (prev ? { ...prev, status: 'finished' } : null));

      // Result sound/haptics are played per-client by GameBoard (win / lose / draw).

      // Refresh balance and stats
      refreshUser();
    });

    s.on('opponent_left', (data: { reason?: string; winnerId?: number; prize?: number; rakeAmount?: number }) => {
      setLastGameOver({
        reason: data?.reason || 'Raqib o\'yinni tark etdi',
        isDraw: false,
        prize: data?.prize || 0,
        rakeAmount: data?.rakeAmount,
        winnerId: data?.winnerId,
      });
      setCurrentRoom(prev => (prev ? { ...prev, status: 'finished' } : null));
      refreshUser();
    });

    s.on('user_balance_update', (data: { token_balance: number }) => {
      refreshUser();
    });

    s.on('insufficient_balance', (data: { message?: string; stake?: number; balance?: number }) => {
      setIsMatchmaking(false);
      setInsufficientBalanceInfo({
        message: data?.message || 'Yetarli tosh mavjud emas',
        stake: data?.stake || 1,
        balance: data?.balance ?? (user?.token_balance || 0),
      });
      sounds.playClick();
      haptics.notification('error');
      refreshUser();
    });

    s.on('error', (data: { message?: string }) => {
      if (data?.message?.toLowerCase().includes('tosh') || data?.message?.toLowerCase().includes('balance')) {
        setIsMatchmaking(false);
        setInsufficientBalanceInfo({
          message: data.message || 'Yetarli tosh mavjud emas',
          stake: 1,
          balance: user?.token_balance || 0,
        });
        haptics.notification('error');
        refreshUser();
      }
    });

    s.on('game_draw', (data: any) => {
      setLastGameOver({ ...data, isDraw: true, prize: data.prize });
      setCurrentRoom(prev => (prev ? { ...prev, status: 'finished' } : null));
      refreshUser();
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  const clearInsufficientBalanceInfo = () => {
    setInsufficientBalanceInfo(null);
  };

  const createRoom = (stake: number, isPrivate = false, customCode?: string) => {
    if (socket) {
      socket.emit('create_room', { stake, isPrivate, customCode });
    }
  };

  const createAIGame = (level: 'easy' | 'medium' | 'hard' | 'expert') => {
    if (socket) {
      socket.emit('create_ai_game', { level });
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join_room', { roomId });
    }
  };

  const queueMatch = (stake: number) => {
    if (socket) {
      setIsMatchmaking(true);
      setMatchmakingStake(stake);
      socket.emit('queue_match', { stake });
    }
  };

  const leaveMatchQueue = () => {
    if (socket) {
      setIsMatchmaking(false);
      socket.emit('leave_match_queue');
    }
  };

  const submitRPSChoice = (choice: 'rock' | 'paper' | 'scissors') => {
    if (socket && currentRoom) {
      socket.emit('rps_choice', { roomId: currentRoom.roomId, choice });
    }
  };

  const makeMove = (to: number, from?: number) => {
    if (socket && currentRoom) {
      socket.emit('game_move', { roomId: currentRoom.roomId, to, from });
    }
  };

  const sendBattleChat = (emoji?: string, phrase?: string) => {
    if (socket && currentRoom) {
      socket.emit('battle_chat', { roomId: currentRoom.roomId, emoji, phrase });
    }
  };

  const leaveGame = () => {
    if (socket && currentRoom) {
      socket.emit('leave_room', { roomId: currentRoom.roomId });
    }
    setCurrentRoom(null);
    setGameState(null);
    setRpsData(null);
    setLastGameOver(null);
    setChatMessages([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineCount,
        openGames,
        currentRoom,
        gameState,
        rpsData,
        turnDeadline,
        isMatchmaking,
        matchmakingStake,
        chatMessages,
        aiThinking,
        insufficientBalanceInfo,
        clearInsufficientBalanceInfo,
        lastGameOver,
        createRoom,
        createAIGame,
        joinRoom,
        queueMatch,
        leaveMatchQueue,
        submitRPSChoice,
        makeMove,
        sendBattleChat,
        leaveGame,
        onlineUserIds,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
