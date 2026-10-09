import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { BattleChat } from './BattleChat.tsx';
import { WinLineOverlay } from './WinLineOverlay.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import confetti from 'canvas-confetti';
import { 
  CharacterAvatar, 
  StoneIcon, 
  GolemAvatar,
  NeonXMark,
  NeonOMark,
  LiquidPiggy,
  LiquidTrophy,
  LiquidHandshake
} from './graphics/index.ts';
import { 
  Clock, 
  Zap, 
  Bot, 
  HelpCircle,
  RotateCcw,
  LogOut,
  Info,
  Trophy
} from 'lucide-react';

// How long (ms) to display win line before showing result modal
const WIN_LINE_DISPLAY_MS = 1500;
// How long (ms) to display final board state on draw before showing result
const DRAW_DISPLAY_MS = 1000;

export const GameBoard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { 
    currentRoom, 
    gameState, 
    turnDeadline, 
    makeMove, 
    lastGameOver, 
    leaveGame, 
    queueMatch,
    createAIGame,
    aiThinking 
  } = useSocket();

  const [turnSecondsLeft, setTurnSecondsLeft] = useState(20);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  
  // Win line delay state machine
  const [showWinLine, setShowWinLine] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [prizeAnimated, setPrizeAnimated] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const resultSoundPlayedRef = useRef(false);
  const [boardSize, setBoardSize] = useState(280);

  useEffect(() => {
    if (!turnDeadline) return;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((turnDeadline - Date.now()) / 1000));
      setTurnSecondsLeft(remaining);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 250);
    return () => clearInterval(interval);
  }, [turnDeadline]);

  // Reset selected piece when turn changes
  useEffect(() => {
    setSelectedPiece(null);
  }, [gameState?.turn]);

  // Measure actual board size for WinLineOverlay
  useEffect(() => {
    if (!boardRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBoardSize(entry.contentRect.width);
      }
    });
    obs.observe(boardRef.current);
    return () => obs.disconnect();
  }, []);

  // Win line + result delay logic (strictly preserved from Task 5)
  useEffect(() => {
    if (!lastGameOver) {
      setShowWinLine(false);
      setShowResultModal(false);
      setPrizeAnimated(0);
      return;
    }

    // If there is a winning line (not draw, not abandon), show it first for 1.5s
    if (lastGameOver.winningLine && lastGameOver.winningLine.length === 3 && !lastGameOver.isDraw) {
      setShowWinLine(true);
      setShowResultModal(false);
      sounds.playWinDing();
      haptics.impact('medium');

      const timer = setTimeout(() => {
        setShowWinLine(false);
        setShowResultModal(true);
      }, WIN_LINE_DISPLAY_MS);
      return () => clearTimeout(timer);
    } else if (lastGameOver.isDraw) {
      // Draw: show board for 1s, then result
      setShowWinLine(false);
      setShowResultModal(false);
      const timer = setTimeout(() => {
        setShowResultModal(true);
      }, DRAW_DISPLAY_MS);
      return () => clearTimeout(timer);
    } else {
      // Surrender / disconnect — show result immediately
      setShowResultModal(true);
    }
  }, [lastGameOver]);

  // Animate prize counter
  useEffect(() => {
    if (!showResultModal || !lastGameOver) return;
    const target = lastGameOver.prize || 0;
    if (target <= 0) { setPrizeAnimated(target); return; }
    let current = 0;
    const step = Math.ceil(target / 15);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setPrizeAnimated(current);
      if (current >= target) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [showResultModal, lastGameOver]);

  // Result audio + haptics: every client independently derives ITS OWN outcome
  // (win / lose / draw) from the server payload, and plays the matching signal once.
  useEffect(() => {
    if (!lastGameOver) {
      resultSoundPlayedRef.current = false;
      return;
    }
    if (!showResultModal || resultSoundPlayedRef.current) return;
    resultSoundPlayedRef.current = true;

    const outcome: 'win' | 'lose' | 'draw' | 'none' = lastGameOver.isDraw
      ? 'draw'
      : lastGameOver.winnerId == null
      ? 'none' // no winner (e.g. waiting-room notice) -> no result signal
      : lastGameOver.winnerId === user?.id
      ? 'win'
      : 'lose';

    switch (outcome) {
      case 'win':
        sounds.playWin();
        haptics.notification('success');
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
          setTimeout(() => confetti({ particleCount: 45, spread: 95, origin: { y: 0.7 } }), 280);
        } catch (_) {}
        break;
      case 'draw':
        sounds.playDraw();
        haptics.impact('medium');
        break;
      case 'lose':
        sounds.playDefeat();
        haptics.notification('error');
        break;
      default:
        break;
    }
  }, [showResultModal, lastGameOver, user?.id]);



  if (!currentRoom || !gameState) return null;

  const isPlayer1 = currentRoom.player1.userId === user?.id;
  const mySymbol = isPlayer1 ? currentRoom.player1.symbol : currentRoom.player2?.symbol;
  const opponentSymbol = mySymbol === 'X' ? 'O' : 'X';
  const isMyTurn = gameState.turn === mySymbol && gameState.status === 'in_progress';

  const isOpponentBot = currentRoom.isAiGame || currentRoom.player2?.isBot;
  const aiLevel = currentRoom.aiLevel || 'easy';

  const myNickname = isPlayer1 ? currentRoom.player1.nickname : currentRoom.player2?.nickname || 'Siz';
  const oppNickname = isOpponentBot 
    ? (aiLevel === 'easy' ? 'Pebble Golem' : aiLevel === 'medium' ? 'Rocky Golem' : aiLevel === 'hard' ? 'Granite Golem' : 'Obsidian Golem')
    : (isPlayer1 ? currentRoom.player2?.nickname || 'Raqib' : currentRoom.player1.nickname);

  const myMarksCount = mySymbol ? (gameState.marks?.[mySymbol]?.length || 0) : 0;
  const isMovingPhase = gameState.phase === 'moving' || myMarksCount >= 3;

  const handleCellClick = (cellIndex: number) => {
    if (!isMyTurn) return;
    if (lastGameOver) return;

    const cellValue = gameState.board[cellIndex];

    // Phase 1: Placement (< 3 pieces)
    if (!isMovingPhase) {
      if (cellValue === null) {
        sounds.playClick();
        haptics.impact('light');
        makeMove(cellIndex);
      }
      return;
    }

    // Phase 2: Movement (3 pieces on board)
    if (cellValue === mySymbol) {
      sounds.playClick();
      haptics.selection();
      if (selectedPiece === cellIndex) {
        setSelectedPiece(null);
      } else {
        setSelectedPiece(cellIndex);
      }
      return;
    }

    // If clicking empty cell while a piece is selected, execute move
    if (cellValue === null && selectedPiece !== null) {
      sounds.playClick();
      haptics.impact('medium');
      makeMove(cellIndex, selectedPiece);
      setSelectedPiece(null);
    }
  };

  const isWinningCell = (index: number) => {
    const line = showWinLine ? (lastGameOver?.winningLine || gameState.winningLine) : gameState.winningLine;
    return line?.includes(index);
  };

  const handlePlayAgain = () => {
    sounds.playClick();
    const reqStake = currentRoom.stake;
    if ((user?.token_balance || 0) < reqStake) {
      leaveGame();
      return;
    }

    if (currentRoom.isAiGame && currentRoom.aiLevel) {
      createAIGame(currentRoom.aiLevel);
    } else {
      leaveGame();
      queueMatch(currentRoom.stake);
    }
  };

  const handleLeaveGame = () => {
    sounds.playClick();
    leaveGame();
  };

  // Winner calculation for defeat screen
  const isWinnerPlayer1 = lastGameOver?.winnerId === currentRoom.player1.userId;
  const winnerPlayer = isWinnerPlayer1 ? currentRoom.player1 : currentRoom.player2;

  const winnerNickname = lastGameOver?.winnerNickname 
    || winnerPlayer?.nickname 
    || oppNickname 
    || (currentRoom.isAiGame ? (aiLevel === 'easy' ? 'Pebble Golem' : aiLevel === 'medium' ? 'Rocky Golem' : aiLevel === 'hard' ? 'Granite Golem' : 'Obsidian Golem') : 'Raqib');

  const winnerAvatar = (isWinnerPlayer1 ? currentRoom.player1.avatarUrl : currentRoom.player2?.avatarUrl) || 'ninja';
  const winnerIsBot = currentRoom.isAiGame || winnerPlayer?.isBot || isOpponentBot;

  const boardDimmed = showWinLine;
  const isGameFinished = !!lastGameOver;
  const canAffordPlayAgain = (user?.token_balance || 0) >= currentRoom.stake;

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[82vh] px-3 py-2 max-w-md mx-auto w-full select-none">
      {/* ═══ Top Players Liquid Glass Bar ═══ */}
      <div className={`w-full flex items-center justify-between glass-surface p-2 rounded-3xl border border-white/70 dark:border-white/10 shadow-lg specular-rim transition-all duration-500 overflow-hidden min-w-0 ${
        showWinLine && lastGameOver?.winnerId === user?.id ? 'border-sky-400/80 shadow-[0_4px_24px_rgba(2,132,199,0.3)]' : 
        showWinLine && lastGameOver?.winnerId !== user?.id ? 'border-rose-400/80 shadow-[0_4px_24px_rgba(225,29,72,0.3)]' : ''
      }`}>
        {/* Me (Player 1 / Left) */}
        <div className={`flex items-center space-x-2 p-1.5 rounded-2xl transition-all min-w-0 flex-1 max-w-[38%] shrink overflow-hidden ${
          showWinLine && lastGameOver?.winnerId === user?.id
            ? 'bg-sky-500/20 border border-sky-400/60 scale-102'
            : showWinLine && lastGameOver?.winnerId !== user?.id
            ? 'opacity-40'
            : gameState.turn === mySymbol ? 'bg-sky-500/15 border border-sky-500/40 shadow-sm' : 'opacity-85'
        }`}>
          <div className="relative shrink-0">
            <CharacterAvatar 
              avatarId={isPlayer1 ? currentRoom.player1.avatarUrl : currentRoom.player2?.avatarUrl || 'fox'} 
              size={38} 
              className={`border-2 ${mySymbol === 'X' ? 'border-sky-500' : 'border-rose-500'}`} 
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-extrabold text-[10px] text-white shadow ${
              mySymbol === 'X' ? 'bg-sky-500' : 'bg-rose-500'
            }`}>
              {mySymbol}
            </span>
          </div>
          <div className="min-w-0 overflow-hidden">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate leading-tight">{myNickname}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
              {t('game.marks_count', { count: myMarksCount, defaultValue: `${myMarksCount}/3` })}
            </span>
          </div>
        </div>

        {/* Center Stake & Timer & Leave */}
        <div className="flex flex-col items-center justify-center shrink-0 px-1 mx-0.5">
          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] whitespace-nowrap shadow-sm">
            <StoneIcon size="xs" />
            <span className="font-mono">
              {currentRoom.isAiGame
                ? currentRoom.stake
                : currentRoom.stake * 2}
            </span>
          </div>
          {!isGameFinished && (
            <div className="flex items-center space-x-1.5 mt-1">
              <div className="flex items-center space-x-0.5 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className={turnSecondsLeft <= 5 ? 'text-rose-500 animate-ping font-extrabold' : 'text-slate-700 dark:text-slate-300'}>
                  {turnSecondsLeft}s
                </span>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  leaveGame();
                }}
                className="px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center space-x-0.5 transition-all active:scale-95 whitespace-nowrap"
                title={t('game.surrender')}
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden xs:inline">{t('game.surrender')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Opponent (Right) */}
        <div className={`flex items-center justify-end space-x-2 p-1.5 rounded-2xl transition-all min-w-0 flex-1 max-w-[38%] shrink overflow-hidden ${
          showWinLine && lastGameOver?.winnerId !== user?.id && !lastGameOver?.isDraw
            ? 'bg-rose-500/20 border border-rose-400/60 scale-102'
            : showWinLine && lastGameOver?.winnerId === user?.id
            ? 'opacity-40'
            : gameState.turn === opponentSymbol ? 'bg-rose-500/15 border border-rose-500/40 shadow-sm' : 'opacity-85'
        }`}>
          <div className="text-right min-w-0 overflow-hidden">
            <div className="flex items-center justify-end space-x-1 min-w-0">
              {isOpponentBot && (
                <span className="px-1 py-0.2 rounded text-[7px] font-black uppercase bg-rose-500 text-white shadow shrink-0">
                  BOT
                </span>
              )}
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate leading-tight">{oppNickname}</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
              {t('game.marks_count', { count: opponentSymbol ? (gameState.marks?.[opponentSymbol]?.length || 0) : 0 })}
            </span>
          </div>
          <div className="relative shrink-0">
            {isOpponentBot ? (
              <GolemAvatar level={aiLevel} size={38} glow={gameState.turn === opponentSymbol} />
            ) : (
              <CharacterAvatar 
                avatarId={isPlayer1 ? currentRoom.player2?.avatarUrl || 'ninja' : currentRoom.player1.avatarUrl} 
                size={38} 
                className={`border-2 ${opponentSymbol === 'X' ? 'border-sky-500' : 'border-rose-500'}`} 
              />
            )}
            <span className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center font-extrabold text-[10px] shadow ${
              opponentSymbol === 'X' ? 'bg-sky-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {opponentSymbol}
            </span>
          </div>
        </div>
      </div>

      {/* Turn & Phase Status Banner */}
      {!isGameFinished && (
        <div className="w-full text-center my-2.5">
          {isMyTurn ? (
            <div className="space-y-1 animate-fadeIn">
              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-purple-500/15 dark:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span>{t('game.your_turn')}</span>
              </div>

              {/* Instruction hint */}
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {!isMovingPhase ? (
                  <span>{t('game.phase_place', { count: myMarksCount })}</span>
                ) : selectedPiece === null ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center justify-center space-x-1">
                    <HelpCircle className="w-3 h-3" />
                    <span>{t('game.pick_hint')}</span>
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {t('game.target_hint')}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 text-xs font-medium">
              {isOpponentBot && aiThinking ? (
                <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-bold animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{t('game.golem_thinking')}</span>
                </span>
              ) : (
                <span>{t('game.opponent_turn')}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Win Line info banner */}
      {showWinLine && (
        <div className="w-full text-center my-2.5">
          <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-extrabold shadow-sm animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            <span>{lastGameOver?.winnerId === user?.id ? t('game.victory_banner') : t('game.defeat_banner')}</span>
          </div>
        </div>
      )}

      {/* ═══ 3×3 TACTICAL BOARD — FIXED SQUARE CELLS IN LIQUID GLASS ═══ */}
      <div 
        className="relative p-3 rounded-3xl glass-surface border border-white/80 dark:border-white/15 shadow-2xl flex items-center justify-center specular-rim"
        style={{
          width: 'min(92vw, 420px)',
          aspectRatio: '1 / 1',
        }}
      >
        <div 
          ref={boardRef}
          className="relative w-full h-full"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '10px',
          }}
        >
          {gameState.board.map((cellValue, idx) => {
            const isWinnerCell = isWinningCell(idx);
            const isSelected = selectedPiece === idx;

            return (
              <button
                key={idx}
                disabled={(!isMyTurn && cellValue === null) || isGameFinished}
                onClick={() => handleCellClick(idx)}
                style={{
                  aspectRatio: '1 / 1',
                  boxSizing: 'border-box',
                }}
                className={`relative flex items-center justify-center rounded-2xl transition-all duration-200 overflow-hidden ${
                  cellValue === null
                    ? isMyTurn && !isGameFinished
                      ? isMovingPhase && selectedPiece === null
                        ? 'bg-slate-200/30 dark:bg-slate-800/30 border border-slate-300/30 dark:border-white/5 cursor-not-allowed opacity-50'
                        : 'bg-white/40 dark:bg-slate-800/60 hover:bg-white/70 dark:hover:bg-slate-700/70 border border-white/60 dark:border-white/10 shadow-inner active:scale-95'
                      : 'bg-slate-200/20 dark:bg-slate-800/30 border border-slate-300/20 dark:border-white/5 cursor-not-allowed'
                    : cellValue === 'X'
                    ? 'bg-sky-500/10 dark:bg-sky-950/40 border border-sky-400/40 shadow-inner'
                    : 'bg-rose-500/10 dark:bg-rose-950/40 border border-rose-400/40 shadow-inner'
                } ${
                  isSelected
                    ? 'ring-4 ring-purple-500 dark:ring-purple-400 bg-purple-500/20 scale-102 shadow-lg animate-pulse'
                    : ''
                } ${
                  isWinnerCell
                    ? cellValue === 'X'
                      ? 'bg-sky-500/30 border-sky-400 shadow-[0_0_24px_rgba(2,132,199,0.5)] scale-102 animate-win-pulse'
                      : 'bg-rose-500/30 border-rose-400 shadow-[0_0_24px_rgba(225,29,72,0.5)] scale-102 animate-win-pulse'
                    : ''
                } ${
                  boardDimmed && !isWinnerCell ? 'opacity-30' : ''
                }`}
              >
                {/* Liquid Glass Marks */}
                {cellValue === 'X' && (
                  <NeonXMark 
                    size="62%" 
                    color={mySymbol === 'X' ? 'blue' : 'red'} 
                    className={isSelected ? 'scale-110' : ''} 
                  />
                )}

                {cellValue === 'O' && (
                  <NeonOMark 
                    size="62%" 
                    color={mySymbol === 'O' ? 'blue' : 'red'} 
                    className={isSelected ? 'scale-110' : ''} 
                  />
                )}

                {/* Selected Indicator overlay */}
                {isSelected && (
                  <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full text-[8px] font-extrabold uppercase tracking-wider bg-purple-600 text-white shadow">
                    Tanlandi
                  </span>
                )}
              </button>
            );
          })}

          {/* Win Line SVG Overlay */}
          {showWinLine && lastGameOver?.winningLine && lastGameOver.winnerSymbol && (
            <WinLineOverlay
              winningLine={lastGameOver.winningLine}
              winnerSymbol={lastGameOver.winnerSymbol}
              boardSize={boardSize}
            />
          )}
        </div>
      </div>

      {/* Battle Chat Drawer */}
      <BattleChat player1Id={currentRoom.player1.userId} player2Id={currentRoom.player2?.userId} />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 6.5 RESULT MODAL — LIQUID GLASS APPLE STYLE               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showResultModal && lastGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 8.4 Scrim backdrop to prevent glass-on-glass visual clutter */}
          <div
            className="fixed inset-0 glass-scrim animate-fade-in"
            aria-hidden="true"
          />

          {/* ═══ CASE 1: YOU WON ═══ */}
          {lastGameOver.winnerId === user?.id && !lastGameOver.isDraw && (
            <div className="relative z-10 w-full max-w-sm rounded-3xl glass-modal-card p-6 text-center shadow-2xl border border-white/50 dark:border-white/15 animate-scale-up">
              <div className="specular-rim" />

              {/* Liquid Amber Trophy */}
              <div className="w-24 h-24 mx-auto my-2 flex items-center justify-center animate-confetti-burst">
                <LiquidTrophy size={88} className="animate-bounce" />
              </div>

              {/* Title with Apple Liquid Glass Highlight */}
              <div className="my-1">
                <span className="glass-highlight text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  YOU WON
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                {currentRoom.isAiGame ? t('result.ai_win_desc') : t('result.pvp_win_desc')}
              </p>

              {/* Prize Badge with Counting Animation */}
              <div className="my-3 inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-black text-xl animate-count-up shadow-sm">
                <StoneIcon size="md" />
                <span className="font-mono">+{prizeAnimated} {t('dashboard.insert_coin')}</span>
              </div>

              {/* Rake explanation subtitle for PvP wins */}
              {!currentRoom.isAiGame && (
                <div className="mb-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {t('result.rake_explanation', {
                    stake: currentRoom.stake,
                    rake: lastGameOver.rakeAmount !== undefined ? lastGameOver.rakeAmount : 1,
                  })}
                </div>
              )}

              {/* Daily Cap Notice if Capped */}
              {lastGameOver.isCapped && (
                <div className="mb-4 p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-[11px] font-semibold text-center flex items-center justify-center space-x-1.5">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{t('result.daily_cap_notice')}</span>
                </div>
              )}

              {/* Two Liquid Glass Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {canAffordPlayAgain ? (
                  <button
                    onClick={handlePlayAgain}
                    className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('result.continue_yes')}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveGame}
                    className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
                  >
                    <span>{t('result.buy_stones')}</span>
                  </button>
                )}
                <button
                  onClick={handleLeaveGame}
                  className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 rounded-2xl bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300/40 dark:border-white/15 active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('result.no')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══ CASE 2: DRAW ═══ */}
          {lastGameOver.isDraw && (
            <div className="relative z-10 w-full max-w-sm rounded-3xl glass-modal-card p-6 text-center shadow-2xl border border-white/50 dark:border-white/15 animate-scale-up">
              <div className="specular-rim" />

              <div className="w-24 h-24 mx-auto my-2 flex items-center justify-center">
                <LiquidHandshake size={84} className="animate-pulse" />
              </div>

              <div className="my-1">
                <span className="glass-highlight text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t('result.draw')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                {t('result.draw_desc')}
              </p>

              <div className="my-4 inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300 font-bold text-sm shadow-sm">
                <StoneIcon size="xs" />
                <span>{t('result.stones_refunded', { count: currentRoom.stake })}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {canAffordPlayAgain ? (
                  <button
                    onClick={handlePlayAgain}
                    className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('result.continue_yes')}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveGame}
                    className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
                  >
                    <span>{t('result.buy_stones')}</span>
                  </button>
                )}
                <button
                  onClick={handleLeaveGame}
                  className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 rounded-2xl bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300/40 dark:border-white/15 active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('result.no')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══ CASE 3: DEFEAT → APPLE LIQUID GLASS "GAME OVER - CONTINUE? YES / NO" ═══ */}
          {lastGameOver.winnerId !== user?.id && !lastGameOver.isDraw && (
            <div className="relative z-10 w-full max-w-sm rounded-3xl glass-modal-card p-5 text-center shadow-2xl border border-white/50 dark:border-white/15 animate-scale-up">
              <div className="specular-rim" />

              {/* 3D Liquid Glass Piggy */}
              <div className="w-20 h-20 mx-auto my-1 flex items-center justify-center animate-piggy-drop">
                <LiquidPiggy size={76} wobble={false} />
              </div>

              {/* Large, Bold, Modern Liquid Glass Heading */}
              <div className="my-0.5">
                <span className="glass-highlight text-2xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">
                  {t('result.game_over')}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {lastGameOver.reason === 'surrender'
                  ? t('result.surrender_desc')
                  : lastGameOver.reason === 'opponent_surrendered'
                  ? t('result.opponent_surrender_desc')
                  : lastGameOver.reason === 'disconnect'
                  ? t('result.disconnect_desc')
                  : currentRoom.isAiGame ? t('result.ai_loss_desc') : t('result.pvp_loss_desc')}
              </p>

              {/* Stake lost notice */}
              <div className="my-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <span>{t('result.stones_lost', { count: currentRoom.stake })}</span>
              </div>

              {/* ═══ YUTGAN ODAMNING NIKI VA AVATARI (WINNER SPOTLIGHT) ═══ */}
              <div className="my-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-400/30 dark:border-amber-400/20 backdrop-blur-md shadow-inner text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1 text-[11px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>{t('result.winner_label')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative shrink-0">
                    {winnerIsBot ? (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-400/40 p-1 flex items-center justify-center shadow">
                        <GolemAvatar level={aiLevel} size={38} />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-400/40 p-1 flex items-center justify-center shadow">
                        <CharacterAvatar avatarId={winnerAvatar} size={38} />
                      </div>
                    )}
                    <span className="absolute -top-1.5 -right-1.5 text-sm filter drop-shadow">👑</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {winnerNickname}
                    </div>
                    {!winnerIsBot && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                        <StoneIcon size="xs" />
                        <span>{t('result.winner_won_stones', { count: lastGameOver.prize ?? (currentRoom.stake || 0) * 2 })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTINUE? prompt */}
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                {t('result.continue_prompt')}
              </div>

              {/* YES / NO Two Liquid Glass Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-2.5">
                {(user?.token_balance || 0) >= currentRoom.stake ? (
                  <button
                    onClick={handlePlayAgain}
                    className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
                  >
                    <span>{t('result.yes')}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveGame}
                    className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
                  >
                    <span>{t('result.buy_stones')}</span>
                  </button>
                )}
                <button
                  onClick={handleLeaveGame}
                  className="flex items-center justify-center space-x-1.5 min-h-[48px] py-3 px-4 rounded-2xl bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300/40 dark:border-white/15 active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span>{t('result.no')}</span>
                </button>
              </div>

              {/* ═══ PASDA G'OLIBNING NIKI CHIQISHI (EXPLICIT BOTTOM BANNER) ═══ */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>G'olib:</span>
                <span className="font-black text-amber-500 dark:text-amber-400 tracking-wide text-sm truncate max-w-[200px]">
                  {winnerNickname}
                </span>
                <span>🏆</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default GameBoard;
