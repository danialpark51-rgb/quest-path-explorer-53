import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Gamepad2, Trophy } from "lucide-react";
import { games, Game } from "@/data/games";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import BottomNav from "@/components/BottomNav";

// ==================== GAMES PAGE (list) ====================
const GamesPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const categories = ["All", ...Array.from(new Set(games.map(g => g.category)))];
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? games : games.filter(g => g.category === filter);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> {t("home")}
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">🎮 {t("games")}</h1>
        <p className="text-sm text-muted-foreground mb-4">Play skill-building games and earn XP!</p>

        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {filtered.map((game, idx) => (
            <motion.div key={game.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              onClick={() => navigate(`/game/${game.id}`)}
              className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-elevated transition group">
              <span className="text-3xl">{game.emoji}</span>
              <h3 className="font-display font-bold text-sm text-foreground mt-2">{game.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{game.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${game.difficulty === "Easy" ? "bg-primary/10 text-primary" : game.difficulty === "Medium" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                  {game.difficulty}
                </span>
                <span className="text-xs font-bold text-accent">+{game.xpReward}XP</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default GamesPage;

// ==================== GAME PLAY PAGE ====================
export const GamePlayPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { addXP } = useUser();
  const game = games.find(g => g.id === gameId);

  if (!game) return <div className="min-h-screen flex items-center justify-center text-foreground">Game not found</div>;

  const handleWin = (xp: number) => addXP(xp);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/games")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{game.emoji}</span>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">{game.title}</h1>
            <p className="text-sm text-muted-foreground">{game.description}</p>
          </div>
        </div>

        {gameId === "2048" && <Game2048 onWin={() => handleWin(30)} />}
        {gameId === "memory" && <GameMemory onWin={() => handleWin(15)} />}
        {gameId === "tictactoe" && <GameTicTacToe onWin={() => handleWin(10)} />}
        {gameId === "snake" && <GameSnake onWin={() => handleWin(20)} />}
        {gameId === "mathspeed" && <GameMathSpeed onWin={() => handleWin(25)} />}
        {gameId === "wordscramble" && <GameWordScramble onWin={() => handleWin(15)} />}
        {gameId === "colormatch" && <GameColorMatch onWin={() => handleWin(10)} />}
        {gameId === "patternmemory" && <GamePatternMemory onWin={() => handleWin(35)} />}
        {gameId === "typingspeed" && <GameTypingSpeed onWin={() => handleWin(20)} />}
        {gameId === "numberguess" && <GameNumberGuess onWin={() => handleWin(10)} />}
        {gameId === "reaction" && <GameReaction onWin={() => handleWin(10)} />}
        {gameId === "sudoku" && <GameSudoku onWin={() => handleWin(25)} />}
        {gameId === "quiz_rush" && <GameQuizRush onWin={() => handleWin(40)} />}
        {gameId === "whackamole" && <GameWhackAMole onWin={() => handleWin(15)} />}
        {gameId === "simon" && <GameSimon onWin={() => handleWin(35)} />}
      </div>
    </div>
  );
};

// ==================== INDIVIDUAL GAMES ====================

// 2048
const Game2048 = ({ onWin }: { onWin: () => void }) => {
  const initBoard = (): number[][] => {
    const b = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandom(b); addRandom(b);
    return b;
  };
  const addRandom = (b: number[][]) => {
    const empty: [number, number][] = [];
    b.forEach((r, i) => r.forEach((c, j) => { if (c === 0) empty.push([i, j]); }));
    if (empty.length === 0) return;
    const [ri, rj] = empty[Math.floor(Math.random() * empty.length)];
    b[ri][rj] = Math.random() < 0.9 ? 2 : 4;
  };

  const [board, setBoard] = useState(initBoard);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const slide = (row: number[]): [number[], number] => {
    let s = 0;
    let arr = row.filter(x => x !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) { arr[i] *= 2; s += arr[i]; arr[i + 1] = 0; }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < 4) arr.push(0);
    return [arr, s];
  };

  const move = useCallback((dir: string) => {
    if (gameOver) return;
    let b = board.map(r => [...r]);
    let pts = 0;
    const rotate = (b: number[][]) => b[0].map((_, i) => b.map(r => r[i]).reverse());

    let rotations = dir === "left" ? 0 : dir === "down" ? 1 : dir === "right" ? 2 : 3;
    for (let i = 0; i < rotations; i++) b = rotate(b);
    let moved = false;
    b = b.map(row => {
      const [newRow, s] = slide(row);
      pts += s;
      if (row.some((v, i) => v !== newRow[i])) moved = true;
      return newRow;
    });
    for (let i = 0; i < (4 - rotations) % 4; i++) b = rotate(b);

    if (moved) {
      addRandom(b);
      setBoard(b);
      setScore(s => s + pts);
      if (b.some(r => r.includes(2048))) onWin();
      const hasEmpty = b.some(r => r.includes(0));
      if (!hasEmpty) {
        let canMove = false;
        for (let i = 0; i < 4 && !canMove; i++)
          for (let j = 0; j < 3 && !canMove; j++) {
            if (b[i][j] === b[i][j + 1] || b[j][i] === b[j + 1][i]) canMove = true;
          }
        if (!canMove) setGameOver(true);
      }
    }
  }, [board, gameOver, onWin]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        move(e.key.replace("Arrow", "").toLowerCase());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  const tileColor = (v: number) => {
    const colors: Record<number, string> = { 2: "bg-muted", 4: "bg-accent/20", 8: "bg-accent/40", 16: "bg-accent/60", 32: "bg-accent/80", 64: "bg-accent", 128: "bg-primary/40", 256: "bg-primary/60", 512: "bg-primary/80", 1024: "bg-primary", 2048: "bg-destructive" };
    return colors[v] || "bg-muted";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-xs mb-4">
        <span className="font-display font-bold text-foreground">Score: {score}</span>
        <button onClick={() => { setBoard(initBoard()); setScore(0); setGameOver(false); }} className="text-sm text-primary font-medium">Reset</button>
      </div>
      <div className="grid grid-cols-4 gap-2 bg-muted p-2 rounded-xl">
        {board.flat().map((v, i) => (
          <div key={i} className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center font-bold text-lg ${v === 0 ? "bg-muted/50" : tileColor(v)} ${v >= 8 ? "text-primary-foreground" : "text-foreground"}`}>
            {v > 0 ? v : ""}
          </div>
        ))}
      </div>
      {gameOver && <p className="text-destructive font-bold mt-4">Game Over! Score: {score}</p>}
      <div className="grid grid-cols-3 gap-2 mt-4 w-36">
        <div />
        <button onClick={() => move("up")} className="bg-card border border-border rounded-lg p-2 text-center text-foreground font-bold">↑</button>
        <div />
        <button onClick={() => move("left")} className="bg-card border border-border rounded-lg p-2 text-center text-foreground font-bold">←</button>
        <button onClick={() => move("down")} className="bg-card border border-border rounded-lg p-2 text-center text-foreground font-bold">↓</button>
        <button onClick={() => move("right")} className="bg-card border border-border rounded-lg p-2 text-center text-foreground font-bold">→</button>
      </div>
    </div>
  );
};

// Memory Match
const GameMemory = ({ onWin }: { onWin: () => void }) => {
  const emojis = ["🍎", "🍊", "🍋", "🍇", "🍓", "🍑", "🥝", "🍒"];
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  const handleFlip = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        const newMatched = [...matched, ...newFlipped];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length) onWin();
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Moves: {moves} | Matched: {matched.length / 2}/{emojis.length}</p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((emoji, i) => (
          <button key={i} onClick={() => handleFlip(i)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-2xl flex items-center justify-center transition-all ${matched.includes(i) ? "bg-primary/20 border-primary border-2" : flipped.includes(i) ? "bg-card border border-border" : "bg-muted border border-border hover:bg-muted/80"}`}>
            {flipped.includes(i) || matched.includes(i) ? emoji : "?"}
          </button>
        ))}
      </div>
      {matched.length === cards.length && <p className="text-primary font-bold mt-4">🎉 You Win! Completed in {moves} moves!</p>}
    </div>
  );
};

// Tic Tac Toe
const GameTicTacToe = ({ onWin }: { onWin: () => void }) => {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [isX, setIsX] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const checkWin = (b: string[]): string | null => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, b2, c] of lines) {
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
    }
    return b.includes("") ? null : "Draw";
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const b = [...board];
    b[i] = "X";
    let w = checkWin(b);
    if (!w) {
      const empty = b.map((v, i) => v === "" ? i : -1).filter(i => i >= 0);
      if (empty.length > 0) {
        b[empty[Math.floor(Math.random() * empty.length)]] = "O";
        w = checkWin(b);
      }
    }
    setBoard(b);
    if (w) { setWinner(w); if (w === "X") onWin(); }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className={`w-20 h-20 rounded-xl text-3xl font-bold flex items-center justify-center border border-border transition ${cell === "X" ? "text-primary bg-primary/10" : cell === "O" ? "text-destructive bg-destructive/10" : "bg-card hover:bg-muted"}`}>
            {cell}
          </button>
        ))}
      </div>
      {winner && <p className={`font-bold mt-4 ${winner === "X" ? "text-primary" : winner === "O" ? "text-destructive" : "text-foreground"}`}>{winner === "Draw" ? "It's a draw!" : `${winner} wins!`}</p>}
      {winner && <button onClick={() => { setBoard(Array(9).fill("")); setWinner(null); }} className="mt-2 text-sm text-primary font-medium">Play Again</button>}
    </div>
  );
};

