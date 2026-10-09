// AI Opponent Simulation & Economic Calibration Script
// Tests 4 AI difficulty levels against an average human-like player model
// Calculates Win/Draw/Loss rates and Expected Value (EV) for proper stone economy

export interface AILevelConfig {
  name: string;
  level: 'easy' | 'medium' | 'hard' | 'expert';
  stake: number;
  winReward: number; // net reward on win (e.g. +1, +3, +7, +30)
  blunderProb: number;
  searchDepth: number;
}

const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWin(board: (string | null)[], player: string): boolean {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

function getLegalMoves(board: (string | null)[], player: string, placedCount: number): Array<{ from?: number; to: number }> {
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

// Evaluates a terminal or leaf board state
function evaluateBoard(board: (string | null)[], player: string): number {
  const opponent = player === 'X' ? 'O' : 'X';
  if (checkWin(board, player)) return 100;
  if (checkWin(board, opponent)) return -100;

  // Heuristic: count 2-in-a-rows with open 3rd spot
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

function minimax(
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

      const evalVal = minimax(
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

      const evalVal = minimax(
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

// Select move for AI with blunder chance
export interface AILevelConfig {
  name: string;
  level: 'easy' | 'medium' | 'hard' | 'expert';
  stake: number;
  winReward: number; // net reward on win (e.g. +1, +3, +7, +30)
  blunderProb: number;
  searchDepth: number;
  seeWinProb: number;
  blockWinProb: number;
}

// ... helper ...
function selectAIMove(
  board: (string | null)[],
  aiPlayer: string,
  placedX: number,
  placedO: number,
  cfg: { blunderProb: number; depth: number; seeWinProb: number; blockWinProb: number }
): { from?: number; to: number } {
  const currentPlaced = aiPlayer === 'X' ? placedX : placedO;
  const legalMoves = getLegalMoves(board, aiPlayer, currentPlaced);

  if (legalMoves.length === 0) throw new Error('No legal moves');

  // 1. Immediate win check with seeWinProb
  if (Math.random() < cfg.seeWinProb) {
    for (const move of legalMoves) {
      if (move.from !== undefined) board[move.from] = null;
      board[move.to] = aiPlayer;
      const isWin = checkWin(board, aiPlayer);
      board[move.to] = null;
      if (move.from !== undefined) board[move.from] = aiPlayer;
      if (isWin) return move;
    }
  }

  // 2. Blunder chance: pick random legal move
  if (Math.random() < cfg.blunderProb) {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // 3. Immediate block check with blockWinProb
  if (Math.random() < cfg.blockWinProb) {
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
        if (blockMove) return blockMove;
      }
    }
  }

  // 4. Minimax search
  let bestMove = legalMoves[0];
  let bestValue = -Infinity;

  for (const move of legalMoves) {
    if (move.from !== undefined) board[move.from] = null;
    board[move.to] = aiPlayer;

    const val = minimax(
      board,
      cfg.depth,
      false,
      aiPlayer,
      aiPlayer === 'X' ? Math.min(3, placedX + 1) : placedX,
      aiPlayer === 'O' ? Math.min(3, placedO + 1) : placedO,
      -Infinity,
      Infinity
    );

    board[move.to] = null;
    if (move.from !== undefined) board[move.from] = aiPlayer;

    if (val > bestValue) {
      bestValue = val;
      bestMove = move;
    }
  }

  return bestMove;
}

// Average Human Player model: decent tactician, 15% blunder rate, 2-move lookahead
function selectHumanModelMove(
  board: (string | null)[],
  humanPlayer: string,
  placedX: number,
  placedO: number
): { from?: number; to: number } {
  return selectAIMove(board, humanPlayer, placedX, placedO, {
    blunderProb: 0.15,
    depth: 2,
    seeWinProb: 0.90,
    blockWinProb: 0.80,
  });
}

// Simulate 1 game
function simulateMatch(aiConfig: AILevelConfig): 'human_win' | 'ai_win' | 'draw' {
  const board: (string | null)[] = Array(9).fill(null);
  let placedX = 0;
  let placedO = 0;
  let moveCount = 0;
  const maxMoves = 40;

  // 50% chance human is X (first mover), 50% AI is X
  const humanPlayer: 'X' | 'O' = Math.random() < 0.5 ? 'X' : 'O';
  const aiPlayer: 'X' | 'O' = humanPlayer === 'X' ? 'O' : 'X';

  let currentTurn: 'X' | 'O' = 'X';
  const history: string[] = [];

  while (moveCount < maxMoves) {
    const isHuman = currentTurn === humanPlayer;
    let chosenMove: { from?: number; to: number };

    if (isHuman) {
      chosenMove = selectHumanModelMove(board, humanPlayer, placedX, placedO);
    } else {
      chosenMove = selectAIMove(board, aiPlayer, placedX, placedO, {
        blunderProb: aiConfig.blunderProb,
        depth: aiConfig.searchDepth,
        seeWinProb: aiConfig.seeWinProb,
        blockWinProb: aiConfig.blockWinProb,
      });
    }

    // Apply move
    if (chosenMove.from !== undefined) board[chosenMove.from] = null;
    board[chosenMove.to] = currentTurn;

    if (currentTurn === 'X' && placedX < 3) placedX++;
    if (currentTurn === 'O' && placedO < 3) placedO++;
    moveCount++;

    // Win check
    if (checkWin(board, currentTurn)) {
      return isHuman ? 'human_win' : 'ai_win';
    }

    // Repetition check in moving phase
    if (placedX === 3 && placedO === 3) {
      const stateKey = board.map(c => c || '.').join('') + ':' + currentTurn;
      let count = 0;
      for (const h of history) if (h === stateKey) count++;
      if (count >= 2) return 'draw';
      history.push(stateKey);
    }

    currentTurn = currentTurn === 'X' ? 'O' : 'X';
  }

  return 'draw';
}

// Run 1000 simulations per level
export function runSimulation() {
  const levels: AILevelConfig[] = [
    {
      name: 'Pebble (Easy)',
      level: 'easy',
      stake: 1,
      winReward: 1,
      blunderProb: 0.45,
      searchDepth: 1,
      seeWinProb: 0.60,
      blockWinProb: 0.30,
    },
    {
      name: 'Rocky (Medium)',
      level: 'medium',
      stake: 3,
      winReward: 3,
      blunderProb: 0.25,
      searchDepth: 2,
      seeWinProb: 0.85,
      blockWinProb: 0.70,
    },
    {
      name: 'Granite (Hard)',
      level: 'hard',
      stake: 5,
      winReward: 7,
      blunderProb: 0.10,
      searchDepth: 3,
      seeWinProb: 0.98,
      blockWinProb: 0.95,
    },
    {
      name: 'Obsidian (Expert)',
      level: 'expert',
      stake: 10,
      winReward: 20,
      blunderProb: 0.035,
      searchDepth: 4,
      seeWinProb: 1.0,
      blockWinProb: 1.0,
    },
  ];

  console.log('=== XOXO AI GOLEM CALIBRATION SIMULATION (1000 GAMES/LEVEL) ===\n');

  for (const cfg of levels) {
    const rounds = 500;
    let humanWins = 0;
    let aiWins = 0;
    let draws = 0;

    for (let i = 0; i < rounds; i++) {
      const res = simulateMatch(cfg);
      if (res === 'human_win') humanWins++;
      else if (res === 'ai_win') aiWins++;
      else draws++;
    }

    const pHumanWin = humanWins / rounds;
    const pDraw = draws / rounds;
    const pAiWin = aiWins / rounds;

    // Player Expected Value:
    // EV = (pHumanWin * winReward) - (pAiWin * stake)
    const ev = (pHumanWin * cfg.winReward) - (pAiWin * cfg.stake);
    const houseEdge = ((-ev) / cfg.stake) * 100;

    console.log(`Level: ${cfg.name}`);
    console.log(`- Stake: ${cfg.stake} Tosh | Net Win Reward: +${cfg.winReward} Tosh`);
    console.log(`- Player Win Rate: ${(pHumanWin * 100).toFixed(1)}% (${humanWins})`);
    console.log(`- Draw Rate:       ${(pDraw * 100).toFixed(1)}% (${draws})`);
    console.log(`- AI Win Rate:     ${(pAiWin * 100).toFixed(1)}% (${aiWins})`);
    console.log(`- Player EV per game: ${ev.toFixed(3)} Tosh`);
    console.log(`- House Edge:      ${houseEdge.toFixed(1)}%`);
    console.log('-----------------------------------------------------------');
  }
}

runSimulation();
