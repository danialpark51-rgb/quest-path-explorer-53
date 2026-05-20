import { useState, useCallback } from "react";

type Piece = string | null;
type Board = Piece[][];

const initialBoard: Board = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

const whitePieces = new Set(["♙", "♖", "♘", "♗", "♕", "♔"]);
const blackPieces = new Set(["♟", "♜", "♞", "♝", "♛", "♚"]);

const isWhite = (p: Piece) => p ? whitePieces.has(p) : false;
const isBlack = (p: Piece) => p ? blackPieces.has(p) : false;

const getValidMoves = (board: Board, row: number, col: number, isWhiteTurn: boolean): [number, number][] => {
  const piece = board[row][col];
  if (!piece) return [];
  if (isWhiteTurn && !isWhite(piece)) return [];
  if (!isWhiteTurn && !isBlack(piece)) return [];

  const moves: [number, number][] = [];
  const friendly = isWhiteTurn ? isWhite : isBlack;
  const inBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

  if (piece === "♙") {
    if (row > 0 && !board[row - 1][col]) moves.push([row - 1, col]);
    if (row === 6 && !board[5][col] && !board[4][col]) moves.push([row - 2, col]);
    if (row > 0 && col > 0 && isBlack(board[row - 1][col - 1])) moves.push([row - 1, col - 1]);
    if (row > 0 && col < 7 && isBlack(board[row - 1][col + 1])) moves.push([row - 1, col + 1]);
  } else if (piece === "♟") {
    if (row < 7 && !board[row + 1][col]) moves.push([row + 1, col]);
    if (row === 1 && !board[2][col] && !board[3][col]) moves.push([row + 2, col]);
    if (row < 7 && col > 0 && isWhite(board[row + 1][col - 1])) moves.push([row + 1, col - 1]);
    if (row < 7 && col < 7 && isWhite(board[row + 1][col + 1])) moves.push([row + 1, col + 1]);
  } else if (piece === "♘" || piece === "♞") {
    const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [dr, dc] of knightMoves) {
      const nr = row + dr, nc = col + dc;
      if (inBounds(nr, nc) && !friendly(board[nr][nc])) moves.push([nr, nc]);
    }
  } else {
    const directions: [number, number][][] = [];
    if ("♖♜♕♛".includes(piece)) directions.push([[1,0],[-1,0],[0,1],[0,-1]]);
    if ("♗♝♕♛".includes(piece)) directions.push([[1,1],[1,-1],[-1,1],[-1,-1]]);
    if ("♔♚".includes(piece)) {
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const nr = row + dr, nc = col + dc;
        if (inBounds(nr, nc) && !friendly(board[nr][nc])) moves.push([nr, nc]);
      }
    }
    for (const dirs of directions) {
      for (const [dr, dc] of dirs) {
        let r = row + dr, c = col + dc;
        while (inBounds(r, c)) {
          if (friendly(board[r][c])) break;
          moves.push([r, c]);
          if (board[r][c]) break;
          r += dr; c += dc;
        }
      }
    }
  }
  return moves;
};

const ChessGame = () => {
  const [board, setBoard] = useState<Board>(() => initialBoard.map(r => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [captured, setCaptured] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);

  const handleClick = useCallback((row: number, col: number) => {
    const piece = board[row][col];

    if (selected) {
      const isValid = validMoves.some(([r, c]) => r === row && c === col);
      if (isValid) {
        const next = board.map(r => [...r]);
        const target = next[row][col];
        if (target) {
          if (isWhite(target)) setCaptured(p => ({ ...p, white: [...p.white, target] }));
          else setCaptured(p => ({ ...p, black: [...p.black, target] }));
        }
        next[row][col] = next[selected[0]][selected[1]];
        next[selected[0]][selected[1]] = null;
        // Pawn promotion
        if (next[row][col] === "♙" && row === 0) next[row][col] = "♕";
        if (next[row][col] === "♟" && row === 7) next[row][col] = "♛";
        setBoard(next);
        setIsWhiteTurn(!isWhiteTurn);
        setSelected(null);
        setValidMoves([]);
        return;
      }
    }

    if (piece && ((isWhiteTurn && isWhite(piece)) || (!isWhiteTurn && isBlack(piece)))) {
      setSelected([row, col]);
      setValidMoves(getValidMoves(board, row, col, isWhiteTurn));
    } else {
      setSelected(null);
      setValidMoves([]);
    }
  }, [board, selected, isWhiteTurn, validMoves]);

  const reset = () => {
    setBoard(initialBoard.map(r => [...r]));
    setSelected(null);
    setIsWhiteTurn(true);
    setCaptured({ white: [], black: [] });
    setValidMoves([]);
  };

  const isValidTarget = (r: number, c: number) => validMoves.some(([vr, vc]) => vr === r && vc === c);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">♟ Chess</h2>
          <p className="text-sm text-muted-foreground">{isWhiteTurn ? "White" : "Black"}'s turn</p>
        </div>
        <button onClick={reset} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">Reset</button>
      </div>

      {captured.black.length > 0 && (
        <div className="flex gap-1 text-lg">{captured.black.map((p, i) => <span key={i}>{p}</span>)}</div>
      )}

      <div className="grid grid-cols-8 gap-0 rounded-xl overflow-hidden border border-border shadow-card">
        {board.flatMap((row, ri) =>
          row.map((cell, ci) => {
            const isDark = (ri + ci) % 2 === 1;
            const isSelected = selected?.[0] === ri && selected?.[1] === ci;
            const isTarget = isValidTarget(ri, ci);
            return (
              <button key={`${ri}-${ci}`} onClick={() => handleClick(ri, ci)}
                className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl transition-all
                  ${isDark ? "bg-primary/20" : "bg-card"}
                  ${isSelected ? "ring-2 ring-primary ring-inset bg-primary/40" : ""}
                  ${isTarget ? "bg-accent/30" : ""}
                  hover:brightness-110`}>
                {cell || (isTarget ? <span className="w-3 h-3 rounded-full bg-accent/50" /> : null)}
              </button>
            );
          })
        )}
      </div>

      {captured.white.length > 0 && (
        <div className="flex gap-1 text-lg">{captured.white.map((p, i) => <span key={i}>{p}</span>)}</div>
      )}
    </div>
  );
};

export default ChessGame;
