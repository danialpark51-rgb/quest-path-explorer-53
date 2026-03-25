import { useEffect, useMemo, useState } from "react";

type InAppGameArenaProps = {
  gameId: string;
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const GameHeader = ({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel: string; onAction: () => void }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-xl font-display font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    <button
      type="button"
      onClick={onAction}
      className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
    >
      {actionLabel}
    </button>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
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
    const timer = window.setTimeout(() => {
      if (cards[a] === cards[b]) setMatched((prev) => [...prev, a, b]);
      setFlipped([]);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [flipped, cards]);

  return (
    <div className="space-y-4">
      <GameHeader title="Memory Match" subtitle="Find every pair to finish the board." actionLabel="Shuffle" onAction={() => { setCards(shuffle([...icons, ...icons])); setFlipped([]); setMatched([]); }} />
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, index) => {
          const visible = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={`${card}-${index}`}
              type="button"
              disabled={visible || flipped.length === 2}
              onClick={() => setFlipped((prev) => [...prev, index])}
              className="aspect-square rounded-2xl border border-border bg-card text-3xl shadow-card transition hover:scale-[1.02] disabled:cursor-default"
            >
              {visible ? card : "❓"}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TypingSpeedGame = () => {
  const phrases = [
    "Learning every day builds unstoppable momentum.",
    "Strong communication opens powerful opportunities.",
    "Consistent practice turns hard skills into habits.",
  ];
  const [target, setTarget] = useState(phrases[0]);
  const [input, setInput] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, secondsLeft]);

  const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length;
  const accuracy = input.length === 0 ? 100 : Math.max(0, Math.round((Array.from(input).filter((char, index) => char === target[index]).length / input.length) * 100));
  const elapsed = Math.max(1, 60 - secondsLeft);
  const wpm = started ? Math.round(wordsTyped / (elapsed / 60)) : 0;

  return (
    <div className="space-y-4">
      <GameHeader title="Typing Speed" subtitle="Type the full sentence before the timer ends." actionLabel="New round" onAction={() => { setTarget(phrases[(phrases.indexOf(target) + 1) % phrases.length]); setInput(""); setSecondsLeft(60); setStarted(false); }} />
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Time" value={`${secondsLeft}s`} />
        <StatCard label="WPM" value={`${Number.isFinite(wpm) ? wpm : 0}`} />
        <StatCard label="Accuracy" value={`${accuracy}%`} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className="text-sm leading-7 text-foreground">{target}</p>
      </div>
      <textarea
        value={input}
        onChange={(event) => {
          if (!started) setStarted(true);
          if (secondsLeft > 0) setInput(event.target.value);
        }}
        className="h-32 w-full rounded-2xl border border-border bg-card p-4 text-sm text-foreground outline-none ring-offset-background transition focus:ring-2 focus:ring-primary/50"
        placeholder="Start typing here..."
      />
    </div>
  );
};

const ConnectFourGame = () => {
  const rows = 6;
  const columns = 7;
  const emptyBoard = () => Array.from({ length: rows }, () => Array(columns).fill(0));
  const [board, setBoard] = useState<number[][]>(emptyBoard);
  const [player, setPlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<number | null>(null);

  const checkWinner = (grid: number[][], row: number, col: number, current: number) => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    return directions.some(([dr, dc]) => {
      let count = 1;
      [[1, 1], [-1, -1]].forEach(([sr, sc]) => {
        let r = row + dr * sr;
        let c = col + dc * sc;
        while (grid[r]?.[c] === current) {
          count += 1;
          r += dr * sr;
          c += dc * sc;
        }
      });
      return count >= 4;
    });
  };

  const dropDisc = (col: number) => {
    if (winner) return;
    const next = board.map((row) => [...row]);
    for (let row = rows - 1; row >= 0; row -= 1) {
      if (next[row][col] !== 0) continue;
      next[row][col] = player;
      setBoard(next);
      if (checkWinner(next, row, col, player)) setWinner(player);
      else setPlayer(player === 1 ? 2 : 1);
      return;
    }
  };

  return (
    <div className="space-y-4">
      <GameHeader title="Connect Four" subtitle={winner ? `Player ${winner} wins!` : `Player ${player}'s turn`} actionLabel="Reset" onAction={() => { setBoard(emptyBoard()); setPlayer(1); setWinner(null); }} />
      <div className="grid grid-cols-7 gap-2 rounded-3xl border border-border bg-card p-4 shadow-card">
        {Array.from({ length: columns }).map((_, col) => (
          <button key={`drop-${col}`} type="button" onClick={() => dropDisc(col)} className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition hover:opacity-90">Drop</button>
        ))}
        {board.flatMap((row, rowIndex) => row.map((cell, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} className="flex aspect-square items-center justify-center rounded-full bg-muted">
            <span className={`h-9 w-9 rounded-full ${cell === 1 ? "bg-primary" : cell === 2 ? "bg-accent" : "bg-background border border-border"}`} />
          </div>
        )))}
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

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const directions: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const next = directions[event.key];
      if (next) setDirection(next);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (isGameOver) return;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const head = { x: current[0].x + direction.x, y: current[0].y + direction.y };
        if (head.x < 0 || head.y < 0 || head.x >= size || head.y >= size || current.some((part) => part.x === head.x && part.y === head.y)) {
          setIsGameOver(true);
          return current;
        }

        const next = [head, ...current];
        if (head.x === food.x && head.y === food.y) {
          setFood({ x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) });
          return next;
        }

        next.pop();
        return next;
      });
    }, 220);
    return () => window.clearInterval(timer);
  }, [direction, food, isGameOver]);

  const occupied = useMemo(() => new Set(snake.map((part) => `${part.x}-${part.y}`)), [snake]);

  return (
    <div className="space-y-4">
      <GameHeader title="Snake" subtitle={isGameOver ? "Game over — press reset to play again." : "Use arrow keys to move."} actionLabel="Reset" onAction={() => { setSnake([{ x: 5, y: 5 }]); setFood({ x: 8, y: 8 }); setDirection({ x: 1, y: 0 }); setIsGameOver(false); }} />
      <div className="grid grid-cols-12 gap-1 rounded-3xl border border-border bg-card p-4 shadow-card">
        {Array.from({ length: size * size }).map((_, index) => {
          const x = index % size;
          const y = Math.floor(index / size);
          const isFood = food.x === x && food.y === y;
          const isSnake = occupied.has(`${x}-${y}`);
          return <div key={`${x}-${y}`} className={`aspect-square rounded-md ${isSnake ? "bg-primary" : isFood ? "bg-accent" : "bg-muted"}`} />;
        })}
      </div>
      <p className="text-sm text-muted-foreground">Score: {Math.max(0, snake.length - 1)}</p>
    </div>
  );
};

