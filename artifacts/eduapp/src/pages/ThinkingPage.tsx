import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ArrowLeft, Search, Sparkles, AlertCircle,
  RotateCcw, Zap, Star, Trophy, CheckCircle2,
  Play, Pause, Square, Volume2, ChevronDown,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ReactMarkdown from "react-markdown";
import { useUser } from "@/context/UserContext";

// ─── Language config ─────────────────────────────────────────────────────────

type Language = {
  code: string;    // BCP-47 for Web Speech API
  label: string;   // Display name (native script)
  english: string; // English name sent to AI
  flag: string;
};

const LANGUAGES: Language[] = [
  { code: "en-IN",  label: "English",    english: "English",    flag: "🇬🇧" },
  { code: "hi-IN",  label: "हिंदी",       english: "Hindi",      flag: "🇮🇳" },
  { code: "kn-IN",  label: "ಕನ್ನಡ",       english: "Kannada",    flag: "🇮🇳" },
  { code: "ta-IN",  label: "தமிழ்",       english: "Tamil",      flag: "🇮🇳" },
  { code: "te-IN",  label: "తెలుగు",      english: "Telugu",     flag: "🇮🇳" },
  { code: "mr-IN",  label: "मराठी",       english: "Marathi",    flag: "🇮🇳" },
  { code: "bn-IN",  label: "বাংলা",       english: "Bengali",    flag: "🇮🇳" },
  { code: "gu-IN",  label: "ગુજરાતી",     english: "Gujarati",   flag: "🇮🇳" },
  { code: "pa-IN",  label: "ਪੰਜਾਬੀ",     english: "Punjabi",    flag: "🇮🇳" },
  { code: "ml-IN",  label: "മലയാളം",     english: "Malayalam",  flag: "🇮🇳" },
];

// ─── Thinker suggestions ─────────────────────────────────────────────────────

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

// ─── Types ───────────────────────────────────────────────────────────────────

type AnalysisResult = {
  personName: string;
  analysis: string;
  language: Language;
  xpEarned: number;
};

type PlayState = "stopped" | "playing" | "paused";

