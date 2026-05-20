import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzes } from "@/data/quizzes";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, CheckCircle, XCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const levelColors = { Easy: "text-primary", Medium: "text-accent", Hard: "text-destructive" };
const levelBg = { Easy: "bg-primary/10", Medium: "bg-accent/10", Hard: "bg-destructive/10" };

const QuizListPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  const filtered = filter === "All" ? quizzes : quizzes.filter((q) => q.level === filter);
  const levels: ("All" | "Easy" | "Medium" | "Hard")[] = ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">🏆 Quizzes</h1>
        <p className="text-sm text-muted-foreground mb-4">Test your knowledge across subjects and difficulty levels.</p>

        <div className="flex gap-2 mb-5">
          {levels.map((l) => (
            <button key={l} onClick={() => setFilter(l)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              onClick={() => navigate(`/quiz/${q.id}`)}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-card transition"
            >
              <div>
                <h3 className="font-semibold text-foreground">{q.topic}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelBg[q.level]} ${levelColors[q.level]}`}>{q.level}</span>
                  <span className="text-xs text-muted-foreground">{q.questions.length} questions</span>
                </div>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export const QuizPlayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { addXP } = useUser();
  const quiz = quizzes.find((q) => q.id === quizId);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  if (!quiz) return <div className="min-h-screen flex items-center justify-center text-foreground">Quiz not found</div>;

  const question = quiz.questions[currentQ];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correctAnswer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= quiz.questions.length) {
      setFinished(true);
      addXP(score * 10);
    } else {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-2xl p-8 text-center shadow-elevated max-w-sm w-full">
          <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground">Quiz Complete!</h1>
          <p className="text-4xl font-bold text-primary mt-4">{score}/{quiz.questions.length}</p>
          <p className="text-sm text-muted-foreground mt-1">{pct}% correct</p>
          <p className="text-muted-foreground mt-2">You earned {score * 10} XP!</p>
          {pct >= 80 && <p className="text-sm text-primary font-medium mt-2">🌟 Excellent performance!</p>}
          <button onClick={() => navigate("/quiz")} className="mt-6 px-6 py-3 rounded-lg gradient-hero text-primary-foreground font-semibold hover:opacity-90 transition">
            Back to Quizzes
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto pt-4">
        <button onClick={() => navigate("/quiz")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Quizzes
        </button>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-foreground">{quiz.topic}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelBg[quiz.level]} ${levelColors[quiz.level]}`}>{quiz.level}</span>
        </div>
        <span className="text-sm text-muted-foreground">{currentQ + 1}/{quiz.questions.length}</span>

        <div className="w-full h-2 bg-muted rounded-full mb-6 mt-3 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                let cls = "bg-card border border-border";
                if (answered) {
                  if (idx === question.correctAnswer) cls = "bg-primary/10 border-primary";
                  else if (idx === selected) cls = "bg-destructive/10 border-destructive";
                }
                return (
                  <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                    className={`w-full text-left p-4 rounded-xl transition flex items-center gap-3 ${cls}`}>
                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm text-foreground">{opt}</span>
                    {answered && idx === question.correctAnswer && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                    {answered && idx === selected && idx !== question.correctAnswer && <XCircle className="w-5 h-5 text-destructive ml-auto" />}
                  </button>
                );
              })}
            </div>
            {answered && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                className="mt-6 w-full py-3 rounded-lg gradient-hero text-primary-foreground font-semibold hover:opacity-90 transition">
                {currentQ + 1 >= quiz.questions.length ? "See Results" : "Next Question"}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizListPage;