const Game2048 = () => {
  const spawnTile = (grid: number[]) => {
    const empty = grid.map((value, index) => (value === 0 ? index : -1)).filter((index) => index !== -1);
    if (empty.length === 0) return grid;
    const next = [...grid];
    next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.8 ? 4 : 2;
    return next;
  };

  const moveLeft = (grid: number[]) => {
    const rows = Array.from({ length: 4 }, (_, row) => grid.slice(row * 4, row * 4 + 4));
    return rows.flatMap((row) => {
      const compact = row.filter(Boolean);
      const next: number[] = [];
      for (let index = 0; index < compact.length; index += 1) {
        if (compact[index] === compact[index + 1]) {
          next.push(compact[index] * 2);
          index += 1;
        } else next.push(compact[index]);
      }
      while (next.length < 4) next.push(0);
      return next;
    });
  };

  const rotate = (grid: number[]) => {
    const rotated = Array(16).fill(0);
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) rotated[col * 4 + (3 - row)] = grid[row * 4 + col];
    }
    return rotated;
  };

  const [tiles, setTiles] = useState(() => spawnTile(spawnTile(Array(16).fill(0))));

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const actions = {
        ArrowLeft: (grid: number[]) => moveLeft(grid),
        ArrowRight: (grid: number[]) => moveLeft(grid.slice().reverse()).reverse(),
        ArrowUp: (grid: number[]) => rotate(rotate(rotate(moveLeft(rotate(grid))))),
        ArrowDown: (grid: number[]) => rotate(moveLeft(rotate(rotate(rotate(grid))))),
      } as const;

      const action = actions[event.key as keyof typeof actions];
      if (!action) return;
      setTiles((current) => {
        const moved = action(current);
        const unchanged = moved.every((value, index) => value === current[index]);
        return unchanged ? current : spawnTile(moved);
      });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="space-y-4">
      <GameHeader title="2048" subtitle="Use arrow keys to merge matching tiles." actionLabel="Reset" onAction={() => setTiles(spawnTile(spawnTile(Array(16).fill(0))))} />
      <div className="grid grid-cols-4 gap-3 rounded-3xl border border-border bg-card p-4 shadow-card">
        {tiles.map((tile, index) => <div key={`${tile}-${index}`} className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-lg font-bold text-foreground">{tile || ""}</div>)}
      </div>
    </div>
  );
};

const InAppGameArena = ({ gameId }: InAppGameArenaProps) => {
  switch (gameId) {
    case "memory":
      return <MemoryMatchGame />;
    case "typing-speed":
      return <TypingSpeedGame />;
    case "connect-four":
      return <ConnectFourGame />;
    case "snake":
      return <SnakeGame />;
    case "2048":
      return <Game2048 />;
    default:
      return null;
  }
};

export default InAppGameArena;