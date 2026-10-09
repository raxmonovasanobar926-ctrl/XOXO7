export type PlayerSymbol = 'X' | 'O';
export type BoardCell = PlayerSymbol | null;
export type GameStatus = 'in_progress' | 'won' | 'draw' | 'abandoned';
export type GamePhase = 'placing' | 'moving';

export interface MoveRecord {
  player: PlayerSymbol;
  from?: number;
  to: number;
  timestamp: number;
}

export interface ThreePieceGameState {
  board: BoardCell[];
  turn: PlayerSymbol;
  phase: GamePhase;
  marks: {
    X: number[];
    O: number[];
  };
  winner: PlayerSymbol | null;
  winningLine: number[] | null;
  status: GameStatus;
  moveCount: number;
  movingPhaseMoves: number;
  history: MoveRecord[];
  boardHistory: string[];
}

export const WINNING_COMBINATIONS = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export class ThreePieceGame {
  private state: ThreePieceGameState;

  constructor(initialTurn: PlayerSymbol = 'X') {
    this.state = {
      board: Array(9).fill(null),
      turn: initialTurn,
      phase: 'placing',
      marks: {
        X: [],
        O: [],
      },
      winner: null,
      winningLine: null,
      status: 'in_progress',
      moveCount: 0,
      movingPhaseMoves: 0,
      history: [],
      boardHistory: [],
    };
  }

  public getState(): ThreePieceGameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public static checkWinner(board: BoardCell[]): { winner: PlayerSymbol | null; winningLine: number[] | null } {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          winner: board[a] as PlayerSymbol,
          winningLine: combo,
        };
      }
    }
    return { winner: null, winningLine: null };
  }

  /**
   * Make a move.
   * In 'placing' phase: move has { to }
   * In 'moving' phase: move has { from, to }
   */
  public makeMove(
    player: PlayerSymbol,
    to: number,
    from?: number
  ): { success: boolean; error?: string; state: ThreePieceGameState } {
    if (this.state.status !== 'in_progress') {
      return { success: false, error: 'O‘yin yakunlangan', state: this.getState() };
    }

    if (player !== this.state.turn) {
      return { success: false, error: 'Sizning navbatingiz emas', state: this.getState() };
    }

    if (to < 0 || to > 8) {
      return { success: false, error: 'Katak indeksi noto‘g‘ri', state: this.getState() };
    }

    if (this.state.board[to] !== null) {
      return { success: false, error: 'Bu katak band', state: this.getState() };
    }

    if (this.state.phase === 'placing') {
      // Phase 1: Placing pieces
      const playerMarks = this.state.marks[player];
      if (playerMarks.length >= 3) {
        return { success: false, error: 'Siz allaqachon 3 ta belgi qo‘ygansiz', state: this.getState() };
      }

      this.state.board[to] = player;
      this.state.marks[player].push(to);
      this.state.moveCount++;

      this.state.history.push({
        player,
        to,
        timestamp: Date.now(),
      });

      // Check win in placing phase
      const winCheck = ThreePieceGame.checkWinner(this.state.board);
      if (winCheck.winner) {
        this.state.status = 'won';
        this.state.winner = winCheck.winner;
        this.state.winningLine = winCheck.winningLine;
        return { success: true, state: this.getState() };
      }

      // Check if both players placed all 3 pieces
      if (this.state.marks.X.length === 3 && this.state.marks.O.length === 3) {
        this.state.phase = 'moving';
      }

      // Next turn
      this.state.turn = player === 'X' ? 'O' : 'X';
      return { success: true, state: this.getState() };
    } else {
      // Phase 2: Moving existing pieces
      if (from === undefined || from < 0 || from > 8) {
        return { success: false, error: 'Ko‘chirish uchun o‘z belgingizni tanlang', state: this.getState() };
      }

      if (this.state.board[from] !== player) {
        return { success: false, error: 'Faqat o‘zingizning belgingizni ko‘chira olasiz', state: this.getState() };
      }

      // Move piece
      this.state.board[from] = null;
      this.state.board[to] = player;

      // Update marks array
      const idx = this.state.marks[player].indexOf(from);
      if (idx !== -1) {
        this.state.marks[player][idx] = to;
      }
      this.state.marks[player].sort((a, b) => a - b);

      this.state.moveCount++;
      this.state.movingPhaseMoves++;

      this.state.history.push({
        player,
        from,
        to,
        timestamp: Date.now(),
      });

      // Check win
      const winCheck = ThreePieceGame.checkWinner(this.state.board);
      if (winCheck.winner) {
        this.state.status = 'won';
        this.state.winner = winCheck.winner;
        this.state.winningLine = winCheck.winningLine;
        return { success: true, state: this.getState() };
      }

      // Record board state for repetition check
      const currentBoardKey = this.state.board.map(c => c || '.').join('') + ':' + (player === 'X' ? 'O' : 'X');
      this.state.boardHistory.push(currentBoardKey);

      // 3-fold repetition check
      let repetitionCount = 0;
      for (const h of this.state.boardHistory) {
        if (h === currentBoardKey) repetitionCount++;
      }

      if (repetitionCount >= 3) {
        this.state.status = 'draw';
        return { success: true, state: this.getState() };
      }

      // Max moving moves limit (20 moves without win in Phase 2 = Draw)
      if (this.state.movingPhaseMoves >= 20) {
        this.state.status = 'draw';
        return { success: true, state: this.getState() };
      }

      // Switch turn
      this.state.turn = player === 'X' ? 'O' : 'X';
      return { success: true, state: this.getState() };
    }
  }
}
