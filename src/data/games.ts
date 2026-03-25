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
  { id: "memory", title: "Memory Match", emoji: "🃏", description: "Find matching pairs to test your memory.", difficulty: "Easy", category: "Memory", xpReward: 10 },
  { id: "tic-tac-toe", title: "Tic Tac Toe", emoji: "❌", description: "Classic X and O — get 3 in a row!", difficulty: "Easy", category: "Strategy", xpReward: 10 },
  { id: "typing-speed", title: "Typing Speed", emoji: "⌨️", description: "Improve your typing speed and accuracy.", difficulty: "Easy", category: "Skill", xpReward: 10 },
  { id: "math-quiz", title: "Math Quiz", emoji: "🧮", description: "Quick-fire math problems — add, subtract, multiply, divide!", difficulty: "Easy", category: "Education", xpReward: 15 },
  { id: "word-scramble", title: "Word Scramble", emoji: "🔤", description: "Unscramble educational words with hints.", difficulty: "Easy", category: "Word", xpReward: 15 },
  { id: "2048", title: "2048", emoji: "🔢", description: "Slide tiles to combine and reach 2048!", difficulty: "Medium", category: "Puzzle", xpReward: 20 },
  { id: "snake", title: "Snake", emoji: "🐍", description: "Guide the snake to eat and grow!", difficulty: "Medium", category: "Arcade", xpReward: 20 },
  { id: "wordle", title: "Wordle", emoji: "📝", description: "Guess the 5-letter word in 6 tries.", difficulty: "Medium", category: "Word", xpReward: 20 },
  { id: "connect-four", title: "Connect Four", emoji: "🔴", description: "Connect four discs in a row to win.", difficulty: "Medium", category: "Strategy", xpReward: 20 },
  { id: "flappy-bird", title: "Flappy Bird", emoji: "🐦", description: "Tap to fly through gaps — addictive!", difficulty: "Medium", category: "Arcade", xpReward: 20 },
  { id: "sudoku", title: "Sudoku", emoji: "🔲", description: "Fill the 9×9 grid with numbers 1-9.", difficulty: "Hard", category: "Puzzle", xpReward: 30 },
  { id: "chess", title: "Chess", emoji: "♟️", description: "The classic game of strategy and tactics!", difficulty: "Hard", category: "Strategy", xpReward: 30 },
];
