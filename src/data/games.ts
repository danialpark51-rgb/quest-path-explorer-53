export type Game = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  xpReward: number;
};

export const games: Game[] = [
  { id: "2048", title: "2048", emoji: "🔢", description: "Slide tiles to combine and reach 2048!", difficulty: "Easy", category: "Puzzle", xpReward: 15 },
  { id: "memory", title: "Memory Match", emoji: "🃏", description: "Find matching pairs to test your memory.", difficulty: "Easy", category: "Memory", xpReward: 10 },
  { id: "wordle", title: "Wordle", emoji: "📝", description: "Guess the 5-letter word in 6 tries.", difficulty: "Easy", category: "Word", xpReward: 15 },
  { id: "typing-speed", title: "Typing Speed", emoji: "⌨️", description: "Improve your typing speed and accuracy.", difficulty: "Easy", category: "Skill", xpReward: 10 },
  { id: "jigsaw", title: "Jigsaw Puzzle", emoji: "🧩", description: "Assemble pieces to complete images.", difficulty: "Easy", category: "Puzzle", xpReward: 10 },
  { id: "snake", title: "Snake", emoji: "🐍", description: "Guide the snake to eat and grow!", difficulty: "Medium", category: "Arcade", xpReward: 20 },
  { id: "sudoku", title: "Sudoku", emoji: "🔲", description: "Fill 9×9 grid with numbers 1-9.", difficulty: "Medium", category: "Puzzle", xpReward: 25 },
  { id: "flappy-bird", title: "Flappy Bird", emoji: "🐦", description: "Tap to fly through gaps — addictive!", difficulty: "Medium", category: "Arcade", xpReward: 20 },
  { id: "crossword", title: "Crossword", emoji: "📰", description: "Solve clues to fill the word grid.", difficulty: "Medium", category: "Word", xpReward: 20 },
  { id: "minesweeper", title: "Minesweeper", emoji: "💣", description: "Clear the board without hitting mines.", difficulty: "Medium", category: "Puzzle", xpReward: 25 },
  { id: "tetris", title: "Tetris", emoji: "🧱", description: "Arrange falling blocks to clear rows.", difficulty: "Medium", category: "Arcade", xpReward: 20 },
  { id: "connect-four", title: "Connect Four", emoji: "🔴", description: "Connect four discs in a row to win.", difficulty: "Medium", category: "Strategy", xpReward: 20 },
  { id: "chess", title: "Chess", emoji: "♟️", description: "The classic game of strategy!", difficulty: "Hard", category: "Strategy", xpReward: 30 },
  { id: "rubiks-cube", title: "Rubik's Cube", emoji: "🟩", description: "Solve the 3D color puzzle.", difficulty: "Hard", category: "Puzzle", xpReward: 30 },
  { id: "code-combat", title: "CodeCombat", emoji: "⚔️", description: "Learn coding through adventure levels.", difficulty: "Hard", category: "Coding", xpReward: 35 },
];

export const games: Game[] = [
  { id: "2048", title: "2048", emoji: "🔢", description: "Slide tiles and merge to reach 2048!", difficulty: "Medium", category: "Puzzle", xpReward: 30 },
  { id: "memory", title: "Memory Match", emoji: "🃏", description: "Flip cards and find matching pairs", difficulty: "Easy", category: "Memory", xpReward: 15 },
  { id: "tictactoe", title: "Tic Tac Toe", emoji: "❌", description: "Classic X and O game against AI", difficulty: "Easy", category: "Strategy", xpReward: 10 },
  { id: "sudoku", title: "Sudoku", emoji: "🔲", description: "Fill the 4x4 grid with numbers 1-4", difficulty: "Medium", category: "Logic", xpReward: 25 },
  { id: "snake", title: "Snake", emoji: "🐍", description: "Eat food and grow without hitting walls", difficulty: "Medium", category: "Arcade", xpReward: 20 },
  { id: "mathspeed", title: "Math Speed", emoji: "⚡", description: "Solve math problems as fast as you can!", difficulty: "Medium", category: "Math", xpReward: 25 },
  { id: "wordscramble", title: "Word Scramble", emoji: "🔤", description: "Unscramble the letters to find the word", difficulty: "Easy", category: "Language", xpReward: 15 },
  { id: "colormatch", title: "Color Match", emoji: "🎨", description: "Match the color name with the correct color", difficulty: "Easy", category: "Focus", xpReward: 10 },
  { id: "patternmemory", title: "Pattern Memory", emoji: "🧩", description: "Remember and repeat the pattern sequence", difficulty: "Hard", category: "Memory", xpReward: 35 },
  { id: "typingspeed", title: "Typing Speed", emoji: "⌨️", description: "Type words as fast as you can!", difficulty: "Medium", category: "Speed", xpReward: 20 },
  { id: "numberguess", title: "Number Guess", emoji: "🎯", description: "Guess the secret number with hints", difficulty: "Easy", category: "Logic", xpReward: 10 },
  { id: "reaction", title: "Reaction Time", emoji: "🟢", description: "Click as fast as you can when you see green!", difficulty: "Easy", category: "Speed", xpReward: 10 },
  { id: "quiz_rush", title: "Quiz Rush", emoji: "🏃", description: "Answer rapid-fire GK questions under time!", difficulty: "Hard", category: "Knowledge", xpReward: 40 },
  { id: "whackamole", title: "Whack-a-Mole", emoji: "🔨", description: "Click the moles as they pop up!", difficulty: "Easy", category: "Arcade", xpReward: 15 },
  { id: "simon", title: "Simon Says", emoji: "🔴", description: "Remember the growing color sequence", difficulty: "Hard", category: "Memory", xpReward: 35 },
];
