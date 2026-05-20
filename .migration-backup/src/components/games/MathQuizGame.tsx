import { useState, useCallback } from "react";

type Problem = { question: string; answer: number; options: number[] };

const generate = (): Problem => {
  const ops = ["+", "-", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  switch (op) {
    case "+": a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * 50) + 10; answer = a + b; break;
    case "-": a = Math.floor(Math.random() * 50) + 30; b = Math.floor(Math.random() * 30) + 1; answer = a - b; break;
    case "×": a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; answer = a * b; break;
    default: b = Math.floor(Math.random() * 10) + 2; answer = Math.floor(Math.random() * 10) + 2; a = b * answer; break;
  }

  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const off = Math.floor(Math.random() * 20) - 10;
    if (answer + off > 0 && off !== 0) opts.add(answer + off);
  }

  return { question: `${a} ${op} ${b} = ?`, answer, options: [...opts].sort(() => Math.random() - 0.5) };
};

const MathQuizGame = () => {
  const [problem, setProblem] = useState<Problem>(generate);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ selected: number; correct: boolean } | null>(null);

  const handleAnswer = useCallback((selected: number) => {
    const correct = selected === problem.answer;
    setFeedback({ selected, correct });
    setTotal(t => t + 1);
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); }
    else setStreak(0);
    setTimeout(() => { setFeedback(null); setProblem(generate()); }, 1000);
  }, [problem]);

  const reset = () => { setProblem(generate()); setScore(0); setTotal(0); setStreak(0); setFeedback(null); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">🧮 Math Quiz</h2>
          <p className="text-sm text-muted-foreground">Score: {score}/{total} | Streak: {streak}🔥</p>
        </div>
        <button onClick={reset} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">Reset</button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-card text-center">
        <p className="text-4xl font-bold text-foreground">{problem.question}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {problem.options.map(opt => {
          let cls = "bg-card border-border text-foreground hover:bg-primary/10";
          if (feedback) {
            if (opt === problem.answer) cls = "bg-primary/20 border-primary text-primary";
            else if (opt === feedback.selected && !feedback.correct) cls = "bg-destructive/20 border-destructive text-destructive";
          }
          return (
            <button key={opt} onClick={() => !feedback && handleAnswer(opt)} disabled={!!feedback}
              className={`p-4 rounded-xl border text-xl font-bold transition ${cls}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MathQuizGame;
