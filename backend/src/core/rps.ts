export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSState {
  player1Choice: RPSChoice | null;
  player2Choice: RPSChoice | null;
  round: number;
  winner: 'player1' | 'player2' | 'draw' | null;
  player1Symbol: 'X' | 'O' | null;
  player2Symbol: 'X' | 'O' | null;
}

export const RPS_CHOICES: RPSChoice[] = ['rock', 'paper', 'scissors'];

export function getRandomRPSChoice(): RPSChoice {
  const index = Math.floor(Math.random() * RPS_CHOICES.length);
  return RPS_CHOICES[index];
}

/**
 * Determines the winner between two RPS choices.
 * Returns: 'player1' | 'player2' | 'draw'
 */
export function evaluateRPS(choice1: RPSChoice, choice2: RPSChoice): 'player1' | 'player2' | 'draw' {
  if (choice1 === choice2) {
    return 'draw';
  }

  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'scissors' && choice2 === 'paper') ||
    (choice1 === 'paper' && choice2 === 'rock')
  ) {
    return 'player1';
  }

  return 'player2';
}

/**
 * Resolves an RPS stage given both players' choices.
 * If draws exceed maxDraws, automatically decides with a coin flip.
 */
export function resolveRPSStage(
  p1Choice: RPSChoice | null,
  p2Choice: RPSChoice | null,
  currentRound: number,
  maxDraws = 3
): RPSState {
  const finalP1Choice = p1Choice || getRandomRPSChoice();
  const finalP2Choice = p2Choice || getRandomRPSChoice();

  let winner = evaluateRPS(finalP1Choice, finalP2Choice);

  if (winner === 'draw' && currentRound >= maxDraws) {
    // Break tie with random coin flip
    winner = Math.random() < 0.5 ? 'player1' : 'player2';
  }

  let player1Symbol: 'X' | 'O' | null = null;
  let player2Symbol: 'X' | 'O' | null = null;

  if (winner === 'player1') {
    player1Symbol = 'X';
    player2Symbol = 'O';
  } else if (winner === 'player2') {
    player1Symbol = 'O';
    player2Symbol = 'X';
  }

  return {
    player1Choice: finalP1Choice,
    player2Choice: finalP2Choice,
    round: currentRound,
    winner,
    player1Symbol,
    player2Symbol,
  };
}
