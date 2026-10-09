import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket, OpenGameItem } from '../contexts/SocketContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { RPSStage } from '../components/RPSStage.tsx';
import { GameBoard } from '../components/GameBoard.tsx';
import { VSIntro } from '../components/VSIntro.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { 
  CharacterAvatar, 
  StoneIcon, 
  GolemAvatar,
  GolemLevel 
} from '../components/graphics/index.ts';
import { 
  Swords, 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Radio, 
  ArrowRight,
  LogIn,
  Bot,
  Zap,
  Info,
  X,
  ShieldAlert,
  Lock,
  Globe,
  KeyRound
} from 'lucide-react';

const STAKE_OPTIONS = [2, 4, 6, 10];

interface MatchmakingPageProps {
  onOutOfTokens?: () => void;
}

interface GolemConfig {
  level: GolemLevel;
  name: string;
  subtitle: string;
  stake: number;
  winReward: number;
  difficultyDots: number;
  accentColor: string;
  borderColor: string;
  glowColor: string;
}

const GOLEM_TIERS: GolemConfig[] = [
  {
    level: 'easy',
    name: 'Pebble',
    subtitle: 'Do‘stona kichik tosh Golem',
    stake: 2,
    winReward: 2,
    difficultyDots: 1,
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    glowColor: 'shadow-sm',
  },
  {
    level: 'medium',
    name: 'Rocky',
    subtitle: 'Qoya tosh Golem, o‘rtacha qiyinlik',
    stake: 4,
    winReward: 4,
    difficultyDots: 2,
    accentColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    glowColor: 'shadow-sm',
  },
  {
    level: 'hard',
    name: 'Granite',
    subtitle: 'Zirhli granit Golem, tajribali jangchi',
    stake: 6,
    winReward: 8,
    difficultyDots: 3,
    accentColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-500/40 hover:border-orange-400',
    glowColor: 'shadow-sm',
  },
  {
    level: 'expert',
    name: 'Obsidian',
    subtitle: 'Qora vulqon Golemi, qizil ko‘zli usta',
    stake: 10,
    winReward: 20,
    difficultyDots: 4,
    accentColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500/50 hover:border-rose-400',
    glowColor: 'shadow-sm',
  },
];

