// AI Golem Opponent Engine for 3-Piece Tic-Tac-Toe

export type GolemLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface GolemSettings {
  level: GolemLevel;
  name: string;
  stake: number;
  winReward: number; // Net stones won by player upon defeat
  win_reward: number;
  blunderProb: number;
  searchDepth: number;
  seeWinProb: number;
  blockWinProb: number;
  minThinkMs: number;
  maxThinkMs: number;
  is_enabled: boolean;
}

export const GOLEM_LEVELS: Record<GolemLevel, GolemSettings> = {
  easy: {
    level: 'easy',
    name: 'Pebble',
    stake: 2,
    winReward: 2,
    win_reward: 2,
    blunderProb: 0.45,
    searchDepth: 1,
    seeWinProb: 0.60,
    blockWinProb: 0.30,
    minThinkMs: 800,
    maxThinkMs: 1400,
    is_enabled: true,
  },
  medium: {
    level: 'medium',
    name: 'Rocky',
    stake: 4,
    winReward: 4,
    win_reward: 4,
    blunderProb: 0.25,
    searchDepth: 2,
    seeWinProb: 0.85,
    blockWinProb: 0.70,
    minThinkMs: 1000,
    maxThinkMs: 1800,
    is_enabled: true,
  },
  hard: {
    level: 'hard',
    name: 'Granite',
    stake: 6,
    winReward: 8,
    win_reward: 8,
    blunderProb: 0.10,
    searchDepth: 3,
    seeWinProb: 0.98,
    blockWinProb: 0.95,
    minThinkMs: 1200,
    maxThinkMs: 2000,
    is_enabled: true,
  },
  expert: {
    level: 'expert',
    name: 'Obsidian',
    stake: 10,
    winReward: 20,
    win_reward: 20,
    blunderProb: 0.035,
    searchDepth: 4,
    seeWinProb: 1.0,
    blockWinProb: 1.0,
    minThinkMs: 1400,
    maxThinkMs: 2200,
    is_enabled: true,
  },
};

export type GolemChatCategory = 'start' | 'win' | 'loss';

export const GOLEM_CHATS: Record<
  GolemLevel,
  Record<GolemChatCategory, { uz: string[]; ru: string[]; en: string[] }>