// Snake
const GameSnake = ({ onWin }: { onWin: () => void }) => {
  const SIZE = 15;
  const [snake, setSnake] = useState<[number, number][]>([[7, 7]]);
  const [food, setFood] = useState<[number, number]>([3, 3]);
  const [dir, setDir] = useState<[number, number]>([0, 1]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);

  const newFood = useCallback((s: [number, number][]): [number, number] => {
    let f: [number, number];
    do { f = [Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)]; }
    while (s.some(([r, c]) => r === f[0] && c === f[1]));
    return f;
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head: [number, number] = [prev[0][0] + dir[0], prev[0][1] + dir[1]];
        if (head[0] < 0 || head[0] >= SIZE || head[1] < 0 || head[1] >= SIZE || prev.some(([r, c]) => r === head[0] && c === head[1])) {
          setGameOver(true);
          if (score >= 10) onWin();
          return prev;
        }
        const newSnake: [number, number][] = [head, ...prev];
        if (head[0] === food[0] && head[1] === food[1]) {
          setFood(newFood(newSnake));
          setScore(s => s + 1);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [dir, running, gameOver, food, score, onWin, newFood]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const dirs: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (dirs[e.key]) { e.preventDefault(); setDir(dirs[e.key]); if (!running) setRunning(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running]);

  const handleDir = (d: [number, number]) => { setDir(d); if (!running) setRunning(true); };

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-2">Score: {score}</p>
      <div className="grid bg-muted rounded-lg p-1" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: "1px" }}>
        {Array(SIZE * SIZE).fill(0).map((_, i) => {
          const r = Math.floor(i / SIZE), c = i % SIZE;
          const isSnake = snake.some(([sr, sc]) => sr === r && sc === c);
          const isHead = snake[0][0] === r && snake[0][1] === c;
          const isFood = food[0] === r && food[1] === c;
          return <div key={i} className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${isHead ? "bg-primary" : isSnake ? "bg-primary/60" : isFood ? "bg-destructive" : "bg-card"}`} />;
        })}
      </div>
      {!running && !gameOver && <p className="text-sm text-muted-foreground mt-4">Press arrow keys or buttons to start!</p>}
      {gameOver && <p className="text-destructive font-bold mt-4">Game Over! Score: {score}</p>}
      {gameOver && <button onClick={() => { setSnake([[7, 7]]); setFood([3, 3]); setDir([0, 1]); setGameOver(false); setScore(0); setRunning(false); }} className="mt-2 text-sm text-primary font-medium">Play Again</button>}
      <div className="grid grid-cols-3 gap-2 mt-4 w-36">
        <div /><button onClick={() => handleDir([-1, 0])} className="bg-card border border-border rounded-lg p-2 text-foreground font-bold">↑</button><div />
        <button onClick={() => handleDir([0, -1])} className="bg-card border border-border rounded-lg p-2 text-foreground font-bold">←</button>
        <button onClick={() => handleDir([1, 0])} className="bg-card border border-border rounded-lg p-2 text-foreground font-bold">↓</button>
        <button onClick={() => handleDir([0, 1])} className="bg-card border border-border rounded-lg p-2 text-foreground font-bold">→</button>
      </div>
    </div>
  );
};

// Math Speed
const GameMathSpeed = ({ onWin }: { onWin: () => void }) => {
  const generate = () => {
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
    return { q: `${a} ${op} ${b}`, answer };
  };
  const [problem, setProblem] = useState(generate);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft]);

  useEffect(() => { if (timeLeft === 0 && score >= 5) onWin(); }, [timeLeft, score, onWin]);

  const check = () => {
    if (parseInt(input) === problem.answer) setScore(s => s + 1);
    setTotal(t => t + 1);
    setProblem(generate());
    setInput("");
    if (!started) setStarted(true);
  };

  if (timeLeft <= 0) return (
    <div className="text-center">
      <Trophy className="w-12 h-12 text-accent mx-auto mb-4" />
      <p className="text-2xl font-bold text-foreground">{score}/{total} correct!</p>
      <button onClick={() => { setTimeLeft(30); setScore(0); setTotal(0); setStarted(false); setProblem(generate()); }} className="mt-4 px-4 py-2 rounded-lg gradient-hero text-primary-foreground font-medium">Play Again</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Time: {timeLeft}s | Score: {score}</p>
      <p className="text-4xl font-bold text-foreground mb-6">{problem.q} = ?</p>
      <input type="number" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && check()}
        className="w-32 text-center text-2xl p-3 rounded-xl bg-card border border-border text-foreground" autoFocus />
      <button onClick={check} className="mt-4 px-6 py-2 rounded-lg gradient-hero text-primary-foreground font-medium">Submit</button>
    </div>
  );
};

// Word Scramble
const GameWordScramble = ({ onWin }: { onWin: () => void }) => {
  const words = ["SCIENCE", "HISTORY", "BIOLOGY", "PHYSICS", "CODING", "ENGLISH", "MATHS", "GEOGRAPHY", "CHEMISTRY", "COMPUTER"];
  const [wordIdx, setWordIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("");

  const scramble = (w: string) => w.split("").sort(() => Math.random() - 0.5).join("");
  const [scrambled, setScrambled] = useState(scramble(words[0]));

  const check = () => {
    if (input.toUpperCase() === words[wordIdx]) {
      setScore(s => s + 1);
      setMsg("✅ Correct!");
      if (wordIdx + 1 >= words.length) { onWin(); return; }
      setTimeout(() => {
        setWordIdx(i => i + 1);
        setScrambled(scramble(words[wordIdx + 1]));
        setInput("");
        setMsg("");
      }, 800);
    } else {
      setMsg("❌ Try again!");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Word {wordIdx + 1}/{words.length} | Score: {score}</p>
      <p className="text-3xl font-bold text-primary tracking-widest mb-6">{scrambled}</p>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && check()}
        className="w-48 text-center text-xl p-3 rounded-xl bg-card border border-border text-foreground" placeholder="Your answer" />
      <button onClick={check} className="mt-4 px-6 py-2 rounded-lg gradient-hero text-primary-foreground font-medium">Check</button>
      {msg && <p className="mt-2 font-medium">{msg}</p>}
    </div>
  );
};

// Color Match
const GameColorMatch = ({ onWin }: { onWin: () => void }) => {
  const colors = [
    { name: "RED", hex: "hsl(0 84% 60%)" }, { name: "BLUE", hex: "hsl(217 91% 60%)" },
    { name: "GREEN", hex: "hsl(142 71% 45%)" }, { name: "YELLOW", hex: "hsl(38 92% 50%)" },
    { name: "PURPLE", hex: "hsl(263 70% 50%)" }, { name: "ORANGE", hex: "hsl(25 95% 53%)" },
  ];
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [textColor, setTextColor] = useState(colors[0]);
  const [displayName, setDisplayName] = useState(colors[1]);
  const [options, setOptions] = useState<typeof colors>([]);

  const newRound = useCallback(() => {
    const tc = colors[Math.floor(Math.random() * colors.length)];
    let dn;
    do { dn = colors[Math.floor(Math.random() * colors.length)]; } while (dn.name === tc.name);
    const opts = [tc, ...colors.filter(c => c.name !== tc.name).sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
    setTextColor(tc);
    setDisplayName(dn);
    setOptions(opts);
  }, []);

  useEffect(() => { newRound(); }, [newRound]);

  const handlePick = (color: typeof colors[0]) => {
    if (color.name === textColor.name) {
      setScore(s => s + 1);
      if (round >= 9) { onWin(); return; }
    }
    setRound(r => r + 1);
    newRound();
  };

  if (round >= 10) return (
    <div className="text-center">
      <p className="text-2xl font-bold text-foreground">{score}/10 correct!</p>
      <button onClick={() => { setScore(0); setRound(0); newRound(); }} className="mt-4 px-4 py-2 rounded-lg gradient-hero text-primary-foreground">Play Again</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Round {round + 1}/10 | Score: {score}</p>
      <p className="text-sm text-muted-foreground mb-2">What COLOR is this text displayed in?</p>
      <p className="text-5xl font-bold mb-6" style={{ color: textColor.hex }}>{displayName.name}</p>
      <div className="flex gap-3">
        {options.map(c => (
          <button key={c.name} onClick={() => handlePick(c)} className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-medium hover:shadow-card transition">{c.name}</button>
        ))}
      </div>
    </div>
  );
};

// Pattern Memory
const GamePatternMemory = ({ onWin }: { onWin: () => void }) => {
  const colors = ["bg-destructive", "bg-primary", "bg-accent", "bg-goal-it"];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [showingIdx, setShowingIdx] = useState(-1);
  const [gamePhase, setGamePhase] = useState<"watch" | "play" | "gameover">("watch");
  const [level, setLevel] = useState(1);

  const startLevel = useCallback((lvl: number) => {
    const seq = Array(lvl + 2).fill(0).map(() => Math.floor(Math.random() * 4));
    setSequence(seq);
    setPlayerSeq([]);
    setGamePhase("watch");
    seq.forEach((_, i) => {
      setTimeout(() => setShowingIdx(i), i * 600);
      setTimeout(() => setShowingIdx(-1), i * 600 + 400);
    });
    setTimeout(() => { setShowingIdx(-1); setGamePhase("play"); }, seq.length * 600 + 200);
  }, []);

  useEffect(() => { startLevel(1); }, [startLevel]);

  const handleClick = (idx: number) => {
    if (gamePhase !== "play") return;
    const newSeq = [...playerSeq, idx];
    setPlayerSeq(newSeq);
    if (idx !== sequence[newSeq.length - 1]) { setGamePhase("gameover"); return; }
    if (newSeq.length === sequence.length) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      if (nextLevel > 5) { onWin(); }
      setTimeout(() => startLevel(nextLevel), 800);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Level: {level} | {gamePhase === "watch" ? "Watch the pattern..." : gamePhase === "play" ? "Your turn!" : "Game Over!"}</p>
      <div className="grid grid-cols-2 gap-3">
        {colors.map((color, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className={`w-24 h-24 rounded-xl transition-all ${color} ${showingIdx >= 0 && sequence[showingIdx] === i ? "opacity-100 scale-110" : "opacity-50"} ${gamePhase === "play" ? "cursor-pointer hover:opacity-80" : "cursor-default"}`} />
        ))}
      </div>
      {gamePhase === "gameover" && <button onClick={() => { setLevel(1); startLevel(1); }} className="mt-4 text-sm text-primary font-medium">Try Again</button>}
    </div>
  );
};

// Typing Speed
const GameTypingSpeed = ({ onWin }: { onWin: () => void }) => {
  const wordList = ["education", "computer", "science", "history", "language", "mathematics", "geography", "biology", "chemistry", "physics", "technology", "knowledge", "practice", "learning", "student"];
  const [words, setWords] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => { setWords(wordList.sort(() => Math.random() - 0.5).slice(0, 10)); }, []);
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft]);
  useEffect(() => { if (timeLeft === 0 && score >= 5) onWin(); }, [timeLeft, score, onWin]);

  const handleInput = (v: string) => {
    if (!started) setStarted(true);
    setInput(v);
    if (v.trim().toLowerCase() === words[current]?.toLowerCase()) {
      setScore(s => s + 1);
      setCurrent(c => c + 1);
      setInput("");
    }
  };

  if (timeLeft <= 0 || current >= words.length) return (
    <div className="text-center">
      <p className="text-2xl font-bold text-foreground">{score} words typed!</p>
      <button onClick={() => { setTimeLeft(30); setScore(0); setCurrent(0); setStarted(false); setWords(wordList.sort(() => Math.random() - 0.5).slice(0, 10)); }} className="mt-4 px-4 py-2 rounded-lg gradient-hero text-primary-foreground">Play Again</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Time: {timeLeft}s | Words: {score}</p>
      <p className="text-3xl font-bold text-primary mb-6">{words[current]}</p>
      <input value={input} onChange={e => handleInput(e.target.value)} className="w-64 text-center text-xl p-3 rounded-xl bg-card border border-border text-foreground" autoFocus placeholder="Type the word..." />
    </div>
  );
};

// Number Guess
const GameNumberGuess = ({ onWin }: { onWin: () => void }) => {
  const [target] = useState(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [hint, setHint] = useState("Guess a number between 1 and 100!");
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);

  const handleGuess = () => {
    const g = parseInt(guess);
    if (isNaN(g)) return;
    setAttempts(a => a + 1);
    if (g === target) { setHint("🎉 Correct!"); setWon(true); onWin(); }
    else if (g < target) setHint("📈 Higher! Try a bigger number.");
    else setHint("📉 Lower! Try a smaller number.");
    setGuess("");
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Attempts: {attempts}</p>
      <p className="text-lg text-foreground mb-4">{hint}</p>
      {!won && (
        <>
          <input type="number" value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === "Enter" && handleGuess()}
            className="w-32 text-center text-2xl p-3 rounded-xl bg-card border border-border text-foreground" />
          <button onClick={handleGuess} className="mt-4 px-6 py-2 rounded-lg gradient-hero text-primary-foreground font-medium">Guess</button>
        </>
      )}
    </div>
  );
};

// Reaction Time
const GameReaction = ({ onWin }: { onWin: () => void }) => {
  const [phase, setPhase] = useState<"wait" | "ready" | "go" | "result">("wait");
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  const start = () => {
    setPhase("ready");
    const delay = 1000 + Math.random() * 3000;
    setTimeout(() => { setPhase("go"); setStartTime(Date.now()); }, delay);
  };

  const handleClick = () => {
    if (phase === "go") {
      const rt = Date.now() - startTime;
      setReactionTime(rt);
      setScores(s => [...s, rt]);
      setPhase("result");
      if (scores.length >= 2) onWin();
    } else if (phase === "ready") {
      setPhase("wait");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button onClick={phase === "wait" || phase === "result" ? start : handleClick}
        className={`w-64 h-64 rounded-2xl text-xl font-bold transition-all flex items-center justify-center ${phase === "ready" ? "bg-destructive text-primary-foreground" : phase === "go" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
        {phase === "wait" ? "Click to Start" : phase === "ready" ? "Wait..." : phase === "go" ? "CLICK NOW!" : `${reactionTime}ms`}
      </button>
      {phase === "result" && <button onClick={start} className="mt-4 text-sm text-primary font-medium">Try Again</button>}
      {scores.length > 0 && <p className="text-sm text-muted-foreground mt-2">Avg: {Math.round(scores.reduce((a, b) => a + b) / scores.length)}ms</p>}
    </div>
  );
};

// Sudoku (4x4 simplified)
const GameSudoku = ({ onWin }: { onWin: () => void }) => {
  const solution = [[1,2,3,4],[3,4,1,2],[2,3,4,1],[4,1,2,3]];
  const puzzle = solution.map(r => r.map(v => Math.random() > 0.5 ? v : 0));
  const [board, setBoard] = useState(puzzle);
  const [locked] = useState(puzzle.map(r => r.map(v => v !== 0)));

  const handleChange = (r: number, c: number, val: string) => {
    if (locked[r][c]) return;
    const v = parseInt(val);
    const b = board.map(r => [...r]);
    b[r][c] = isNaN(v) || v < 1 || v > 4 ? 0 : v;
    setBoard(b);
    if (b.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]))) onWin();
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Fill numbers 1-4 (no repeats in rows/columns)</p>
      <div className="grid grid-cols-4 gap-1 bg-muted p-2 rounded-xl">
        {board.flat().map((v, i) => {
          const r = Math.floor(i / 4), c = i % 4;
          return (
            <input key={i} value={v || ""} onChange={e => handleChange(r, c, e.target.value)} maxLength={1}
              className={`w-14 h-14 text-center text-xl font-bold rounded-lg border border-border ${locked[r][c] ? "bg-muted text-foreground" : "bg-card text-primary"}`}
              readOnly={locked[r][c]} />
          );
        })}
      </div>
    </div>
  );
};

