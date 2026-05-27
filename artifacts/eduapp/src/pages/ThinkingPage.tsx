import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, Search, Sparkles, AlertCircle, RotateCcw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ReactMarkdown from "react-markdown";

// Famous people suggestions for quick access
const SUGGESTIONS = [
  { name: "Nikola Tesla",         emoji: "⚡" },
  { name: "A. P. J. Abdul Kalam", emoji: "🚀" },
  { name: "Albert Einstein",      emoji: "🧠" },
  { name: "Marie Curie",          emoji: "🔬" },
  { name: "Leonardo da Vinci",    emoji: "🎨" },
  { name: "Elon Musk",            emoji: "🌟" },
  { name: "Stephen Hawking",      emoji: "🌌" },
  { name: "Chanakya",             emoji: "📜" },
  { name: "Swami Vivekananda",    emoji: "🕉️" },
  { name: "Isaac Newton",         emoji: "🍎" },
  { name: "Thomas Edison",        emoji: "💡" },
  { name: "Mahatma Gandhi",       emoji: "✌️" },
];

type AnalysisResult = {
  personName: string;
  analysis: string;
};

const ThinkingPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
        setResult({ personName: data.personName ?? personName, analysis: data.analysis ?? "" });
        // Scroll to result after a brief delay for animation
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-400/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Thinking</h1>
              <p className="text-sm text-primary-foreground/70">Explore how great minds think</p>
            </div>
          </div>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
        {/* Quick suggestions */}
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
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => handleSuggestion(s.name)}
                    className="flex items-center gap-1.5 text-sm bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 px-3 py-1.5 rounded-full transition"
                  >
                    <span>{s.emoji}</span>
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
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

        {/* Error state */}
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

        {/* Result */}
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
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition"
                  >
                    <RotateCcw className="w-3 h-3" /> New
                  </button>
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

              {/* Analyze another */}
              <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
                <p className="text-sm font-semibold text-foreground mb-3">Explore another great mind</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.filter((s) => s.name !== result.personName).slice(0, 6).map((s) => (
                    <button
                      key={s.name}
                      onClick={() => handleSuggestion(s.name)}
                      className="flex items-center gap-1.5 text-sm bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 px-3 py-1.5 rounded-full transition"
                    >
                      <span>{s.emoji}</span>
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intro card — shown only before first search */}
        {!result && !loading && !error && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { emoji: "🧠", title: "Thinking Patterns", desc: "Discover how great minds approach problems" },
              { emoji: "💡", title: "Problem Solving", desc: "Learn their unique strategies & methods" },
              { emoji: "🌍", title: "Philosophy", desc: "Understand their worldview & values" },
              { emoji: "📚", title: "Student Lessons", desc: "Apply their wisdom to your own learning" },
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

      <BottomNav />
    </div>
  );
};

export default ThinkingPage;
