import { useState } from "react";

const puzzles = [
  [
    [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9],
  ],
  [
    [0,0,0,2,6,0,7,0,1],[6,8,0,0,7,0,0,9,0],[1,9,0,0,0,4,5,0,0],
    [8,2,0,1,0,0,0,4,0],[0,0,4,6,0,2,9,0,0],[0,5,0,0,0,3,0,2,8],
    [0,0,9,3,0,0,0,7,4],[0,4,0,0,5,0,0,3,6],[7,0,3,0,1,8,0,0,0],
  ],
];

const solutions = [
  [
    [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9],
  ],
  [
    [4,3,5,2,6,9,7,8,1],[6,8,2,5,7,1,4,9,3],[1,9,7,8,3,4,5,6,2],
    [8,2,6,1,9,5,3,4,7],[3,7,4,6,8,2,9,1,5],[9,5,1,7,4,3,6,2,8],
    [5,1,9,3,2,6,8,7,4],[2,4,8,9,5,7,1,3,6],[7,6,3,4,1,8,2,5,9],
  ],
];

const SudokuGame = () => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [grid, setGrid] = useState(() => puzzles[0].map(r => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const original = puzzles[puzzleIdx];

  const handleInput = (num: number) => {
    if (!selected) return;
    const [r, c] = selected;
    if (original[r][c] !== 0) return;
    const next = grid.map(row => [...row]);
    next[r][c] = num;
    setGrid(next);

    if (num !== 0 && solutions[puzzleIdx][r][c] !== num) {
      setErrors(prev => new Set(prev).add(`${r}-${c}`));
    } else {
      setErrors(prev => { const n = new Set(prev); n.delete(`${r}-${c}`); return n; });
    }
  };

  const reset = () => {
    setGrid(puzzles[puzzleIdx].map(r => [...r]));
    setSelected(null);
    setErrors(new Set());
  };

  const newPuzzle = () => {
    const idx = (puzzleIdx + 1) % puzzles.length;
    setPuzzleIdx(idx);
    setGrid(puzzles[idx].map(r => [...r]));
    setSelected(null);
    setErrors(new Set());
  };

  const solved = grid.every((row, ri) => row.every((cell, ci) => cell === solutions[puzzleIdx][ri][ci]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">🔲 Sudoku</h2>
          <p className="text-sm text-muted-foreground">{solved ? "🎉 Puzzle Solved!" : "Fill in the blanks with 1-9"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition hover:opacity-90">Reset</button>
          <button onClick={newPuzzle} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">New</button>
        </div>
      </div>

      <div className="grid grid-cols-9 gap-0 rounded-xl overflow-hidden border-2 border-foreground/30 shadow-card mx-auto max-w-sm">
        {grid.flatMap((row, ri) =>
          row.map((cell, ci) => {
            const isOriginal = original[ri][ci] !== 0;
            const isSelected = selected?.[0] === ri && selected?.[1] === ci;
            const isError = errors.has(`${ri}-${ci}`);
            const borderR = ci === 2 || ci === 5 ? "border-r-2 border-r-foreground/30" : "border-r border-r-border";
            const borderB = ri === 2 || ri === 5 ? "border-b-2 border-b-foreground/30" : "border-b border-b-border";
            return (
              <button key={`${ri}-${ci}`} onClick={() => !isOriginal && setSelected([ri, ci])}
                className={`aspect-square flex items-center justify-center text-sm sm:text-base font-bold transition
                  ${borderR} ${borderB}
                  ${isOriginal ? "bg-muted text-foreground" : "bg-card"}
                  ${isSelected ? "bg-primary/20 ring-1 ring-primary" : ""}
                  ${isError ? "text-destructive" : isOriginal ? "" : "text-primary"}
                  ${!isOriginal ? "cursor-pointer hover:bg-primary/10" : "cursor-default"}`}>
                {cell || ""}
              </button>
            );
          })
        )}
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => handleInput(n)}
            className="w-10 h-10 rounded-xl bg-card border border-border text-foreground font-bold hover:bg-primary/10 transition">{n}</button>
        ))}
        <button onClick={() => handleInput(0)}
          className="w-10 h-10 rounded-xl bg-destructive/10 border border-border text-destructive font-bold hover:bg-destructive/20 transition">✕</button>
      </div>
    </div>
  );
};

export default SudokuGame;