// Quiz Rush
const GameQuizRush = ({ onWin }: { onWin: () => void }) => {
  const questions = [
    { q: "Capital of India?", a: "New Delhi", opts: ["Mumbai", "New Delhi", "Kolkata", "Chennai"] },
    { q: "H2O is?", a: "Water", opts: ["Salt", "Water", "Acid", "Gas"] },
    { q: "Largest planet?", a: "Jupiter", opts: ["Mars", "Saturn", "Jupiter", "Venus"] },
    { q: "Who invented telephone?", a: "Alexander Graham Bell", opts: ["Edison", "Tesla", "Alexander Graham Bell", "Newton"] },
    { q: "How many states in India?", a: "28", opts: ["28", "29", "30", "27"] },
    { q: "Speed of light (km/s)?", a: "300000", opts: ["150000", "300000", "450000", "600000"] },
    { q: "Smallest bone in body?", a: "Stapes", opts: ["Femur", "Stapes", "Radius", "Tibia"] },
    { q: "Chemical symbol for Gold?", a: "Au", opts: ["Go", "Gd", "Au", "Ag"] },
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  useEffect(() => { if ((timeLeft === 0 || idx >= questions.length) && score >= 4) onWin(); }, [timeLeft, idx, score, onWin]);

  const handleAnswer = (a: string) => {
    if (a === questions[idx].a) setScore(s => s + 1);
    setIdx(i => i + 1);
  };

  if (timeLeft <= 0 || idx >= questions.length) return (
    <div className="text-center">
      <p className="text-2xl font-bold text-foreground">{score}/{Math.min(idx, questions.length)} correct!</p>
      <button onClick={() => { setIdx(0); setScore(0); setTimeLeft(60); }} className="mt-4 px-4 py-2 rounded-lg gradient-hero text-primary-foreground">Play Again</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Time: {timeLeft}s | Score: {score} | Q{idx + 1}/{questions.length}</p>
      <p className="text-xl font-bold text-foreground mb-6">{questions[idx].q}</p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {questions[idx].opts.map(opt => (
          <button key={opt} onClick={() => handleAnswer(opt)} className="p-3 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-primary/10 transition">{opt}</button>
        ))}
      </div>
    </div>
  );
};

// Whack-a-Mole
const GameWhackAMole = ({ onWin }: { onWin: () => void }) => {
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft]);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setMoles(prev => {
        const next = Array(9).fill(false);
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) next[Math.floor(Math.random() * 9)] = true;
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [started, timeLeft]);

  useEffect(() => { if (timeLeft === 0 && score >= 10) onWin(); }, [timeLeft, score, onWin]);

  const whack = (i: number) => {
    if (!started) setStarted(true);
    if (moles[i]) {
      setScore(s => s + 1);
      setMoles(m => { const n = [...m]; n[i] = false; return n; });
    }
  };

  if (timeLeft <= 0) return (
    <div className="text-center">
      <p className="text-2xl font-bold text-foreground">Score: {score}!</p>
      <button onClick={() => { setScore(0); setTimeLeft(20); setStarted(false); setMoles(Array(9).fill(false)); }} className="mt-4 px-4 py-2 rounded-lg gradient-hero text-primary-foreground">Play Again</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Time: {timeLeft}s | Score: {score} {!started && "| Tap to start!"}</p>
      <div className="grid grid-cols-3 gap-3">
        {moles.map((active, i) => (
          <button key={i} onClick={() => whack(i)}
            className={`w-20 h-20 rounded-xl text-3xl flex items-center justify-center transition-all ${active ? "bg-accent scale-110" : "bg-muted"}`}>
            {active ? "🐹" : "🕳️"}
          </button>
        ))}
      </div>
    </div>
  );
};

