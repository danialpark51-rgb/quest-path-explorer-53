import { useState, useCallback } from "react";

const WORDS = ["BRAIN","DREAM","LIGHT","EARTH","STONE","PLANT","FLAME","OCEAN","STORM","CLOUD","MUSIC","PEACE","POWER","SOLAR","NERVE","ORBIT","LASER","FOCUS","QUEST","TOWER"];

const WordleGame = () => {
  const [target] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const won = guesses.includes(target);

  const submit = useCallback(() => {
    if (current.length !== 5 || gameOver) return;
    const upper = current.toUpperCase();
    const next = [...guesses, upper];
    setGuesses(next);
    setCurrent("");
    if (upper === target || next.length >= 6) setGameOver(true);
  }, [current, guesses, gameOver, target]);

  const getColor = (letter: string, idx: number, guess: string) => {
    if (target[idx] === letter) return "bg-primary text-primary-foreground";
    if (target.includes(letter)) return "bg-accent text-accent-foreground";
    return "bg-muted text-muted-foreground";
  };

  const reset = () => {
    window.location.reload();
  };

  const keyboard = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  const usedLetters = new Map<string, string>();
  for (const guess of guesses) {
    for (let i = 0; i < 5; i++) {
      const l = guess[i];
      if (target[i] === l) usedLetters.set(l, "bg-primary text-primary-foreground");
      else if (target.includes(l) && usedLetters.get(l) !== "bg-primary text-primary-foreground") usedLetters.set(l, "bg-accent text-accent-foreground");
      else if (!usedLetters.has(l)) usedLetters.set(l, "bg-muted/60 text-muted-foreground");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">📝 Wordle</h2>
          <p className="text-sm text-muted-foreground">{won ? "🎉 You got it!" : gameOver ? `Answer: ${target}` : `Guess ${guesses.length + 1}/6`}</p>
        </div>
        <button onClick={reset} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">New Word</button>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, ri) => {
          const guess = guesses[ri];
          const isCurrent = ri === guesses.length && !gameOver;
          return (
            <div key={ri} className="flex justify-center gap-2">
              {Array.from({ length: 5 }).map((_, ci) => {
                const letter = guess?.[ci] || (isCurrent ? current[ci] : "") || "";
                const bg = guess ? getColor(guess[ci], ci, guess) : "bg-card border-border";
                return (
                  <div key={ci} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg border text-lg font-bold uppercase transition ${bg}`}>
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {!gameOver && (
        <div className="space-y-1.5">
          {keyboard.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {ri === 2 && <button onClick={submit} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold">↵</button>}
              {row.split("").map(l => (
                <button key={l} onClick={() => current.length < 5 && setCurrent(c => c + l)}
                  className={`w-8 h-10 sm:w-9 sm:h-11 rounded-lg text-xs font-bold transition ${usedLetters.get(l) || "bg-card border border-border text-foreground hover:bg-muted"}`}>
                  {l}
                </button>
              ))}
              {ri === 2 && <button onClick={() => setCurrent(c => c.slice(0, -1))} className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-bold">⌫</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WordleGame;
