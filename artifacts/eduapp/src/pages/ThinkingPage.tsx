import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ArrowLeft, Search, Sparkles, AlertCircle,
  RotateCcw, Zap, Star, Trophy, CheckCircle2,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ReactMarkdown from "react-markdown";
import { useUser } from "@/context/UserContext";

const SUGGESTIONS = [
  { name: "Nikola Tesla",          emoji: "⚡" },
  { name: "A. P. J. Abdul Kalam", emoji: "🚀" },
  { name: "Albert Einstein",       emoji: "🧠" },
  { name: "Marie Curie",           emoji: "🔬" },
  { name: "Leonardo da Vinci",     emoji: "🎨" },
  { name: "Elon Musk",             emoji: "🌟" },
  { name: "Stephen Hawking",       emoji: "🌌" },
  { name: "Chanakya",              emoji: "📜" },
  { name: "Swami Vivekananda",     emoji: "🕉️" },
  { name: "Isaac Newton",          emoji: "🍎" },
  { name: "Thomas Edison",         emoji: "💡" },
  { name: "Mahatma Gandhi",        emoji: "✌️" },
];

type AnalysisResult = {
  personName: string;
  analysis: string;
  xpEarned: number;  // 25 for first analysis, 0 if already done
};

// Floating +XP toast shown after a successful new analysis
const XPToast = ({ xp, onDone }: { xp: number; onDone: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    transition={{ type: "spring", damping: 18, stiffness: 260 }}
    onAnimationComplete={() => setTimeout(onDone, 2200)}
    className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-yellow-400 text-yellow-900 font-bold text-sm px-5 py-3 rounded-full shadow-lg"
  >
    <Zap className="w-4 h-4" />
    +{xp} XP earned! 🎉
  </motion.div>
);

const ThinkingPage = () => {
  const navigate = useNavigate();
  const { user, analyzeThinker } = useUser();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showXPToast, setShowXPToast] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const totalAnalyzed = user?.analyzedThinkers?.length ?? 0;

  const analyze = async (personName: string) => {
    if (!personName.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personName: personName.trim() }),
      });

      const data = await res.json() as { analysis?: string; error?: string; personName?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        // Award XP — returns 25 for first time, 0 if already analyzed
        const xpEarned = analyzeThinker(data.personName ?? personName);
        setResult({
          personName: data.personName ?? personName,
          analysis: data.analysis ?? "",
          xpEarned,
        });
        if (xpEarned > 0) setShowXPToast(true);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyze(query);
  };

  const handleSuggestion = (name: string) => {
    setQuery(name);
    analyze(name);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setQuery("");
    inputRef.current?.focus();
  };

  // Badge milestone labels
  const badge =
    totalAnalyzed >= 10 ? { label: "Master Thinker", emoji: "🏆", color: "text-yellow-600 bg-yellow-50 border-yellow-200" } :
    totalAnalyzed >= 5  ? { label: "Deep Thinker",   emoji: "🥈", color: "text-slate-600 bg-slate-50 border-slate-200" } :
    totalAnalyzed >= 1  ? { label: "Explorer",        emoji: "🥉", color: "text-orange-600 bg-orange-50 border-orange-200" } :
    null;

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── Header ── */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-400/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">Thinking</h1>
                <p className="text-sm text-primary-foreground/70">Explore how great minds think</p>
              </div>
            </div>

            {/* XP + count pill */}
            <div className="flex items-center gap-2">
              {badge && (
                <span className={`hidden sm:flex items-center gap-1 text-xs font-semibold border px-2.5 py-1 rounded-full ${badge.color}`}>
                  {badge.emoji} {badge.label}
                </span>
              )}
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-xs font-bold text-white">{totalAnalyzed} analyzed</span>
              </div>
            </div>
          </div>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a famous person's name…"
                maxLength={100}
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm outline-none focus:border-white/50 transition"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl transition text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Analyze
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">

        {/* ── XP Progress bar ── */}
        {totalAnalyzed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-foreground">Thinker Progress</span>
              </div>
              <span className="text-xs text-muted-foreground">{totalAnalyzed}/10 thinkers · {totalAnalyzed * 25} XP earned</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalAnalyzed / 10) * 100, 100)}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              {[{ at: 1, label: "🥉" }, { at: 5, label: "🥈" }, { at: 10, label: "🏆" }].map((m) => (
                <span key={m.at} className={`text-xs ${totalAnalyzed >= m.at ? "opacity-100" : "opacity-30"}`}>
                  {m.label} {m.at}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Quick suggestions ── */}
        <AnimatePresence>
          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-2xl border border-border p-4 shadow-card"
            >
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Quick Select — Famous Thinkers
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => {
                  const done = user?.analyzedThinkers?.includes(s.name.toLowerCase().trim());
                  return (
                    <button
                      key={s.name}
                      onClick={() => handleSuggestion(s.name)}
                      className={`flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-full transition ${
                        done
                          ? "bg-primary/5 border-primary/20 text-primary/70"
                          : "bg-muted hover:bg-primary/10 hover:text-primary border-border hover:border-primary/30"
                      }`}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.name}</span>
                      {done && <CheckCircle2 className="w-3 h-3 text-primary ml-0.5" />}
                    </button>
                  );
                })}
              </div>
              {totalAnalyzed === 0 && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  Earn <span className="font-bold text-yellow-600">+25 XP</span> for every new thinker you explore!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card rounded-2xl border border-border p-8 shadow-card flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-purple-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-300 border-t-transparent animate-spin" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground">Analyzing thinking patterns…</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Researching {query}'s mindset, philosophy, and problem-solving style
                </p>
              </div>
              <div className="flex gap-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 mb-1">Couldn't find that person</p>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 flex items-center gap-1.5 text-sm text-red-600 font-medium hover:text-red-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Try another name
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Result header */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white font-display font-bold text-xl">
                      {result.personName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-foreground text-lg">{result.personName}</h2>
                      <p className="text-sm text-muted-foreground">Deep thinking analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {result.xpEarned > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 border border-yellow-200 px-2.5 py-1 rounded-full">
                        <Zap className="w-3.5 h-3.5" /> +{result.xpEarned} XP
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Already analyzed
                      </span>
                    )}
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition bg-white"
                    >
                      <RotateCcw className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>
              </div>

              {/* Markdown analysis */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
                <div className="prose prose-sm max-w-none
                  prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2 prose-h2:first:mt-0
                  prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-sm
                  prose-li:text-foreground/80 prose-li:text-sm
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:space-y-1 prose-ol:space-y-1
                ">
                  <ReactMarkdown>{result.analysis}</ReactMarkdown>
                </div>
              </div>

              {/* Explore another */}
              <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Explore another great mind</p>
                  <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" /> +25 XP each new thinker
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.filter((s) => s.name !== result.personName).slice(0, 6).map((s) => {
                    const done = user?.analyzedThinkers?.includes(s.name.toLowerCase().trim());
                    return (
                      <button
                        key={s.name}
                        onClick={() => handleSuggestion(s.name)}
                        className={`flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-full transition ${
                          done
                            ? "bg-primary/5 border-primary/20 text-primary/70"
                            : "bg-muted hover:bg-primary/10 hover:text-primary border-border hover:border-primary/30"
                        }`}
                      >
                        <span>{s.emoji}</span>
                        <span>{s.name}</span>
                        {done && <CheckCircle2 className="w-3 h-3 text-primary ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Intro cards (before first search) ── */}
        {!result && !loading && !error && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { emoji: "🧠", title: "Thinking Patterns",  desc: "Discover how great minds approach problems" },
              { emoji: "💡", title: "Problem Solving",     desc: "Learn their unique strategies & methods" },
              { emoji: "🌍", title: "Philosophy",          desc: "Understand their worldview & values" },
              { emoji: "📚", title: "Student Lessons",     desc: "Apply their wisdom to your own learning" },
            ].map((card) => (
              <div key={card.title} className="bg-card rounded-xl border border-border p-4">
                <div className="text-2xl mb-2">{card.emoji}</div>
                <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating +XP toast ── */}
      <AnimatePresence>
        {showXPToast && (
          <XPToast xp={25} onDone={() => setShowXPToast(false)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default ThinkingPage;
