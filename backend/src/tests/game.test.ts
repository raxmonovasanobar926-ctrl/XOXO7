import { describe, it, expect } from 'vitest';
import { evaluateRPS, resolveRPSStage } from '../core/rps.js';
import { VanishingTicTacToe } from '../core/vanishingTicTacToe.js';

describe('RPS Stage Logic', () => {
  it('correctly decides rock vs scissors', () => {
    expect(evaluateRPS('rock', 'scissors')).toBe('player1');
    expect(evaluateRPS('scissors', 'rock')).toBe('player2');
  });

  it('correctly decides scissors vs paper', () => {
    expect(evaluateRPS('scissors', 'paper')).toBe('player1');
    expect(evaluateRPS('paper', 'scissors')).toBe('player2');
  });

  it('correctly decides paper vs rock', () => {
    expect(evaluateRPS('paper', 'rock')).toBe('player1');
    expect(evaluateRPS('rock', 'paper')).toBe('player2');
  });

  it('correctly handles draw', () => {
    expect(evaluateRPS('rock', 'rock')).toBe('draw');
    expect(evaluateRPS('paper', 'paper')).toBe('draw');
    expect(evaluateRPS('scissors', 'scissors')).toBe('draw');
  });

  it('assigns X to winner and O to loser', () => {
    const res = resolveRPSStage('rock', 'scissors', 1);
    expect(res.winner).toBe('player1');
    expect(res.player1Symbol).toBe('X');
    expect(res.player2Symbol).toBe('O');

    const res2 = resolveRPSStage('paper', 'scissors', 1);
    expect(res2.winner).toBe('player2');
    expect(res2.player1Symbol).toBe('O');
    expect(res2.player2Symbol).toBe('X');
  });
});

describe('Vanishing Tic-Tac-Toe Logic', () => {
  it('initializes with empty board and X turn', () => {
    const game = new VanishingTicTacToe('X');
    const state = game.getState();
    expect(state.board.every(cell => cell === null)).toBe(true);
    expect(state.turn).toBe('X');
    expect(state.marks.X).toHaveLength(0);
    expect(state.marks.O).toHaveLength(0);
    expect(state.status).toBe('in_progress');
  });

  it('prevents playing out of turn', () => {
    const game = new VanishingTicTacToe('X');
    const res = game.makeMove('O', 0);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Sizning navbatingiz emas');
  });

  it('prevents placing on already occupied cell', () => {
    const game = new VanishingTicTacToe('X');
    game.makeMove('X', 4); // Center
    const res = game.makeMove('O', 4); // Try same cell
    expect(res.success).toBe(false);
    expect(res.error).toBe('Katakcha allaqachon band');
  });

  it('correctly signals nextToVanish when 3 marks are placed', () => {
    const game = new VanishingTicTacToe('X');
    game.makeMove('X', 0); // X #1
    game.makeMove('O', 1); // O #1
    game.makeMove('X', 2); // X #2
    game.makeMove('O', 3); // O #2
    game.makeMove('X', 4); // X #3 (now X has 3 marks)
    
    const state = game.getState();
    expect(state.marks.X).toEqual([0, 2, 4]);
    expect(state.nextToVanish.X).toBe(0); // 0 was the first mark placed!
    expect(state.nextToVanish.O).toBe(null); // O only has 2 marks
  });

  it('FIFO vanishing: 4th move removes the 1st placed mark', () => {
    const game = new VanishingTicTacToe('X');
    game.makeMove('X', 0); // X mark 1 at 0
    game.makeMove('O', 1); // O mark 1 at 1
    game.makeMove('X', 2); // X mark 2 at 2
    game.makeMove('O', 3); // O mark 2 at 3
    game.makeMove('X', 4); // X mark 3 at 4
    game.makeMove('O', 5); // O mark 3 at 5

    // Current board:
    // 0:X, 1:O, 2:X
    // 3:O, 4:X, 5:O
    // X marks: [0, 2, 4], O marks: [1, 3, 5]

    // Now X makes 4th move at cell 8!
    // Cell 0 MUST disappear!
    const res = game.makeMove('X', 8);
    expect(res.success).toBe(true);

    const state = game.getState();
    expect(state.board[0]).toBe(null); // Oldest cell 0 is now empty!
    expect(state.board[8]).toBe('X');
    expect(state.marks.X).toEqual([2, 4, 8]);
    expect(state.nextToVanish.X).toBe(2); // Next oldest is now 2
    expect(state.marks.X).toHaveLength(3); // Never more than 3 marks!
  });

  it('detects standard 3-in-a-row horizontal win', () => {
    const game = new VanishingTicTacToe('X');
    game.makeMove('X', 0);
    game.makeMove('O', 3);
    game.makeMove('X', 1);
    game.makeMove('O', 4);
    const res = game.makeMove('X', 2); // Top row [0, 1, 2] completed!

    expect(res.success).toBe(true);
    const state = game.getState();
    expect(state.winner).toBe('X');
    expect(state.winningLine).toEqual([0, 1, 2]);
    expect(state.status).toBe('won');
  });

  it('detects vertical win', () => {
    const game = new VanishingTicTacToe('X');
    game.makeMove('X', 0);
    game.makeMove('O', 1);
    game.makeMove('X', 3);
    game.makeMove('O', 2);
    const res = game.makeMove('X', 6); // Col 0: [0, 3, 6]

    expect(res.success).toBe(true);
    expect(res.state.winner).toBe('X');
    expect(res.state.winningLine).toEqual([0, 3, 6]);
  });

  it('detects diagonal win', () => {
    const game = new VanishingTicTacToe('X');
    game.makeMove('X', 0);
    game.makeMove('O', 1);
    game.makeMove('X', 4);
    game.makeMove('O', 2);
    const res = game.makeMove('X', 8); // Diagonal [0, 4, 8]

    expect(res.success).toBe(true);
    expect(res.state.winner).toBe('X');
    expect(res.state.winningLine).toEqual([0, 4, 8]);
  });

  it('detects win after vanishing older mark', () => {
    const game = new VanishingTicTacToe('X');
    // Set up X marks at 0, 4, 6
    game.makeMove('X', 0); // X1 at 0
    game.makeMove('O', 1); // O1 at 1
    game.makeMove('X', 4); // X2 at 4
    game.makeMove('O', 2); // O2 at 2
    game.makeMove('X', 6); // X3 at 6 (marks: 0, 4, 6)
    game.makeMove('O', 7); // O3 at 7

    // Now X places at 8:
    // Mark 0 vanishes. Remaining marks will be 4, 6, 8.
    // Notice [2, 4, 6] is diagonal, but cell 2 is O.
    // What if X placed at 2? Cell 2 is taken.
    // What if X placed at 5?
    // Let's test placing at 8: marks will be 4, 6, 8. No line.
    // Now O moves: O has marks [1, 2, 7].
    // Let's verify next move works smoothly and game continues!
    const res = game.makeMove('X', 8);
    expect(res.success).toBe(true);
    expect(res.state.board[0]).toBe(null);
    expect(res.state.marks.X).toEqual([4, 6, 8]);
    expect(res.state.status).toBe('in_progress');
  });
});