export const MatchmakingPage: React.FC<MatchmakingPageProps> = ({ onOutOfTokens }) => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const {
    currentRoom,
    openGames,
    isMatchmaking,
    matchmakingStake,
    createRoom,
    joinRoom,
    queueMatch,
    leaveMatchQueue,
    leaveGame,
    createAIGame,
  } = useSocket();

  const [activeTab, setActiveTab] = useState<'pvp' | 'ai'>('pvp');
  const [selectedStake, setSelectedStake] = useState<number>(2);
  const [rakeAmount, setRakeAmount] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [selectedGolem, setSelectedGolem] = useState<GolemConfig | null>(null);
  const [aiStats, setAiStats] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.rakeAmount !== undefined) {
          setRakeAmount(Number(data.rakeAmount));
        }
      })
      .catch(() => {});
  }, []);
  
  // Join by code modal state
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');

  // Create private room with custom 4-digit code modal state
  const [showCreatePrivateModal, setShowCreatePrivateModal] = useState<boolean>(false);
  const [customCodeInput, setCustomCodeInput] = useState<string>('');
  const [createCodeError, setCreateCodeError] = useState<string | null>(null);

  // 20-second PvP matchmaking timeout offer state
  const [searchSeconds, setSearchSeconds] = useState<number>(0);
  const [showAIOffer, setShowAIOffer] = useState<boolean>(false);

  // VS Intro animation state
  const [showVSIntro, setShowVSIntro] = useState<boolean>(false);
  const prevRoomRef = useRef<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isMatchmaking) {
      setSearchSeconds(0);
      setShowAIOffer(false);
      interval = setInterval(() => {
        setSearchSeconds((sec) => {
          const next = sec + 1;
          if (next >= 20) {
            setShowAIOffer(true);
          }
          return next;
        });
      }, 1000);
    } else {
      setSearchSeconds(0);
      setShowAIOffer(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMatchmaking]);

  // Fetch AI stats to display on Golem cards
  useEffect(() => {
    if (token) {
      fetch('/api/game/ai-stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.stats) setAiStats(data.stats);
        })
        .catch(() => {});
    }
  }, [token]);

  // Trigger VS intro when entering a new room with 2 players
  useEffect(() => {
    if (!currentRoom) {
      prevRoomRef.current = null;
      return;
    }
    const roomId = currentRoom.roomId;
    if (currentRoom.player2 && prevRoomRef.current !== roomId) {
      prevRoomRef.current = roomId;
      setShowVSIntro(true);
    }
  }, [currentRoom?.roomId, currentRoom?.player2, currentRoom?.status]);

  const handleVSIntroComplete = useCallback(() => {
    setShowVSIntro(false);
  }, []);

  // If in RPS or Game, show interactive arena
  if (currentRoom) {
    if (showVSIntro && currentRoom.player2) {
      return <VSIntro onComplete={handleVSIntroComplete} />;
    }

    if (currentRoom.status === 'rps') {
      return <RPSStage />;
    }
    if (currentRoom.status === 'in_progress' || currentRoom.status === 'finished') {
      return <GameBoard />;
    }

    // Room is 'waiting' for opponent
    const shareLink = `https://t.me/share/url?url=https://t.me/xoxoglobalbot?startapp=${currentRoom.roomId}&text=Men bilan XOXO o‘yinida kuch sinash!`;

    const handleCopy = () => {
      navigator.clipboard.writeText(currentRoom.roomId);
      setCopiedCode(true);
      sounds.playClick();
      haptics.notification('success');
      setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleTelegramShare = () => {
      haptics.selection();
      if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareLink);
      } else {
        window.open(shareLink, '_blank');
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-6 max-w-sm mx-auto text-center animate-fadeIn select-none">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full glass-surface border-2 border-purple-500/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-md">
            <Radio className="w-12 h-12 animate-pulse" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white flex items-center space-x-1 shadow-sm">
            <StoneIcon size="xs" />
            <span>{t('dashboard.stones_other', { count: currentRoom.stake })}</span>
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{t('matchmaking.searching_opponent')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
          {currentRoom.isPrivate ? "Shaxsiy xona kodi bilan do‘stingizni taklif qiling" : t('matchmaking.invite_friend')}
        </p>

        {/* Room Code Card */}
        <div className="w-full glass-surface p-3.5 rounded-3xl border border-white/70 dark:border-white/10 my-5 flex items-center justify-between shadow-sm specular-rim">
          <div className="text-left pl-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider flex items-center gap-1">
              {currentRoom.isPrivate ? <><Lock className="w-3 h-3 text-purple-500" /> Shaxsiy xona kodi</> : t('matchmaking.room_code')}
            </span>
            <span className="font-mono font-black text-xl text-purple-600 dark:text-purple-400 tracking-widest block mt-0.5">
              {currentRoom.roomId}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/15 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all active:scale-95 shadow-sm"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? t('matchmaking.copied') : t('matchmaking.copy_link')}</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleTelegramShare}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-extrabold text-sm text-white flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all mb-3"
        >
          <Share2 className="w-4 h-4" />
          <span>{t('matchmaking.share_tg')}</span>
        </button>

        {/* Cancel waiting */}
        <button
          onClick={leaveGame}
          className="text-xs font-bold text-rose-500 hover:text-rose-600 py-2 transition-colors"
        >
          {t('matchmaking.cancel')}
        </button>
      </div>
    );
  }

  // Lobby & Matchmaking Setup View
  const handleQuickMatch = () => {
    if ((user?.token_balance || 0) < selectedStake) {
      onOutOfTokens?.();
      return;
    }
    sounds.playClick();
    haptics.impact('heavy');
    queueMatch(selectedStake);
  };

  const handleCreateOpenRoom = () => {
    if ((user?.token_balance || 0) < selectedStake) {
      onOutOfTokens?.();
      return;
    }
    sounds.playClick();
    haptics.selection();
    createRoom(selectedStake, false);
  };

  const handleOpenCreatePrivate = () => {
    if ((user?.token_balance || 0) < selectedStake) {
      onOutOfTokens?.();
      return;
    }
    sounds.playClick();
    setCustomCodeInput('');
    setCreateCodeError(null);
    setShowCreatePrivateModal(true);
  };

  const handleConfirmCreatePrivate = () => {
    const cleanCode = customCodeInput.trim();
    if (!/^\d{4}$/.test(cleanCode)) {
      setCreateCodeError(t('matchmaking.code_invalid_error'));
      return;
    }
    sounds.playClick();
    haptics.selection();
    createRoom(selectedStake, true, cleanCode);
    setShowCreatePrivateModal(false);
  };

  const handleConfirmJoin = () => {
    const code = joinCodeInput.trim();
    if (code.length !== 4) return;
    if ((user?.token_balance || 0) < 1) {
      setShowJoinModal(false);
      onOutOfTokens?.();
      return;
    }
    sounds.playClick();
    haptics.selection();
    joinRoom(code);
    setShowJoinModal(false);
  };

  const handleConfirmAIBattle = (golem: GolemConfig) => {
    if ((user?.token_balance || 0) < golem.stake) {
      setSelectedGolem(null);
      onOutOfTokens?.();
      return;
    }
    sounds.playClick();
    haptics.impact('heavy');
    createAIGame(golem.level);
    setSelectedGolem(null);
  };

  return (
    <div className="space-y-4 pb-24 safe-bottom-padding animate-fadeIn select-none">
      {/* Insufficient Stone Alert */}
      {(user?.token_balance || 0) < 1 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 text-xs">
            <StoneIcon size="sm" />
            <span className="font-bold">{t('ai_opponent.insufficient_balance')}</span>
          </div>
          <button
            onClick={onOutOfTokens}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            {t('dashboard.buy_stones')}
          </button>
        </div>
      )}

      {/* Mode Switcher Tabs: PvP vs AI Golem (Apple Liquid Glass Segmented Control) */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl glass-surface border border-white/70 dark:border-white/10 shadow-sm specular-rim">
        <button
          onClick={() => {
            sounds.playClick();
            haptics.selection();
            setActiveTab('pvp');
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 font-black text-xs transition-all ${
            activeTab === 'pvp'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>{t('matchmaking.tab_pvp')}</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            haptics.selection();
            setActiveTab('ai');
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 font-black text-xs transition-all ${
            activeTab === 'ai'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{t('matchmaking.tab_ai')}</span>
        </button>
      </div>

      {/* TAB 1: PVP MODE */}
      {activeTab === 'pvp' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Stake Selector */}
          <div className="glass-surface rounded-3xl p-5 border border-white/70 dark:border-white/10 shadow-md specular-rim">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <StoneIcon size="xs" />
                <span>{t('matchmaking.select_stake')}</span>
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center space-x-1">
                <span>{t('ai_opponent.reward_label')}:</span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono">+{selectedStake * 2 - rakeAmount}</span>
                <span className="text-[10px] uppercase text-amber-600 dark:text-amber-400">{t('dashboard.insert_coin')}</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {STAKE_OPTIONS.map((stake) => {
                const isSelected = selectedStake === stake;
                const canAfford = (user?.token_balance || 0) >= stake;
                const payout = stake * 2 - rakeAmount;

                return (
                  <button
                    key={stake}
                    disabled={!canAfford}
                    onClick={() => {
                      sounds.playClick();
                      haptics.selection();
                      setSelectedStake(stake);
                    }}
                    className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center border transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/15 shadow-sm scale-102 font-black text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/30'
                        : canAfford
                        ? 'border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-purple-400/40 text-slate-700 dark:text-slate-300'
                        : 'border-slate-200/30 dark:border-white/5 bg-slate-100/30 dark:bg-white/2 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-base font-extrabold font-mono">{stake}</span>
                    <span className="text-[9px] uppercase font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.insert_coin')}</span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+{payout}</span>
                  </button>
                );
              })}
            </div>

            {/* Transparent Platform Commission Breakdown */}
            <div className="mt-3 p-3 rounded-2xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-400/25 text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {t('matchmaking.stake_rake_info', {
                stake: selectedStake,
                payout: selectedStake * 2 - rakeAmount,
                rake: rakeAmount,
              })}
            </div>

            {/* Quick Match Action */}
            <div className="mt-4">
              {isMatchmaking ? (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-400/40 text-center animate-pulse">
                  <div className="flex items-center justify-center space-x-2 text-purple-700 dark:text-purple-300 font-extrabold text-sm mb-2">
                    <Radio className="w-5 h-5 animate-spin" />
                    <span>{t('matchmaking.searching_opponent')} ({t('dashboard.stones_other', { count: matchmakingStake })}) [{searchSeconds}s]</span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      leaveMatchQueue();
                    }}
                    className="px-4 py-1.5 rounded-xl bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/15 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors"
                  >
                    {t('matchmaking.cancel')}
                  </button>

                  {/* 20s Timeout Offer Modal/Prompt */}
                  {showAIOffer && (
                    <div className="mt-3 p-3.5 rounded-2xl glass-modal-card text-left shadow-xl border border-purple-400/50">
                      <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1">
                        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <span>{t('matchmaking.ai_timeout_offer_title')}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-3">
                        {t('matchmaking.ai_timeout_offer_desc')}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            leaveMatchQueue();
                            setActiveTab('ai');
                            sounds.playClick();
                          }}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-sm text-center"
                        >
                          {t('matchmaking.ai_timeout_offer_accept')}
                        </button>
                        <button
                          onClick={() => setShowAIOffer(false)}
                          className="px-3 py-2 rounded-xl bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                        >
                          {t('matchmaking.ai_timeout_offer_decline')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleQuickMatch}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-black text-sm text-white flex items-center justify-center space-x-2 shadow-md hover:brightness-105 active:scale-98 transition-all"
                >
                  <Swords className="w-5 h-5" />
                  <span>{t('matchmaking.quick_match')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Create / Join Room Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCreateOpenRoom}
              className="glass-surface p-3 rounded-2xl border border-white/70 dark:border-white/10 flex flex-col items-center justify-center space-y-1 hover:border-purple-400/40 transition-all active:scale-95 text-center shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block leading-tight">{t('matchmaking.open_room')}</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block">{t('matchmaking.open_room_desc')}</span>
            </button>

            <button
              onClick={handleOpenCreatePrivate}
              className="glass-surface p-3 rounded-2xl border border-purple-500/30 flex flex-col items-center justify-center space-y-1 hover:border-purple-400/60 bg-purple-500/5 transition-all active:scale-95 text-center shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block leading-tight">{t('matchmaking.private_room')}</span>
              <span className="text-[9px] text-purple-600 dark:text-purple-300 block">{t('matchmaking.private_room_desc')}</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setJoinCodeInput('');
                setShowJoinModal(true);
              }}
              className="glass-surface p-3 rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center space-y-1 hover:border-emerald-400/60 bg-emerald-500/5 transition-all active:scale-95 text-center shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <KeyRound className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block leading-tight">{t('matchmaking.join_with_code')}</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-300 block">{t('matchmaking.code_sub')}</span>
            </button>
          </div>

          {/* Open Games Lobby List */}
          <div className="glass-surface rounded-3xl p-4 border border-white/70 dark:border-white/10 shadow-sm specular-rim">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{t('matchmaking.open_rooms')}</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {t('matchmaking.open_rooms_count', { count: openGames.length })}
              </span>
            </div>

            {openGames.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-slate-500 dark:text-slate-400">
                {t('matchmaking.no_rooms')}
              </div>
            ) : (
              <div className="space-y-2">
                {openGames.map((game: OpenGameItem) => {
                  return (
                    <div
                      key={game.roomId}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 hover:border-purple-400/30 transition-all shadow-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CharacterAvatar avatarId={game.hostAvatar || 'ninja'} size={36} />
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">{game.hostNickname}</span>
                          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold flex items-center space-x-1">
                            <StoneIcon size="xs" />
                            <span>{t('game.total_stake', { count: game.stake })}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          haptics.selection();
                          joinRoom(game.roomId);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all"
                      >
                        <span>{t('matchmaking.join')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI GOLEM MODE */}
      {activeTab === 'ai' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Header banner */}
          <div className="glass-surface rounded-3xl p-4 border border-rose-500/20 bg-rose-500/5 flex items-center justify-between shadow-sm specular-rim">
            <div>
              <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>{t('ai_opponent.header_banner_title')}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                {t('ai_opponent.header_banner_desc')}
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-right">
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase">{t('ai_opponent.daily_limit_label')}</span>
              <span className="text-xs font-black text-amber-700 dark:text-amber-300 font-mono">{t('ai_opponent.daily_limit_val')}</span>
            </div>
          </div>

          {/* 4 Golem Tier Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOLEM_TIERS.map((golem) => {
              const row = aiStats.find((s) => s.level === golem.level) || { wins: 0, draws: 0, losses: 0 };
              const canAfford = (user?.token_balance || 0) >= golem.stake;
              const golemLocalizedName = t(`ai_opponent.${golem.level}_name`) || golem.name;
              const golemLocalizedDesc = t(`ai_opponent.${golem.level}_desc`) || golem.subtitle;
              const golemLevelLabel = t(`ai_opponent.level_${golem.level}`);

              return (
                <div
                  key={golem.level}
                  onClick={() => {
                    sounds.playClick();
                    haptics.selection();
                    setSelectedGolem(golem);
                  }}
                  className={`glass-surface rounded-3xl p-4 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between specular-rim shadow-sm ${
                    golem.borderColor
                  } ${golem.glowColor} ${!canAfford ? 'opacity-85' : 'hover:scale-102 active:scale-98'}`}
                >
                  {/* Top Bar: Name + Difficulty Dots */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">{golemLocalizedName}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 ${golem.accentColor}`}>
                          {golemLevelLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{golemLocalizedDesc}</p>
                    </div>

                    {/* Difficulty Dots (1-4) */}
                    <div className="flex space-x-1" title={`${golem.difficultyDots}/4`}>
                      {[1, 2, 3, 4].map((dot) => (
                        <div
                          key={dot}
                          className={`w-2 h-2 rounded-full ${
                            dot <= golem.difficultyDots ? 'bg-rose-500' : 'bg-slate-200 dark:bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Center: Golem Character Illustration */}
                  <div className="py-2.5 flex items-center justify-center">
                    <GolemAvatar level={golem.level} size={84} glow={true} />
                  </div>

                  {/* Bottom: Stakes, Win Reward & User Stats */}
                  <div className="pt-2 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">{t('ai_opponent.entry_reward_label')}</span>
                      <div className="flex items-center space-x-1.5 font-bold font-mono">
                        <span className="text-slate-700 dark:text-slate-300">{golem.stake}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-600 dark:text-emerald-400">+{golem.winReward}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">{t('ai_opponent.your_result')}</span>
                      <div className="text-[11px] font-mono font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">{row.wins}W</span>
                        <span className="text-slate-400 mx-0.5">/</span>
                        <span className="text-rose-600 dark:text-rose-400">{row.losses}L</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Golem Battle Confirmation Modal with Scrim */}
      {selectedGolem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 glass-scrim animate-fade-in"
            onClick={() => setSelectedGolem(null)}
          />

          <div className="relative z-10 w-full max-w-sm glass-modal-card rounded-3xl p-5 shadow-2xl overflow-hidden animate-scale-up">
            <button
              onClick={() => setSelectedGolem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto my-2 flex items-center justify-center">
                <GolemAvatar level={selectedGolem.level} size={80} glow={true} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t(`ai_opponent.${selectedGolem.level}_name`) || selectedGolem.name}</h3>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 ${selectedGolem.accentColor}`}>
                {t(`ai_opponent.level_${selectedGolem.level}`)}
              </span>
            </div>

            {/* Economy Rules Breakdown */}
            <div className="my-4 p-3.5 rounded-2xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('ai_opponent.rules_entry')}</span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono flex items-center space-x-1">
                  <StoneIcon size="xs" />
                  <span>{t('dashboard.stones_other', { count: selectedGolem.stake })}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>{t('ai_opponent.rules_win')}</span>
                <span className="font-black font-mono">{t('ai_opponent.rules_win_val', { reward: selectedGolem.winReward })}</span>
              </div>
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold">
                <span>{t('ai_opponent.rules_draw')}</span>
                <span className="font-bold font-mono">{t('ai_opponent.rules_draw_val')}</span>
              </div>
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-semibold">
                <span>{t('ai_opponent.rules_lose')}</span>
                <span className="font-bold font-mono">{t('ai_opponent.rules_lose_val', { stake: selectedGolem.stake })}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 px-1 text-center">
              {t('ai_opponent.disclaimer')}
            </div>

            {/* Action Buttons */}
            {(user?.token_balance || 0) < selectedGolem.stake ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center flex items-center justify-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t('ai_opponent.insufficient_balance')}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedGolem(null);
                    onOutOfTokens?.();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all text-center"
                >
                  {t('ai_opponent.buy_stones_promo')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConfirmAIBattle(selectedGolem)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{t('ai_opponent.start_fight_btn', { stake: selectedGolem.stake })}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Private Room Modal (4-digit numeric code) */}
      {showCreatePrivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 glass-scrim animate-fade-in"
            onClick={() => setShowCreatePrivateModal(false)}
          />

          <div className="relative z-10 w-full max-w-xs glass-modal-card rounded-3xl p-5 shadow-2xl animate-scale-up">
            <button
              onClick={() => setShowCreatePrivateModal(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('matchmaking.create_private_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('matchmaking.create_private_hint')}</p>
              
              <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <StoneIcon size="xs" />
                <span>{t('dashboard.stones_other', { count: selectedStake })}</span>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoFocus
                value={customCodeInput}
                onChange={(e) => {
                  setCustomCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setCreateCodeError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customCodeInput.length === 4) handleConfirmCreatePrivate();
                }}
                placeholder="1234"
                className="w-full text-center text-3xl font-black font-mono tracking-widest py-3 px-4 rounded-2xl glass-input placeholder-slate-400"
              />

              {createCodeError && (
                <p className="text-xs text-rose-500 font-semibold text-center">{createCodeError}</p>
              )}

              <button
                disabled={customCodeInput.length !== 4}
                onClick={handleConfirmCreatePrivate}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
                  customCodeInput.length === 4
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md active:scale-95'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{t('matchmaking.create_private_btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join By Code Modal (4-digit numeric code) */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 glass-scrim animate-fade-in"
            onClick={() => setShowJoinModal(false)}
          />

          <div className="relative z-10 w-full max-w-xs glass-modal-card rounded-3xl p-5 shadow-2xl animate-scale-up">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('matchmaking.enter_room')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('matchmaking.enter_code_hint')}</p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoFocus
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && joinCodeInput.length === 4) handleConfirmJoin();
                }}
                placeholder="1234"
                className="w-full text-center text-3xl font-black font-mono tracking-widest py-3 px-4 rounded-2xl glass-input placeholder-slate-400"
              />

              <button
                disabled={joinCodeInput.trim().length !== 4}
                onClick={handleConfirmJoin}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
                  joinCodeInput.trim().length === 4
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md active:scale-95'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{t('matchmaking.enter_room')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MatchmakingPage;