> = {
  easy: {
    start: {
      uz: [
        'Salom do‘stim! Pebble siz bilan o‘ynashga tayyor!',
        'Keling, toshlar bilan birga o‘ynaymiz!',
      ],
      ru: [
        'Привет, друг! Пеббл готов сыграть с тобой!',
        'Давай сыграем вместе камешками!',
      ],
      en: [
        'Hello friend! Pebble is ready to play with you!',
        "Let's play together with stones!",
      ],
    },
    win: {
      uz: [
        'Voy, Pebble yutib oldi! Juda qiziq bo‘ldi!',
        'Yana bir marta o‘ynaymizmi?',
      ],
      ru: [
        'Ого, Пеббл выиграл! Было очень интересно!',
        'Сыграем еще раз?',
      ],
      en: [
        'Wow, Pebble won! That was fun!',
        'Shall we play once more?',
      ],
    },
    loss: {
      uz: [
        'Tabriklayman! Siz mendan ancha chaqqonsiz!',
        'Pebble yiqildi, lekin xafa emas! Yaxshi o‘yin!',
      ],
      ru: [
        'Поздравляю! Ты намного быстрее меня!',
        'Пеббл упал, но не расстроен! Отличная игра!',
      ],
      en: [
        'Congrats! You are much faster than me!',
        "Pebble tumbled, but isn't sad! Good game!",
      ],
    },
  },
  medium: {
    start: {
      uz: [
        'Qoyadek mustahkam Rocky jangga tayyor!',
        'Oson taslim bo‘lmayman, o‘ylang!',
      ],
      ru: [
        'Крепкий как скала Рокки готов к битве!',
        'Легко не сдамся, думай!',
      ],
      en: [
        'Solid as a rock, Rocky is ready to fight!',
        "I won't give up easily, think carefully!",
      ],
    },
    win: {
      uz: [
        'Qoyani yorib o‘tish oson emas!',
        'Yaxshi urinish, lekin bu safar g‘alaba meniki.',
      ],
      ru: [
        'Скалу пробить не так-то просто!',
        'Хорошая попытка, но в этот раз победа моя.',
      ],
      en: [
        'Breaking through a rock is not easy!',
        'Good try, but this time victory is mine.',
      ],
    },
    loss: {
      uz: [
        'Zarba qattiq bo‘ldi! Qoyil!',
        'Ajoyib kombinatsiya! Keyingi safar revansh olaman!',
      ],
      ru: [
        'Удар был мощным! Браво!',
        'Отличная комбинация! В следующий раз возьму реванш!',
      ],
      en: [
        'That was a hard hit! Impressive!',
        'Great combination! I will take revenge next time!',
      ],
    },
  },
  hard: {
    start: {
      uz: [
        'Granit zirhim tayyor. Strategiyangiz bormi?',
        'Granite har bir yurishingizni kuzatadi.',
      ],
      ru: [
        'Гранитная броня готова. Есть стратегия?',
        'Гранит следит за каждым твоим ходом.',
      ],
      en: [
        'Granite armor ready. Do you have a strategy?',
        'Granite is watching your every move.',
      ],
    },
    win: {
      uz: [
        'Taktika va intizom. Granit g‘alaba qildi.',
        'Granitga qarshi tajriba kerak.',
      ],
      ru: [
        'Тактика и дисциплина. Гранит победил.',
        'Против гранита нужен опыт.',
      ],
      en: [
        'Tactics and discipline. Granite wins.',
        'You need experience to face Granite.',
      ],
    },
    loss: {
      uz: [
        'Zirh yorildi... Mukammal o‘yin ko‘rsatdingiz.',
        'Mag‘lubiyatni tan olaman. Hurmatim sizga.',
      ],
      ru: [
        'Броня треснула... Ты показал безупречную игру.',
        'Признаю поражение. Мое уважение.',
      ],
      en: [
        'The armor cracked... You played flawlessly.',
        'I acknowledge defeat. My respect to you.',
      ],
    },
  },
  expert: {
    start: {
      uz: [
        'Obsidian alangasiga ro‘baro‘ bo‘ldingiz...',
        'Xatolar kechirilmaydi. Boshladik.',
      ],
      ru: [
        'Ты столкнулся с пламенем Обсидиана...',
        'Ошибки не прощаются. Начнем.',
      ],
      en: [
        'You face the flame of Obsidian...',
        'Mistakes are not forgiven. Let us begin.',
      ],
    },
    win: {
      uz: [
        'Sizning toshlaringiz endi kulga aylandi.',
        'Obsidian oldida barcha toshlar sinadi.',
      ],
      ru: [
        'Твои камни превратились в пепел.',
        'Перед Обсидианом сокрушаются любые камни.',
      ],
      en: [
        'Your stones have turned to ash.',
        'Before Obsidian, all stones crumble.',
      ],
    },
    loss: {
      uz: [
        'Imkonsiz... Siz vulqonni to‘xtatdingiz...',
        'Afsonaviy taktika. Siz Obsidianni yengdingiz!',
      ],
      ru: [
        'Невозможно... Ты остановил вулкан...',
        'Легендарная тактика. Ты одолел Обсидиана!',
      ],
      en: [
        'Impossible... You stopped the volcano...',
        'Legendary tactics. You conquered Obsidian!',
      ],
    },
  },
};

export function getGolemChatPhrase(level: GolemLevel, type: GolemChatCategory, lang: string = 'uz'): string {
  const normLang = (lang === 'ru' || lang === 'en') ? lang : 'uz';
  const phrases = GOLEM_CHATS[level]?.[type]?.[normLang] || GOLEM_CHATS[level]?.[type]?.['uz'] || [];
  if (phrases.length === 0) return '';
  return phrases[Math.floor(Math.random() * phrases.length)];
}

const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function checkWin(board: (string | null)[], player: string): boolean {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

export function getLegalMoves(
  board: (string | null)[],
  player: string,
  placedCount: number
): Array<{ from?: number; to: number }> {
  const empty: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) empty.push(i);
  }

  if (placedCount < 3) {
    // Phase 1: Placement
    return empty.map(to => ({ to }));
  } else {
    // Phase 2: Movement
    const pieces: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === player) pieces.push(i);
    }
    const moves: Array<{ from: number; to: number }> = [];
    for (const from of pieces) {
      for (const to of empty) {
        moves.push({ from, to });
      }
    }
    return moves;
  }
}

function evaluateBoard(board: (string | null)[], player: string): number {
  const opponent = player === 'X' ? 'O' : 'X';
  if (checkWin(board, player)) return 100;
  if (checkWin(board, opponent)) return -100;

  let score = 0;
  for (const [a, b, c] of WIN_PATTERNS) {
    const line = [board[a], board[b], board[c]];
    const myCount = line.filter(p => p === player).length;
    const oppCount = line.filter(p => p === opponent).length;
    if (myCount === 2 && oppCount === 0) score += 5;
    if (oppCount === 2 && myCount === 0) score -= 6;
  }
  return score;
}