// ─── Strip markdown for TTS ──────────────────────────────────────────────────

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/[🧠💡🔬🌍⚡🚀📚🌟✌️🕉️🍎📜🎨🌌]/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Split long text into chunks at sentence boundaries (fixes Chrome Android TTS cutoff bug)
function splitIntoChunks(text: string, maxLen = 220): string[] {
  const sentences = text.match(/[^.!?।\n]+[.!?।\n]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen) {
      if (current.trim()) chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// ─── XP Toast ────────────────────────────────────────────────────────────────

const XPToast = ({ xp, onDone }: { xp: number; onDone: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    transition={{ type: "spring", damping: 18, stiffness: 260 }}
    onAnimationComplete={() => setTimeout(onDone, 2200)}
    className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-yellow-400 text-yellow-900 font-bold text-sm px-5 py-3 rounded-full shadow-lg pointer-events-none"
  >
    <Zap className="w-4 h-4" />
    +{xp} XP earned! 🎉
  </motion.div>
);

// ─── TTS Player bar (sticky above BottomNav) ─────────────────────────────────

type PlayerBarProps = {
  playState: PlayState;
  personName: string;
  language: Language;
  rate: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRateChange: (r: number) => void;
};

const RATES = [0.8, 1.0, 1.2, 1.5, 1.8];

const PlayerBar = ({ playState, personName, language, rate, onPlay, onPause, onStop, onRateChange }: PlayerBarProps) => (
  <motion.div
    initial={{ y: 80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 80, opacity: 0 }}
    transition={{ type: "spring", damping: 22, stiffness: 300 }}
    className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2"
  >
    <div className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
      {/* Animated wave icon */}
      <div className="flex items-end gap-0.5 h-6 flex-shrink-0">
        {[1, 2, 3, 2, 1].map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full bg-purple-400 ${playState === "playing" ? "animate-bounce" : ""}`}
            style={{
              height: `${h * 5}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{personName}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Volume2 className="w-3 h-3" />
          {language.flag} {language.label}
          {playState === "paused" && <span className="text-yellow-400 ml-1">• Paused</span>}
          {playState === "playing" && <span className="text-green-400 ml-1">• Reading…</span>}
        </p>
      </div>

      {/* Speed selector */}
      <div className="relative flex-shrink-0">
        <select
          value={rate}
          onChange={(e) => onRateChange(Number(e.target.value))}
          className="appearance-none bg-slate-800 text-xs text-slate-300 rounded-lg pl-2 pr-5 py-1.5 border border-slate-700 outline-none cursor-pointer"
        >
          {RATES.map((r) => (
            <option key={r} value={r}>{r}×</option>
          ))}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {playState === "playing" ? (
          <button
            onClick={onPause}
            className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition"
          >
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition"
          >
            <Play className="w-4 h-4 ml-0.5" />
          </button>
        )}
        <button
          onClick={onStop}
          className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ThinkingPage = () => {
  const navigate = useNavigate();
  const { user, analyzeThinker } = useUser();

  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<AnalysisResult | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [showXPToast, setShowXPToast] = useState(false);

  // Language selection
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // TTS state
  const [playState, setPlayState]   = useState<PlayState>("stopped");
  const [ttsRate, setTtsRate]       = useState(1.0);
  const chunksRef   = useRef<string[]>([]);
  const chunkIdxRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const inputRef  = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const totalAnalyzed = user?.analyzedThinkers?.length ?? 0;

  // Stop TTS cleanly when unmounting or result changes
  const stopTTS = useCallback(() => {
    window.speechSynthesis?.cancel();
    setPlayState("stopped");
    chunksRef.current = [];
    chunkIdxRef.current = 0;
    utteranceRef.current = null;
  }, []);

  useEffect(() => { return () => stopTTS(); }, [stopTTS]);
  useEffect(() => { stopTTS(); }, [result, stopTTS]);

  // ── TTS: speak next chunk ──
  const speakChunk = useCallback((idx: number, lang: string, rate: number) => {
    const chunks = chunksRef.current;
    if (idx >= chunks.length) {
      setPlayState("stopped");
      return;
    }
    const utt = new SpeechSynthesisUtterance(chunks[idx]);
    utt.lang  = lang;
    utt.rate  = rate;
    utt.onend = () => {
      chunkIdxRef.current = idx + 1;
      speakChunk(idx + 1, lang, rate);
    };
    utt.onerror = (e) => {
      if (e.error !== "interrupted") setPlayState("stopped");
    };
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  // ── TTS: Play ──
  const handlePlay = useCallback(() => {
    if (!result) return;
    if (playState === "paused") {
      window.speechSynthesis.resume();
      setPlayState("playing");
      return;
    }
    // Fresh start
    window.speechSynthesis.cancel();
    const plain = stripMarkdown(result.analysis);
    chunksRef.current  = splitIntoChunks(plain);
    chunkIdxRef.current = 0;
    setPlayState("playing");
    // Slight delay so cancel() fully clears the queue first
    setTimeout(() => speakChunk(0, result.language.code, ttsRate), 80);
  }, [result, playState, ttsRate, speakChunk]);

  // ── TTS: Pause ──
  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setPlayState("paused");
  }, []);

  // ── TTS: Stop ──
  const handleStop = useCallback(() => { stopTTS(); }, [stopTTS]);

  // ── TTS: Rate change ──
  const handleRateChange = useCallback((r: number) => {
    setTtsRate(r);
    if (playState === "playing" && result) {
      window.speechSynthesis.cancel();
      const idx = chunkIdxRef.current;
      setPlayState("playing");
      setTimeout(() => speakChunk(idx, result.language.code, r), 80);
    }
  }, [playState, result, speakChunk]);

  // ─── Analyze ─────────────────────────────────────────────────────────────

  const analyze = async (personName: string, lang: Language = selectedLang) => {
    if (!personName.trim() || loading) return;
    stopTTS();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personName: personName.trim(), language: lang.english }),
      });

      const data = await res.json() as {
        analysis?: string; error?: string; personName?: string; language?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        const xpEarned = analyzeThinker(data.personName ?? personName);
        setResult({
          personName: data.personName ?? personName,
          analysis:   data.analysis ?? "",
          language:   lang,
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

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); analyze(query); };

  const handleSuggestion = (name: string) => { setQuery(name); analyze(name); };

  const handleReset = () => {
    stopTTS();
    setResult(null);
    setError(null);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const badge =
    totalAnalyzed >= 10 ? { label: "Master Thinker", emoji: "🏆", color: "text-yellow-600 bg-yellow-50 border-yellow-200" } :
    totalAnalyzed >= 5  ? { label: "Deep Thinker",   emoji: "🥈", color: "text-slate-600 bg-slate-50 border-slate-200" } :
    totalAnalyzed >= 1  ? { label: "Explorer",        emoji: "🥉", color: "text-orange-600 bg-orange-50 border-orange-200" } :
    null;

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── Header ── */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-12 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-400/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">Thinking</h1>
                <p className="text-sm text-primary-foreground/70">Explore how great minds think</p>
              </div>
            </div>
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

          {/* ── Language selector ── */}
          <div className="mb-3 relative">
            <p className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wide">Generate & Listen in your language</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang)}
                  className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                    selectedLang.code === lang.code
                      ? "bg-purple-500 border-purple-400 text-white"
                      : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Search input ── */}
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
              className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl transition text-sm flex-shrink-0"
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
              <span className="text-xs text-muted-foreground">{totalAnalyzed}/10 · {totalAnalyzed * 25} XP earned</span>
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
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                Earn <span className="font-bold text-yellow-600">+25 XP</span> for every new thinker you explore!
              </p>
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
                <p className="font-display font-bold text-foreground">
                  Generating in {selectedLang.label}…
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Researching {query}'s mindset, philosophy & problem-solving style
                </p>
              </div>
              <div className="flex gap-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
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
                <button onClick={handleReset}
                  className="mt-3 flex items-center gap-1.5 text-sm text-red-600 font-medium hover:text-red-700 transition">
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
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white font-display font-bold text-xl">
                      {result.personName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-foreground text-lg">{result.personName}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {result.language.flag} {result.language.label} analysis
                      </p>
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
                    <button onClick={handleReset}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition bg-white">
                      <RotateCcw className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>

                {/* Listen button (when stopped) */}
                {playState === "stopped" && (
                  <button
                    onClick={handlePlay}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition text-sm"
                  >
                    <Volume2 className="w-4 h-4" />
                    🔊 Listen in {result.language.label}
                  </button>
                )}
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

        {/* ── Intro feature cards ── */}
        {!result && !loading && !error && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { emoji: "🧠", title: "Thinking Patterns",  desc: "Discover how great minds approach problems" },
              { emoji: "🔊", title: "Listen in your language",  desc: "Hear the analysis read aloud in Hindi, Tamil & more" },
              { emoji: "🌍", title: "10 Languages",        desc: "Generate results in English or any Indian language" },
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

      {/* ── TTS Player bar ── */}
      <AnimatePresence>
        {result && playState !== "stopped" && (
          <PlayerBar
            playState={playState}
            personName={result.personName}
            language={result.language}
            rate={ttsRate}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onRateChange={handleRateChange}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default ThinkingPage;