// Simon Says
const GameSimon = ({ onWin }: { onWin: () => void }) => {
  const colors = ["bg-destructive", "bg-primary", "bg-accent", "bg-goal-it"];
  const labels = ["🔴", "🟢", "🟡", "🟣"];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<"watch" | "play" | "over">("watch");
  const [showIdx, setShowIdx] = useState(-1);
  const [level, setLevel] = useState(0);

  const addToSequence = useCallback(() => {
    const newSeq = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(newSeq);
    setPlayerSeq([]);
    setPhase("watch");
    newSeq.forEach((_, i) => {
      setTimeout(() => setShowIdx(i), i * 500);
      setTimeout(() => setShowIdx(-1), i * 500 + 350);
    });
    setTimeout(() => { setShowIdx(-1); setPhase("play"); }, newSeq.length * 500 + 200);
  }, [sequence]);

  useEffect(() => { addToSequence(); }, []);

  const handleClick = (idx: number) => {
    if (phase !== "play") return;
    const newP = [...playerSeq, idx];
    setPlayerSeq(newP);
    if (idx !== sequence[newP.length - 1]) { setPhase("over"); return; }
    if (newP.length === sequence.length) {
      setLevel(l => l + 1);
      if (level >= 4) { onWin(); }
      setTimeout(() => addToSequence(), 800);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground mb-4">Level: {level + 1} | {phase === "watch" ? "Watch..." : phase === "play" ? "Your turn!" : "Game Over!"}</p>
      <div className="grid grid-cols-2 gap-3">
        {colors.map((color, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className={`w-24 h-24 rounded-xl text-3xl transition-all ${color} ${showIdx >= 0 && sequence[showIdx] === i ? "opacity-100 scale-110 ring-4 ring-foreground" : "opacity-40"}`}>
            {labels[i]}
          </button>
        ))}
      </div>
      {phase === "over" && <button onClick={() => { setSequence([]); setLevel(0); setTimeout(() => { setSequence([]); setPlayerSeq([]); const s = [Math.floor(Math.random() * 4)]; setSequence(s); setPhase("watch"); s.forEach((_, i) => { setTimeout(() => setShowIdx(i), i * 500); setTimeout(() => setShowIdx(-1), i * 500 + 350); }); setTimeout(() => { setShowIdx(-1); setPhase("play"); }, s.length * 500 + 200); }, 100); }} className="mt-4 text-sm text-primary font-medium">Try Again</button>}
    </div>
  );
};