function minimaxSearch(
  board: (string | null)[],
  depth: number,
  isMaximizing: boolean,
  player: string,
  placedX: number,
  placedO: number,
  alpha: number,
  beta: number
): number {
  const opponent = player === 'X' ? 'O' : 'X';
  if (checkWin(board, player)) return 100 - depth;
  if (checkWin(board, opponent)) return depth - 100;
  if (depth <= 0) return evaluateBoard(board, player);

  const currentTurn = isMaximizing ? player : opponent;
  const currentPlaced = currentTurn === 'X' ? placedX : placedO;
  const moves = getLegalMoves(board, currentTurn, currentPlaced);

  if (moves.length === 0) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      if (move.from !== undefined) board[move.from] = null;
      board[move.to] = player;

      const evalVal = minimaxSearch(
        board,
        depth - 1,
        false,
        player,
        player === 'X' ? Math.min(3, placedX + 1) : placedX,
        player === 'O' ? Math.min(3, placedO + 1) : placedO,
        alpha,
        beta
      );

      board[move.to] = null;
      if (move.from !== undefined) board[move.from] = player;

      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      if (move.from !== undefined) board[move.from] = null;
      board[move.to] = opponent;

      const evalVal = minimaxSearch(
        board,
        depth - 1,
        true,
        player,
        opponent === 'X' ? Math.min(3, placedX + 1) : placedX,
        opponent === 'O' ? Math.min(3, placedO + 1) : placedO,
        alpha,
        beta
      );

      board[move.to] = null;
      if (move.from !== undefined) board[move.from] = opponent;

      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Calculates the best move for AI Golem based on its calibrated level
 */
export function calculateAIMove(
  board: (string | null)[],
  aiPlayer: string,
  placedX: number,
  placedO: number,
  level: GolemLevel
): { from?: number; to: number; thinkDelayMs: number } {
  const config = GOLEM_LEVELS[level] || GOLEM_LEVELS.easy;
  const currentPlaced = aiPlayer === 'X' ? placedX : placedO;
  const legalMoves = getLegalMoves(board, aiPlayer, currentPlaced);

  if (legalMoves.length === 0) {
    throw new Error('No legal moves available for AI');
  }

  // Random human-like thinking delay
  const thinkDelayMs = Math.floor(
    Math.random() * (config.maxThinkMs - config.minThinkMs) + config.minThinkMs
  );

  // 1. Immediate Win check with calibrated probability
  if (Math.random() < config.seeWinProb) {
    for (const move of legalMoves) {
      if (move.from !== undefined) board[move.from] = null;
      board[move.to] = aiPlayer;
      const isWin = checkWin(board, aiPlayer);
      board[move.to] = null;
      if (move.from !== undefined) board[move.from] = aiPlayer;
      if (isWin) return { ...move, thinkDelayMs };
    }
  }

  // 2. Blunder check (random move)
  if (Math.random() < config.blunderProb) {
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { ...randomMove, thinkDelayMs };
  }

  // 3. Immediate Block check with calibrated probability
  if (Math.random() < config.blockWinProb) {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    const oppPlaced = opponent === 'X' ? placedX : placedO;
    const oppMoves = getLegalMoves(board, opponent, oppPlaced);
    for (const om of oppMoves) {
      if (om.from !== undefined) board[om.from] = null;
      board[om.to] = opponent;
      const oppWins = checkWin(board, opponent);
      board[om.to] = null;
      if (om.from !== undefined) board[om.from] = opponent;
      if (oppWins) {
        const blockMove = legalMoves.find(m => m.to === om.to);
        if (blockMove) return { ...blockMove, thinkDelayMs };
      }
    }
  }

  // 4. Minimax search
  let bestMove = legalMoves[0];
  let bestVal = -Infinity;

  for (const move of legalMoves) {
    if (move.from !== undefined) board[move.from] = null;
    board[move.to] = aiPlayer;

    const val = minimaxSearch(
      board,
      config.searchDepth,
      false,
      aiPlayer,
      aiPlayer === 'X' ? Math.min(3, placedX + 1) : placedX,
      aiPlayer === 'O' ? Math.min(3, placedO + 1) : placedO,
      -Infinity,
      Infinity
    );

    board[move.to] = null;
    if (move.from !== undefined) board[move.from] = aiPlayer;

    if (val > bestVal) {
      bestVal = val;
      bestMove = move;
    }
  }

  return { ...bestMove, thinkDelayMs };
}
