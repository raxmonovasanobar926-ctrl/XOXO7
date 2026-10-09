// Game Theory Solver & Minimax Analysis for XOXO New Rule
// Rule:
// Phase 1 (Placing): Players place 3 pieces each on 3x3 board (turns 0..5).
// Phase 2 (Moving): Player picks any of their 3 pieces and moves to any empty cell.
// Win condition: 3-in-a-row.
// Draw: 3-fold position repetition or max moves reached.

const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

function checkWin(board: (string | null)[], player: string): boolean {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

function boardKey(board: (string | null)[], turn: string): string {
  return board.map(c => c || '.').join('') + ':' + turn;
}

// Retrograde / Depth-limited Minimax with Transposition Table and Loop Detection
// 1 = Player 1 (X) wins, -1 = Player 2 (O) wins, 0 = Draw

const memo = new Map<string, number>();

function solve(
  board: (string | null)[],
  turn: 'X' | 'O',
  phase: 'placing' | 'moving',
  placedCount: { X: number; O: number },
  history: string[],
  depth: number,
  maxDepth: number
): number {
  const currentKey = boardKey(board, turn);

  // Repetition check (3-fold repetition is a draw, or even 2-fold in finite path)
  let occurrences = 0;
  for (const h of history) {
    if (h === currentKey) occurrences++;
  }
  if (occurrences >= 2) {
    return 0; // Draw by repetition
  }

  if (depth >= maxDepth) {
    return 0; // Draw by move limit
  }

  const memoKey = currentKey + '@' + occurrences;
  if (memo.has(memoKey)) {
    return memo.get(memoKey)!;
  }

  const nextHistory = [...history, currentKey];

  if (phase === 'placing') {
    const isX = turn === 'X';
    const playerToPlace = turn;
    const nextTurn = isX ? 'O' : 'X';

    // Find all empty cells
    const emptyIndices: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (!board[i]) emptyIndices.push(i);
    }

    if (isX) {
      let maxScore = -2;
      for (const idx of emptyIndices) {
        board[idx] = 'X';
        let score: number;
        if (checkWin(board, 'X')) {
          score = 1;
        } else {
          const nextPlaced = { ...placedCount, X: placedCount.X + 1 };
          const nextPhase = nextPlaced.X === 3 && nextPlaced.O === 3 ? 'moving' : 'placing';
          score = solve(board, nextTurn, nextPhase, nextPlaced, nextHistory, depth + 1, maxDepth);
        }
        board[idx] = null;
        if (score > maxScore) maxScore = score;
        if (maxScore === 1) break; // Alpha-beta cutoff (X already wins)
      }
      memo.set(memoKey, maxScore);
      return maxScore;
    } else {
      let minScore = 2;
      for (const idx of emptyIndices) {
        board[idx] = 'O';
        let score: number;
        if (checkWin(board, 'O')) {
          score = -1;
        } else {
          const nextPlaced = { ...placedCount, O: placedCount.O + 1 };
          const nextPhase = nextPlaced.X === 3 && nextPlaced.O === 3 ? 'moving' : 'placing';
          score = solve(board, nextTurn, nextPhase, nextPlaced, nextHistory, depth + 1, maxDepth);
        }
        board[idx] = null;
        if (score < minScore) minScore = score;
        if (minScore === -1) break; // Cutoff (O already wins)
      }
      memo.set(memoKey, minScore);
      return minScore;
    }
  } else {
    // Moving Phase
    const isX = turn === 'X';
    const nextTurn = isX ? 'O' : 'X';

    // Find player's piece positions and empty cells
    const myPieces: number[] = [];
    const emptyCells: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === turn) myPieces.push(i);
      else if (!board[i]) emptyCells.push(i);
    }

    if (isX) {
      let maxScore = -2;
      for (const from of myPieces) {
        for (const to of emptyCells) {
          board[from] = null;
          board[to] = 'X';
          let score: number;
          if (checkWin(board, 'X')) {
            score = 1;
          } else {
            score = solve(board, nextTurn, 'moving', placedCount, nextHistory, depth + 1, maxDepth);
          }
          board[to] = null;
          board[from] = 'X';

          if (score > maxScore) maxScore = score;
          if (maxScore === 1) break;
        }
        if (maxScore === 1) break;
      }
      memo.set(memoKey, maxScore);
      return maxScore;
    } else {
      let minScore = 2;
      for (const from of myPieces) {
        for (const to of emptyCells) {
          board[from] = null;
          board[to] = 'O';
          let score: number;
          if (checkWin(board, 'O')) {
            score = -1;
          } else {
            score = solve(board, nextTurn, 'moving', placedCount, nextHistory, depth + 1, maxDepth);
          }
          board[to] = null;
          board[from] = 'O';

          if (score < minScore) minScore = score;
          if (minScore === -1) break;
        }
        if (minScore === -1) break;
      }
      memo.set(memoKey, minScore);
      return minScore;
    }
  }
}

// Test from opening moves:
console.log('--- XOXO GAME BALANCE ANALYSIS (MINIMAX / GAME THEORY) ---');

const openings = [
  { name: 'Center (Square 4)', pos: 4 },
  { name: 'Corner (Square 0)', pos: 0 },
  { name: 'Edge (Square 1)', pos: 1 }
];

for (const op of openings) {
  memo.clear();
  const board: (string | null)[] = Array(9).fill(null);
  board[op.pos] = 'X';
  const result = solve(board, 'O', 'placing', { X: 1, O: 0 }, [boardKey(board, 'X')], 1, 24);
  const evalStr = result === 1 ? 'X WINS (FORCED WIN)' : result === -1 ? 'O WINS' : 'DRAW (BALANCED)';
  console.log(`Opening: ${op.name} => Result: ${evalStr} (Score: ${result})`);
}
