import ChessGame from "@/components/games/ChessGame";
import FlappyBirdGame from "@/components/games/FlappyBirdGame";
import SudokuGame from "@/components/games/SudokuGame";
import WordScrambleGame from "@/components/games/WordScrambleGame";
import MathQuizGame from "@/components/games/MathQuizGame";
import WordleGame from "@/components/games/WordleGame";
import TicTacToeGame from "@/components/games/TicTacToeGame";
import { useEffect, useMemo, useState } from "react";

type InAppGameArenaProps = { gameId: string };

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const GameHeader = ({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel: string; onAction: () => void }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-xl font-display font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    <button type="button" onClick={onAction} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">{actionLabel}</button>
  </div>
);

const MemoryMatchGame = () => {
  const icons = ["🚀", "🧠", "📚", "⚙️", "🌍", "✈️", "💡", "🎯"];
  const [cards, setCards] = useState(() => shuffle([...icons, ...icons]));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const timer = window.setTimeout(() => { if (cards[a] === cards[b]) setMatched(p => [...p, a, b]); setFlipped([]); }, 700);
    return () => window.clearTimeout(timer);
  }, [flipped, cards]);
  return (
    <div className="space-y-4">
      <GameHeader title="Memory Match" subtitle="Find every pair." actionLabel="Shuffle" onAction={() => { setCards(shuffle([...icons, ...icons])); setFlipped([]); setMatched([]); }} />
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const visible = flipped.includes(i) || matched.includes(i);
          return <button key={`${card}-${i}`} disabled={visible || flipped.length === 2} onClick={() => setFlipped(p => [...p, i])} className="aspect-square rounded-2xl border border-border bg-card text-3xl shadow-card transition hover:scale-[1.02] disabled:cursor-default">{visible ? card : "❓"}</button>;
        })}
      </div>
    </div>
  );
};

