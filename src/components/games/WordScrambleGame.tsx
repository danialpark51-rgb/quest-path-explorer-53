import { useState, useMemo } from "react";

const wordList = [
  { word: "ALGORITHM", hint: "Step-by-step problem solving method" },
  { word: "MOLECULE", hint: "Smallest unit of a chemical compound" },
  { word: "DEMOCRACY", hint: "Government by the people" },
  { word: "PHOTOSYNTHESIS", hint: "Plants making food from sunlight" },
  { word: "GRAVITY", hint: "Force that pulls objects toward Earth" },
  { word: "HYPOTHESIS", hint: "An educated guess in science" },
  { word: "CONTINENT", hint: "Large landmass on Earth" },
  { word: "EVOLUTION", hint: "Gradual change in species over time" },
  { word: "EQUATION", hint: "Mathematical statement of equality" },
  { word: "PARLIAMENT", hint: "Legislative body of government" },
  { word: "VELOCITY", hint: "Speed in a given direction" },
  { word: "CHROMOSOME", hint: "DNA structure carrying genetic info" },
  { word: "REVOLUTION", hint: "A complete overthrow or orbital turn" },
  { word: "ECOSYSTEM", hint: "Community of living organisms" },
  { word: "FREQUENCY", hint: "How often something occurs" },
];

const scramble = (word: string) => word.split("").sort(() => Math.random() - 0.5).join("");

const WordScrambleGame = () => {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const current = wordList[idx % wordList.length];
  const scrambled = useMemo(() => scramble(current.word), [idx]);

  const check = () => {
    if (input.trim().toUpperCase() === current.word) {
      setScore(s => s + (showHint ? 5 : 10));
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
    setTimeout(() => {
      setFeedback(null);
      setInput("");
      setShowHint(false);
      setIdx(i => i + 1);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">🔤 Word Scramble</h2>
          <p className="text-sm text-muted-foreground">Score: {score} | Word {(idx % wordList.length) + 1}/{wordList.length}</p>
        </div>
        <button onClick={() => { setIdx(0); setScore(0); setInput(""); setShowHint(false); setFeedback(null); }}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">Reset</button>
      </div>

      <div className={`rounded-2xl border border-border bg-card p-6 shadow-card text-center transition ${feedback === "correct" ? "bg-primary/10" : feedback === "wrong" ? "bg-destructive/10" : ""}`}>
        <p className="text-3xl font-bold tracking-[0.3em] text-foreground mb-4">{scrambled}</p>
        {feedback && <p className={`text-lg font-bold mb-2 ${feedback === "correct" ? "text-primary" : "text-destructive"}`}>
          {feedback === "correct" ? "✅ Correct!" : `❌ It was: ${current.word}`}
        </p>}
        {showHint && !feedback && <p className="text-sm text-muted-foreground mb-3">💡 {current.hint}</p>}
      </div>

      {!feedback && (
        <>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && check()}
              placeholder="Type your answer..." className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground" />
            <button onClick={check} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Check</button>
          </div>
          <button onClick={() => setShowHint(true)} className="text-sm text-primary hover:underline">Need a hint?</button>
        </>
      )}
    </div>
  );
};

export default WordScrambleGame;
