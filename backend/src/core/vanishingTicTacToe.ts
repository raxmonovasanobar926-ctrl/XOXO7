export type PlayerSymbol = 'X' | 'O';
export type BoardCell = PlayerSymbol | null;
export type GameStatus = 'in_progress' | 'won' | 'draw' | 'abandoned';

export interface MoveRecord {
  player: PlayerSymbol;
  cell: number;
  vanishedCell: number | null;
  timestamp: number;
}

export interface VanishingGameState {
  board: BoardCell[];
  turn: PlayerSymbol;
  marks: {
    X: number[];
    O: number[];
  };
  nextToVanish: {
    X: number | null;
    O: number | null;
  };
  winner: PlayerSymbol | null;
  winningLine: number[] | null;
  status: GameStatus;
  moveCount: number;
  history: MoveRecord[];
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

export class VanishingTicTacToe {
  private state: VanishingGameState;

  constructor(initialTurn: PlayerSymbol = 'X') {
    this.state = {
      board: Array(9).fill(null),
      turn: initialTurn,
      marks: {
        X: [],
        O: [],
      },
      nextToVanish: {
        X: null,
        O: null,
      },
      winner: null,
      winningLine: null,
      status: 'in_progress',
      moveCount: 0,
      history: [],
    };
  }

  public getState(): VanishingGameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Check if a player has achieved 3 in a row
   */
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
   * Performs a move for the specified player at the target cell.
   * Enforces 3-mark FIFO vanishing rule.
   */
  public makeMove(player: PlayerSymbol, cell: number): { success: boolean; error?: string; state: VanishingGameState } {
    if (this.state.status !== 'in_progress') {
      return { success: false, error: 'O‘yin yakunlangan', state: this.getState() };
    }

    if (player !== this.state.turn) {
      return { success: false, error: 'Sizning navbatingiz emas', state: this.getState() };
    }

    if (cell < 0 || cell > 8) {
      return { success: false, error: 'Katakcha chegaradan tashqarida', state: this.getState() };
    }

    let vanishedCell: number | null = null;
    const playerMarks = this.state.marks[player];

    // If player already has 3 marks on the board:
    // Their oldest mark will vanish!
    if (playerMarks.length >= 3) {
      vanishedCell = playerMarks[0];
    }

    // A cell is valid if it's currently empty, OR if it's the exact cell being vacated by the player's own vanishing mark
    if (this.state.board[cell] !== null && cell !== vanishedCell) {
      return { success: false, error: 'Katakcha allaqachon band', state: this.getState() };
    }

    // Remove the oldest mark if 3 marks exist
    if (vanishedCell !== null) {
      this.state.marks[player].shift(); // FIFO removal
      this.state.board[vanishedCell] = null;
    }

    // Place the new mark
    this.state.board[cell] = player;
    this.state.marks[player].push(cell);
    this.state.moveCount++;

    // Record in history
    this.state.history.push({
      player,
      cell,
      vanishedCell,
      timestamp: Date.now(),
    });

    // Check winner
    const winResult = VanishingTicTacToe.checkWinner(this.state.board);
    if (winResult.winner) {
      this.state.winner = winResult.winner;
      this.state.winningLine = winResult.winningLine;
      this.state.status = 'won';
    } else {
      // Toggle turn
      this.state.turn = this.state.turn === 'X' ? 'O' : 'X';
    }

    // Update nextToVanish signals for UI
    this.state.nextToVanish.X = this.state.marks.X.length >= 3 ? this.state.marks.X[0] : null;
    this.state.nextToVanish.O = this.state.marks.O.length >= 3 ? this.state.marks.O[0] : null;

    return {
      success: true,
      state: this.getState(),
    };
  }

  /**
   * Resigns / forfeits the game
   */
  public resign(player: PlayerSymbol): VanishingGameState {
    if (this.state.status === 'in_progress') {
      this.state.winner = player === 'X' ? 'O' : 'X';
      this.state.status = 'won';
    }
    return this.getState();
  }

  /**
   * Reconstitutes game state from a stored snapshot
   */
  public static fromState(savedState: VanishingGameState): VanishingTicTacToe {
    const game = new VanishingTicTacToe(savedState.turn);
    game.state = JSON.parse(JSON.stringify(savedState));
    return game;
  }
}