const TypingSpeedGame = () => {
  const phrases = ["Learning every day builds unstoppable momentum.", "Strong communication opens powerful opportunities.", "Consistent practice turns hard skills into habits."];
  const [target, setTarget] = useState(phrases[0]);
  const [input, setInput] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [started, setStarted] = useState(false);
  useEffect(() => { if (!started || secondsLeft <= 0) return; const t = window.setInterval(() => setSecondsLeft(p => p - 1), 1000); return () => window.clearInterval(t); }, [started, secondsLeft]);
  const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length;
  const accuracy = input.length === 0 ? 100 : Math.max(0, Math.round((Array.from(input).filter((c, i) => c === target[i]).length / input.length) * 100));
  const elapsed = Math.max(1, 60 - secondsLeft);
  const wpm = started ? Math.round(wordsTyped / (elapsed / 60)) : 0;
  return (
    <div className="space-y-4">
      <GameHeader title="Typing Speed" subtitle="Type the sentence before time runs out." actionLabel="New round" onAction={() => { setTarget(phrases[(phrases.indexOf(target) + 1) % phrases.length]); setInput(""); setSecondsLeft(60); setStarted(false); }} />
      <div className="grid gap-3 md:grid-cols-3">
        {[["Time", `${secondsLeft}s`], ["WPM", `${Number.isFinite(wpm) ? wpm : 0}`], ["Accuracy", `${accuracy}%`]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-border bg-card p-4 shadow-card"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{l}</p><p className="mt-2 text-xl font-bold text-foreground">{v}</p></div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card"><p className="text-sm leading-7 text-foreground">{target}</p></div>
      <textarea value={input} onChange={e => { if (!started) setStarted(true); if (secondsLeft > 0) setInput(e.target.value); }} className="h-32 w-full rounded-2xl border border-border bg-card p-4 text-sm text-foreground outline-none ring-offset-background transition focus:ring-2 focus:ring-primary/50" placeholder="Start typing here..." />
    </div>
  );
};

const ConnectFourGame = () => {
  const rows = 6, columns = 7;
  const emptyBoard = () => Array.from({ length: rows }, () => Array(columns).fill(0));
  const [board, setBoard] = useState<number[][]>(emptyBoard);
  const [player, setPlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<number | null>(null);
  const checkWinner = (g: number[][], r: number, c: number, cur: number) => [[0,1],[1,0],[1,1],[1,-1]].some(([dr, dc]) => { let count = 1; [[1,1],[-1,-1]].forEach(([sr, sc]) => { let rr = r + dr * sr, cc = c + dc * sc; while (g[rr]?.[cc] === cur) { count++; rr += dr * sr; cc += dc * sc; } }); return count >= 4; });
  const dropDisc = (col: number) => { if (winner) return; const n = board.map(r => [...r]); for (let r = rows - 1; r >= 0; r--) { if (n[r][col] !== 0) continue; n[r][col] = player; setBoard(n); if (checkWinner(n, r, col, player)) setWinner(player); else setPlayer(player === 1 ? 2 : 1); return; } };
  return (
    <div className="space-y-4">
      <GameHeader title="Connect Four" subtitle={winner ? `Player ${winner} wins!` : `Player ${player}'s turn`} actionLabel="Reset" onAction={() => { setBoard(emptyBoard()); setPlayer(1); setWinner(null); }} />
      <div className="grid grid-cols-7 gap-2 rounded-3xl border border-border bg-card p-4 shadow-card">
        {Array.from({ length: columns }).map((_, c) => <button key={`d-${c}`} onClick={() => dropDisc(c)} className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition hover:opacity-90">Drop</button>)}
        {board.flatMap((row, ri) => row.map((cell, ci) => <div key={`${ri}-${ci}`} className="flex aspect-square items-center justify-center rounded-full bg-muted"><span className={`h-9 w-9 rounded-full ${cell === 1 ? "bg-primary" : cell === 2 ? "bg-accent" : "bg-background border border-border"}`} /></div>))}
      </div>
    </div>
  );
};

const SnakeGame = () => {
  const size = 12;
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [food, setFood] = useState({ x: 8, y: 8 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  useEffect(() => { const h = (e: KeyboardEvent) => { const d: Record<string, { x: number; y: number }> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } }; if (d[e.key]) setDirection(d[e.key]); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  useEffect(() => { if (isGameOver) return; const t = window.setInterval(() => { setSnake(cur => { const head = { x: cur[0].x + direction.x, y: cur[0].y + direction.y }; if (head.x < 0 || head.y < 0 || head.x >= size || head.y >= size || cur.some(p => p.x === head.x && p.y === head.y)) { setIsGameOver(true); return cur; } const n = [head, ...cur]; if (head.x === food.x && head.y === food.y) { setFood({ x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) }); return n; } n.pop(); return n; }); }, 220); return () => window.clearInterval(t); }, [direction, food, isGameOver]);
  const occupied = useMemo(() => new Set(snake.map(p => `${p.x}-${p.y}`)), [snake]);
  return (
    <div className="space-y-4">
      <GameHeader title="Snake" subtitle={isGameOver ? "Game over!" : "Use arrow keys."} actionLabel="Reset" onAction={() => { setSnake([{ x: 5, y: 5 }]); setFood({ x: 8, y: 8 }); setDirection({ x: 1, y: 0 }); setIsGameOver(false); }} />
      <div className="grid grid-cols-12 gap-1 rounded-3xl border border-border bg-card p-4 shadow-card">
        {Array.from({ length: size * size }).map((_, i) => { const x = i % size, y = Math.floor(i / size); return <div key={`${x}-${y}`} className={`aspect-square rounded-md ${occupied.has(`${x}-${y}`) ? "bg-primary" : food.x === x && food.y === y ? "bg-accent" : "bg-muted"}`} />; })}
      </div>
      <p className="text-sm text-muted-foreground">Score: {Math.max(0, snake.length - 1)}</p>
    </div>
  );
};

const Game2048 = () => {
  const spawnTile = (g: number[]) => { const e = g.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1); if (!e.length) return g; const n = [...g]; n[e[Math.floor(Math.random() * e.length)]] = Math.random() > 0.8 ? 4 : 2; return n; };
  const moveLeft = (g: number[]) => Array.from({ length: 4 }, (_, r) => g.slice(r * 4, r * 4 + 4)).flatMap(row => { const c = row.filter(Boolean); const n: number[] = []; for (let i = 0; i < c.length; i++) { if (c[i] === c[i + 1]) { n.push(c[i] * 2); i++; } else n.push(c[i]); } while (n.length < 4) n.push(0); return n; });
  const rotate = (g: number[]) => { const r = Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) r[j * 4 + (3 - i)] = g[i * 4 + j]; return r; };
  const [tiles, setTiles] = useState(() => spawnTile(spawnTile(Array(16).fill(0))));
  useEffect(() => { const h = (e: KeyboardEvent) => { const a = { ArrowLeft: (g: number[]) => moveLeft(g), ArrowRight: (g: number[]) => moveLeft(g.slice().reverse()).reverse(), ArrowUp: (g: number[]) => rotate(rotate(rotate(moveLeft(rotate(g))))), ArrowDown: (g: number[]) => rotate(moveLeft(rotate(rotate(rotate(g))))) } as const; const act = a[e.key as keyof typeof a]; if (!act) return; setTiles(c => { const m = act(c); return m.every((v, i) => v === c[i]) ? c : spawnTile(m); }); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  return (
    <div className="space-y-4">
      <GameHeader title="2048" subtitle="Use arrow keys to merge tiles." actionLabel="Reset" onAction={() => setTiles(spawnTile(spawnTile(Array(16).fill(0))))} />
      <div className="grid grid-cols-4 gap-3 rounded-3xl border border-border bg-card p-4 shadow-card">
        {tiles.map((t, i) => <div key={`${t}-${i}`} className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-lg font-bold text-foreground">{t || ""}</div>)}
      </div>
    </div>
  );
};

const InAppGameArena = ({ gameId }: InAppGameArenaProps) => {
  switch (gameId) {
    case "memory": return <MemoryMatchGame />;
    case "typing-speed": return <TypingSpeedGame />;
    case "connect-four": return <ConnectFourGame />;
    case "snake": return <SnakeGame />;
    case "2048": return <Game2048 />;
    case "chess": return <ChessGame />;
    case "flappy-bird": return <FlappyBirdGame />;
    case "sudoku": return <SudokuGame />;
    case "word-scramble": return <WordScrambleGame />;
    case "math-quiz": return <MathQuizGame />;
    case "wordle": return <WordleGame />;
    case "tic-tac-toe": return <TicTacToeGame />;
    default: return null;
  }
};

export default InAppGameArena;
