/**
 * Discover Your Goal — AI Career Goal Discovery Page
 *
 * Modes:
 * - Onboarding (?onboarding=true): mandatory first-time flow after login;
 *   shows "Select this Goal" on each card, no BottomNav back option.
 * - Standalone: accessible anytime from the bottom nav.
 *
 * Features:
 * - Free-text AI analysis (Gemini-powered via backend)
 * - Goal search bar: quickly find any career from a comprehensive list
 * - "+" button: add a fully custom goal
 */

import { useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ArrowLeft, Sparkles, AlertCircle, RotateCcw,
  ChevronDown, ChevronUp, Star, TrendingUp, BookOpen,
  Target, Zap, BarChart3, DollarSign, Layers,
  Search, Plus, X, CheckCircle2, SkipForward, PlayCircle,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";

// ─── Career search list ───────────────────────────────────────────────────────

const CAREER_LIST = [
  "Doctor", "Engineer", "IAS Officer", "Scientist", "Entrepreneur",
  "Pilot", "Lawyer", "Architect", "Chartered Accountant", "Teacher",
  "Data Scientist", "Software Developer", "UI/UX Designer", "Game Developer",
  "Cybersecurity Expert", "AI/ML Engineer", "Web Developer", "App Developer",
  "Graphic Designer", "Animator", "Film Director", "Journalist",
  "Photographer", "Chef", "Fashion Designer", "Interior Designer",
  "Civil Engineer", "Mechanical Engineer", "Electrical Engineer",
  "Biomedical Engineer", "Chemical Engineer", "Aerospace Engineer",
  "Marine Engineer", "Robotics Engineer", "Environmental Engineer",
  "MBBS Doctor", "Dentist", "Pharmacist", "Nurse", "Physiotherapist",
  "Psychologist", "Psychiatrist", "Nutritionist", "Veterinarian",
  "CA (Chartered Accountant)", "MBA Graduate", "Investment Banker",
  "Stock Market Analyst", "Economist", "Marketing Manager",
  "HR Manager", "Supply Chain Manager", "Logistics Manager",
  "NDA Officer", "Army Officer", "Navy Officer", "Air Force Officer",
  "Police Officer", "IPS Officer", "IFS Officer", "UPSC Civil Servant",
  "Judge", "Advocate", "Barrister", "Legal Consultant",
  "Professor", "School Teacher", "Research Scientist", "PhD Scholar",
  "Astronaut", "Space Scientist", "ISRO Scientist", "DRDO Scientist",
  "Biotechnologist", "Geneticist", "Microbiologist", "Biochemist",
  "Social Worker", "NGO Worker", "Political Leader", "Diplomat",
  "Sportsperson", "Cricketer", "Footballer", "Badminton Player", "Swimmer",
  "Yoga Instructor", "Fitness Trainer", "Nutritionist", "Dietitian",
  "Content Creator", "YouTuber", "Podcaster", "Social Media Manager",
  "Digital Marketer", "SEO Specialist", "Copywriter", "Author", "Novelist",
  "Artist", "Painter", "Sculptor", "Musician", "Singer", "Dancer",
  "Actor", "Theatre Artist", "Choreographer", "Event Manager",
];

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

// ─── Career → Goal mapping (for video links) ─────────────────────────────────

function mapCareerToGoal(career: string): string {
  const c = career.toLowerCase();
  // Specific career IDs (match backend goal IDs added to videos.ts)
  if (c.includes("software") || c.includes("full stack") || c.includes("web developer") || c.includes("app developer") || c.includes("programmer") || c.includes("devops") || c.includes("cloud engineer")) return "software-engineer";
  if (c.includes("ai engineer") || c.includes("ml engineer") || c.includes("machine learn") || c.includes("deep learn") || c.includes("nlp engineer") || c.includes("ai/ml")) return "ai-engineer";
  if (c.includes("data scien") || c.includes("data analyst")) return "data-scientist";
  if (c.includes("cybersecurity") || c.includes("cyber security") || c.includes("ethical hack") || c.includes("information security")) return "cybersecurity";
  if (c.includes("mechanical") || c.includes("production engineer")) return "mechanical";
  if (c.includes("civil engineer")) return "civil";
  if (c.includes("chartered accountant") || (c.includes("ca") && c.length <= 10)) return "ca";
  if (c.includes("digital market") || c.includes("seo specialist") || c.includes("content market")) return "digital-marketing";
  if (c.includes("entrepreneur") || c.includes("startup founder") || c.includes("business owner")) return "entrepreneur";
  if (c.includes("graphic design") || c.includes("ui/ux") || c.includes("ui design") || c.includes("ux design") || c.includes("fashion design") || c.includes("interior design") || c.includes("animation")) return "design";
  if (c.includes("lawyer") || c.includes("advocate") || c.includes("barrister") || c.includes("solicitor")) return "lawyer";
  if (c.includes("scientist") || c.includes("research scientist") || c.includes("isro") || c.includes("drdo") || c.includes("physicist") || c.includes("chemist") || c.includes("biologist") || c.includes("astronomer")) return "scientist";
  // Broad category fallbacks
  if (c.includes("engineer") || c.includes("iit") || c.includes("jee")) return "engineering";
  if (c.includes("doctor") || c.includes("mbbs") || c.includes("medical") || c.includes("neet") || c.includes("dentist") || c.includes("pharma") || c.includes("nurse")) return "medical";
  if (c.includes("ias") || c.includes("ips") || c.includes("ifs") || c.includes("upsc") || c.includes("civil serv") || c.includes("government") || c.includes("police") || c.includes("judge")) return "govt";
  if (c.includes("army") || c.includes("navy") || c.includes("air force") || c.includes("nda") || c.includes("defence") || c.includes("military") || c.includes("pilot")) return "defence";
  if (c.includes("commerce") || c.includes("accountant") || c.includes("mba") || c.includes("finance") || c.includes("banker") || c.includes("stock") || c.includes("econom")) return "commerce";
  if (c.includes("artist") || c.includes("painter") || c.includes("musician") || c.includes("actor") || c.includes("film") || c.includes("design") || c.includes("creative") || c.includes("content creator")) return "arts";
  if (c.includes("research") || c.includes("phd") || c.includes("biotech") || c.includes("biology") || c.includes("chemistry") || c.includes("physics") || c.includes("astronomy")) return "science";
  return "all";
}

// ─── Video Link Button ────────────────────────────────────────────────────────

const VideoLink = ({ goalName }: { goalName: string }) => {
  const navigate = useNavigate();
  const goal = mapCareerToGoal(goalName);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/videos?goal=${goal}`);
      }}
      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 text-sm font-semibold transition"
    >
      <PlayCircle className="w-4 h-4" />
      Watch Relevant Videos
    </button>
  );
};

// ─── Goal Card ────────────────────────────────────────────────────────────────

const GoalCard = ({
  rec,
  rank,
  isOnboarding,
  onSelect,
}: {
  rec: GoalRecommendation;
  rank: number;
  isOnboarding: boolean;
  onSelect?: (goalName: string) => void;
}) => {
  const [expanded, setExpanded] = useState(rank === 0);

  const rankColors = [
    "from-violet-50 to-purple-50 border-violet-200 dark:from-violet-950/40 dark:to-purple-950/40 dark:border-violet-800",
    "from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-800",
    "from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-950/40 dark:to-teal-950/40 dark:border-emerald-800",
    "from-orange-50 to-amber-50 border-orange-200 dark:from-orange-950/40 dark:to-amber-950/40 dark:border-orange-800",
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
        <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-white/10 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
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
            <div className="px-4 pb-4 space-y-4 border-t border-white/60 dark:border-white/10 pt-3">

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
                      <span key={s} className="text-xs bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20 text-foreground px-2 py-0.5 rounded-full">
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
                <div className="flex-1 bg-white/60 dark:bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Salary Potential</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{rec.salaryPotential}</p>
                </div>
                <div className="flex-1 bg-white/60 dark:bg-white/5 rounded-xl p-3">
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

              {/* Watch Videos button — always shown */}
              <VideoLink goalName={rec.goalName} />

              {/* Select button — onboarding only */}
              {isOnboarding && onSelect && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(rec.goalName); }}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold hover:opacity-90 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Select This Goal
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Goal Search Section ──────────────────────────────────────────────────────

const GoalSearch = ({
  isOnboarding,
  onSelectGoal,
}: {
  isOnboarding: boolean;
  onSelectGoal: (goal: string) => void;
}) => {
  const { user, addCustomGoal } = useUser();
  const [query, setQuery] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const [addedGoal, setAddedGoal] = useState<string | null>(null);

  const filtered = query.length >= 1
    ? CAREER_LIST.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  const handleAddCustom = () => {
    const trimmed = customGoal.trim();
    if (!trimmed) return;
    addCustomGoal(trimmed);
    setAddedGoal(trimmed);
    setCustomGoal("");
    setShowCustomInput(false);
    if (isOnboarding) {
      setTimeout(() => onSelectGoal(trimmed), 600);
    }
  };

  const handleSelectFromList = (career: string) => {
    setQuery("");
    if (isOnboarding) {
      onSelectGoal(career);
    } else {
      addCustomGoal(career);
      setAddedGoal(career);
      setTimeout(() => setAddedGoal(null), 2500);
    }
  };

  const existingGoals = user?.customGoals ?? [];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-foreground text-base">
            🔍 Search a Career
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isOnboarding ? "Or quickly pick a specific career goal" : "Search and add any career to your profile"}
          </p>
        </div>
        <button
          onClick={() => setShowCustomInput((v) => !v)}
          className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl px-3 py-2 text-xs font-semibold transition"
          title="Add custom goal"
        >
          <Plus className="w-3.5 h-3.5" />
          Custom
        </button>
      </div>

      {/* Custom goal input */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-3"
          >
            <div className="flex gap-2 bg-muted/50 rounded-xl p-3">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                placeholder="Type your custom career goal…"
                autoFocus
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={handleAddCustom}
                disabled={!customGoal.trim()}
                className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50 hover:opacity-90 transition"
              >
                Add
              </button>
              <button onClick={() => setShowCustomInput(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added goal confirmation */}
      <AnimatePresence>
        {addedGoal && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2 mb-3"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>✓ <strong>{addedGoal}</strong> added to your goals!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Doctor, IAS, Game Developer, Pilot…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search results */}
      <AnimatePresence>
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 border border-border rounded-xl overflow-hidden"
          >
            {filtered.map((career, i) => {
              const alreadyAdded = existingGoals.includes(career);
              return (
                <button
                  key={career}
                  onClick={() => handleSelectFromList(career)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition hover:bg-muted ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="text-foreground font-medium">{career}</span>
                  <span className={`text-xs font-semibold ${isOnboarding ? "text-primary" : alreadyAdded ? "text-green-600" : "text-primary"}`}>
                    {isOnboarding ? "Select →" : alreadyAdded ? "✓ Added" : "+ Add"}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current custom goals (non-onboarding) */}
      {!isOnboarding && existingGoals.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Your Added Goals</p>
          <div className="flex flex-wrap gap-1.5">
            {existingGoals.map((g) => (
              <span key={g} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-medium">
                {g}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Example prompts ──────────────────────────────────────────────────────────

const EXAMPLES = [
  "I love drawing, solving maths, watching space documentaries and programming small games.",
  "I enjoy helping people, reading medical articles, and I'm good at biology and chemistry.",
  "I like playing chess, coding websites, reading tech news, and solving logic puzzles.",
  "I love writing stories, debating, watching news, and helping my community.",
];

// ─── Main Page ────────────────────────────────────────────────────────────────

const DiscoverGoalPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const { user, completeOnboarding } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [interests, setInterests] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<DiscoverResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [expandedMore, setExpandedMore] = useState<number | null>(null);

  const handleGoalSelected = useCallback((goalName: string) => {
    completeOnboarding(goalName);
    navigate("/home");
  }, [completeOnboarding, navigate]);

  const handleSkipOnboarding = () => {
    completeOnboarding();
    navigate("/goals");
  };

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
    <div className={`min-h-screen bg-background ${isOnboarding ? "pb-10" : "pb-28"}`}>

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white px-4 pb-8">
        <div className="max-w-2xl mx-auto pt-6 safe-top">

          {/* Top nav row */}
          <div className="flex items-center justify-between mb-5">
            {isOnboarding ? (
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Career Discovery</p>
                <p className="text-sm text-white/90 font-semibold mt-0.5">Find your perfect path</p>
              </div>
            ) : (
              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 text-white/80 hover:text-white transition text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" /> Home
              </button>
            )}

            {isOnboarding && (
              <button
                onClick={handleSkipOnboarding}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </button>
            )}
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              {isOnboarding ? (
                <>
                  <h1 className="text-xl font-display font-bold leading-tight">
                    Welcome, {user?.fullName?.split(" ")[0] ?? "there"}! 👋
                  </h1>
                  <p className="text-sm text-white/70 mt-0.5">Let's discover your ideal career path</p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-display font-bold">Discover Your Goal</h1>
                  <p className="text-sm text-white/70">AI-powered career path finder</p>
                </>
              )}
            </div>
          </div>

          {isOnboarding && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 mb-4 text-sm text-white/90 leading-relaxed">
              ✨ Describe your interests and our AI will recommend the best career paths personalised for you.
            </div>
          )}

          {/* Textarea form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-sm text-white/80 font-medium block">
              Tell us about yourself — interests, hobbies, subjects you love, talents &amp; dreams:
            </label>
            <textarea
              ref={textareaRef}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder={`e.g. "${EXAMPLES[0]}"`}
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-white/50 focus:bg-white/15 resize-none transition"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-white/40">{interests.length}/2000</span>
              <button
                type="submit"
                disabled={interests.trim().length < 20 || loading}
                className="flex items-center gap-2 bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl disabled:opacity-40 hover:bg-violet-50 active:scale-95 transition-all text-sm shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Analysing…" : "Discover My Goals"}
              </button>
            </div>
          </form>

          {/* Example prompts */}
          {!result && !loading && (
            <div className="mt-4">
              <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">Try an example:</p>
              <div className="flex flex-col gap-1.5">
                {EXAMPLES.slice(0, 2).map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setInterests(ex)}
                    className="text-left text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition line-clamp-1 border border-white/10"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        {/* Goal Search + Custom Goals (always visible) */}
        <div className="mt-4">
          <GoalSearch isOnboarding={isOnboarding} onSelectGoal={handleGoalSelected} />
        </div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card rounded-2xl border border-border p-8 shadow-card flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <Compass className="w-8 h-8 text-violet-500 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-violet-300 dark:border-violet-700 border-t-transparent animate-spin" />
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
              className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Something went wrong</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
              className="space-y-5"
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
                className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border border-violet-200 dark:border-violet-800 rounded-2xl p-5"
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
                        <span key={s} className="text-xs bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-2.5 py-0.5 rounded-full font-medium">
                          ✦ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3">
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
                  {isOnboarding && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">— tap one to select it</span>
                  )}
                </h2>
                <div className="space-y-3">
                  {result.topRecommendations.slice(0, 4).map((rec, i) => (
                    <GoalCard
                      key={rec.goalName}
                      rec={rec}
                      rank={i}
                      isOnboarding={isOnboarding}
                      onSelect={handleGoalSelected}
                    />
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
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
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
                                      <span key={o} className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{o}</span>
                                    ))}
                                  </div>
                                </div>
                                {isOnboarding && (
                                  <button
                                    onClick={() => handleGoalSelected(item.goalName)}
                                    className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/30 rounded-xl py-2 text-sm font-semibold hover:bg-primary/20 transition"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Select This Goal
                                  </button>
                                )}
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
          <div className="grid grid-cols-2 gap-3">
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

      {!isOnboarding && <BottomNav />}
    </div>
  );
};

export default DiscoverGoalPage;
