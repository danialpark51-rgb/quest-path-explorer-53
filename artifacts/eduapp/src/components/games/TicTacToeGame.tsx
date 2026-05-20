import { useState, useCallback } from "react";

const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const checkWin = (b: (string|null)[]) => {
  for (const [a, b2, c] of lines) if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
  return b.every(Boolean) ? "draw" : null;
};

const TicTacToeGame = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const result = checkWin(board);

  const play = useCallback((i: number) => {
    if (board[i] || result) return;
    const next = [...board];
    next[i] = isX ? "X" : "O";
    setBoard(next);
    setIsX(!isX);
  }, [board, isX, result]);

  const reset = () => { setBoard(Array(9).fill(null)); setIsX(true); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">❌ Tic Tac Toe</h2>
          <p className="text-sm text-muted-foreground">
            {result === "draw" ? "It's a draw!" : result ? `${result} wins!` : `${isX ? "X" : "O"}'s turn`}
          </p>
        </div>
        <button onClick={reset} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">Reset</button>
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {board.map((cell, i) => (
          <button key={i} onClick={() => play(i)}
            className={`aspect-square rounded-2xl border border-border bg-card text-4xl font-bold shadow-card transition hover:scale-[1.02]
              ${cell === "X" ? "text-primary" : "text-accent"}`}>
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TicTacToeGame;
