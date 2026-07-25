/**
 * Discover Your Goal — AI Career Goal Discovery Page
 * Students describe their interests/hobbies and AI recommends top 4 career paths.
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ArrowLeft, Sparkles, AlertCircle, RotateCcw,
  ChevronDown, ChevronUp, Star, TrendingUp, BookOpen,
  Target, Zap, BarChart3, DollarSign, Layers,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoalRecommendation {
  goalName: string;
  emoji: string;
  whyItMatches: string;
  requiredSkills: string[];
  futureScope: string;
  learningRoadmap: string[];
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  salaryPotential: string;
  recommendedSubjects: string[];
  matchScore: number;
}

interface PersonalityProfile {
  type: string;
  description: string;
  strengths: string[];
  learningPattern: string;
}

interface ExploreMore {
  goalName: string;
  emoji: string;
  matchPercentage: number;
  description: string;
  requiredSkills: string[];
  futureOpportunities: string[];
}

interface DiscoverResult {
  personalityProfile: PersonalityProfile;
  topRecommendations: GoalRecommendation[];
  exploreMore: ExploreMore[];
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DiffBadge = ({ level }: { level: string }) => {
  const map: Record<string, string> = {
    Beginner:     "bg-green-100 text-green-700 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Advanced:     "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`text-xs font-semibold border px-2.5 py-0.5 rounded-full ${map[level] ?? "bg-muted text-muted-foreground"}`}>
      {level}
    </span>
  );
};

// ─── Match Score Ring ─────────────────────────────────────────────────────────

const MatchRing = ({ score }: { score: number }) => {
  const color = score >= 85 ? "#22c55e" : score >= 70 ? "#f59e0b" : "#6366f1";
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle
          cx="28" cy="28" r="24" fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={`${(score / 100) * 150.8} 150.8`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
        {score}%
      </span>
    </div>
  );
};

// ─── Goal Card ────────────────────────────────────────────────────────────────

const GoalCard = ({ rec, rank }: { rec: GoalRecommendation; rank: number }) => {
  const [expanded, setExpanded] = useState(rank === 0);

  const rankColors = [
    "from-violet-50 to-purple-50 border-violet-200",
    "from-blue-50 to-indigo-50 border-blue-200",
    "from-emerald-50 to-teal-50 border-emerald-200",
    "from-orange-50 to-amber-50 border-orange-200",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
      className={`bg-gradient-to-br ${rankColors[rank] ?? "from-muted to-muted/50 border-border"} border rounded-2xl overflow-hidden`}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center gap-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
          {rec.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {rank === 0 && (
              <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> Best Match
              </span>
            )}
            <DiffBadge level={rec.difficultyLevel} />
          </div>
          <h3 className="font-display font-bold text-foreground text-base mt-0.5">{rec.goalName}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{rec.whyItMatches}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <MatchRing score={rec.matchScore} />
          <button className="text-muted-foreground">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/60 pt-3">

              {/* Why it matches */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Why It Matches You
                </p>
                <p className="text-sm text-foreground/80">{rec.whyItMatches}</p>
              </div>

              {/* Skills + Subjects */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Skills Needed
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.requiredSkills.map((s) => (
                      <span key={s} className="text-xs bg-white/80 border border-white/60 text-foreground px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Subjects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.recommendedSubjects.map((s) => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Salary + Difficulty */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Salary Potential</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{rec.salaryPotential}</p>
                </div>
                <div className="flex-1 bg-white/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Difficulty</p>
                  </div>
                  <DiffBadge level={rec.difficultyLevel} />
                </div>
              </div>

              {/* Future scope */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Future Scope
                </p>
                <p className="text-sm text-foreground/80">{rec.futureScope}</p>
              </div>

              {/* Learning Roadmap */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Learning Roadmap
                </p>
                <div className="space-y-1.5">
                  {rec.learningRoadmap.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-foreground/80">{step.replace(/^Step \d+:\s*/i, "")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const EXAMPLES = [
  "I love drawing, solving maths, watching space documentaries and programming small games.",
  "I enjoy helping people, reading medical articles, and I'm good at biology and chemistry.",
  "I like playing chess, coding websites, reading tech news, and solving logic puzzles.",
  "I love writing stories, debating, watching news, and helping my community.",
];

const DiscoverGoalPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [interests, setInterests] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<DiscoverResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [expandedMore, setExpandedMore] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interests.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/discover-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: interests.trim(),
          classStandard: user?.classStandard ?? "",
          name: user?.fullName ?? "",
        }),
      });
      const data = await res.json() as DiscoverResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data);
        setTimeout(() => window.scrollTo({ top: 400, behavior: "smooth" }), 300);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setInterests("");
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white px-4 pt-6 pb-12 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Discover Your Goal</h1>
              <p className="text-sm text-white/70">AI-powered career path finder</p>
            </div>
          </div>

          {/* Textarea */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-sm text-white/80 font-medium">
              Tell us about yourself — your interests, hobbies, favourite subjects, talents, and dreams:
            </label>
            <textarea
              ref={textareaRef}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder={`e.g. "${EXAMPLES[0]}"`}
              rows={4}
              maxLength={2000}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-white/60 resize-none transition"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">{interests.length}/2000</span>
              <button
                type="submit"
                disabled={interests.trim().length < 20 || loading}
                className="flex items-center gap-2 bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl disabled:opacity-50 hover:bg-violet-50 transition text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Discover My Goals
              </button>
            </div>
          </form>

          {/* Example prompts */}
          {!result && !loading && (
            <div className="mt-4">
              <p className="text-xs text-white/50 mb-2">Try an example:</p>
              <div className="flex flex-col gap-1.5">
                {EXAMPLES.slice(0, 2).map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setInterests(ex)}
                    className="text-left text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition line-clamp-1"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-5">

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card rounded-2xl border border-border p-8 shadow-card flex flex-col items-center gap-4 text-center mt-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
                  <Compass className="w-8 h-8 text-violet-500 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-violet-300 border-t-transparent animate-spin" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground">Analysing your profile…</p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI is mapping your interests to career paths
                </p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3 mt-4"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Something went wrong</p>
                <p className="text-sm text-red-600">{error}</p>
                <button onClick={handleReset} className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1.5 hover:text-red-700 transition">
                  <RotateCcw className="w-3.5 h-3.5" /> Try again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 mt-2"
            >
              {/* Reset button */}
              <div className="flex justify-end">
                <button onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full px-4 py-1.5 bg-card transition">
                  <RotateCcw className="w-3.5 h-3.5" /> Analyse again
                </button>
              </div>

              {/* Personality Profile */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  <h2 className="font-display font-bold text-foreground">Your Personality Profile</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Profile Type</span>
                    <p className="font-bold text-foreground text-lg">{result.personalityProfile.type}</p>
                  </div>
                  <p className="text-sm text-foreground/80">{result.personalityProfile.description}</p>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Strengths</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {result.personalityProfile.strengths.map((s) => (
                        <span key={s} className="text-xs bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full font-medium">
                          ✦ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3">
                    <span className="text-xs font-semibold text-muted-foreground">Learning Pattern: </span>
                    <span className="text-sm text-foreground">{result.personalityProfile.learningPattern}</span>
                  </div>
                </div>
              </motion.div>

              {/* Top 4 Recommendations */}
              <div>
                <h2 className="font-display font-bold text-foreground text-lg mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Top 4 Recommended Goals
                </h2>
                <div className="space-y-3">
                  {result.topRecommendations.slice(0, 4).map((rec, i) => (
                    <GoalCard key={rec.goalName} rec={rec} rank={i} />
                  ))}
                </div>
              </div>

              {/* Explore More */}
              {result.exploreMore && result.exploreMore.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-foreground text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Explore More Goals
                  </h2>
                  <div className="space-y-2">
                    {result.exploreMore.map((item, i) => (
                      <div key={item.goalName} className="bg-card border border-border rounded-2xl overflow-hidden">
                        <button
                          className="w-full flex items-center gap-3 p-4 text-left"
                          onClick={() => setExpandedMore(expandedMore === i ? null : i)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                            {item.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm">{item.goalName}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              {item.matchPercentage}% match
                            </span>
                            {expandedMore === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </button>
                        <AnimatePresence initial={false}>
                          {expandedMore === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                                <p className="text-sm text-foreground/80">{item.description}</p>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Required Skills</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.requiredSkills.map((s) => (
                                      <span key={s} className="text-xs bg-muted text-foreground/70 px-2 py-0.5 rounded-full">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Future Opportunities</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.futureOpportunities.map((o) => (
                                      <span key={o} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{o}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intro cards (shown before first submit) */}
        {!result && !loading && !error && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { emoji: "🎯", title: "Personalised",    desc: "Recommendations based on your unique interests and personality" },
              { emoji: "🗺️", title: "Clear Roadmap",   desc: "Step-by-step learning path for each career" },
              { emoji: "💰", title: "Salary Insights",  desc: "Know the income potential before you choose" },
              { emoji: "🚀", title: "Future Scope",     desc: "Understand job markets and growth opportunities" },
            ].map((c) => (
              <div key={c.title} className="bg-card rounded-xl border border-border p-4">
                <div className="text-2xl mb-2">{c.emoji}</div>
                <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default DiscoverGoalPage;
