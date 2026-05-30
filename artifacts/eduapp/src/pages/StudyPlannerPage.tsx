/**
 * AI Study Planner
 *
 * Generates a personalised week-by-week study schedule powered by Groq.
 * Plans are saved to localStorage so they persist between sessions.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, CalendarDays, BookOpen,
  Clock, ChevronDown, ChevronUp, Loader2, RefreshCcw,
  CheckCircle2, Target, Brain, Zap,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import BottomNav from "@/components/BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudyTask {
  day:      string;
  subject:  string;
  topic:    string;
  duration: string;
  tip:      string;
}

interface StudyWeek {
  week:  number;
  title: string;
  theme: string;
  tasks: StudyTask[];
}

interface StudyPlan {
  goal:      string;
  examDate:  string;
  weeksLeft: number;
  planWeeks: number;
  examName:  string;
  weeks:     StudyWeek[];
  createdAt: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOAL_SUBJECTS: Record<string, string[]> = {
  engineering: ["Physics", "Chemistry", "Mathematics", "Coding"],
  medical:     ["Biology", "Chemistry", "Physics"],
  commerce:    ["Accountancy", "Economics", "Business Studies", "Maths"],
  arts:        ["History", "Geography", "Literature", "Political Science"],
  it:          ["Data Structures", "Algorithms", "System Design", "Coding"],
  defence:     ["Mathematics", "English", "General Knowledge", "Physics"],
  govt:        ["History", "Polity", "Economy", "Current Affairs"],
};

const GOAL_META: Record<string, { label: string; emoji: string; color: string }> = {
  engineering: { label: "Engineering", emoji: "⚙️",  color: "from-blue-500 to-cyan-500" },
  medical:     { label: "Medical",     emoji: "🏥",  color: "from-green-500 to-teal-500" },
  commerce:    { label: "Commerce",    emoji: "💼",  color: "from-yellow-500 to-orange-500" },
  arts:        { label: "Arts",        emoji: "🎨",  color: "from-purple-500 to-pink-500" },
  it:          { label: "IT & Coding", emoji: "💻",  color: "from-indigo-500 to-blue-500" },
  defence:     { label: "Defence",     emoji: "🎖️",  color: "from-gray-600 to-slate-700" },
  govt:        { label: "Government",  emoji: "🏛️",  color: "from-orange-500 to-red-500" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_COLORS: Record<string, string> = {
  Mon: "bg-blue-500",
  Tue: "bg-purple-500",
  Wed: "bg-green-500",
  Thu: "bg-orange-500",
  Fri: "bg-red-500",
  Sat: "bg-pink-500",
};

const LS_KEY = "edupath_study_plan";

// ─── Week Card ────────────────────────────────────────────────────────────────

function WeekCard({ week, index }: { week: StudyWeek; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggleDone = (key: string) => {
    setDone(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const pct = Math.round((done.size / (week.tasks?.length || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="font-bold text-primary text-sm">W{week.week}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{week.title}</p>
          <p className="text-xs text-muted-foreground truncate">{week.theme}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {done.size > 0 && (
            <span className="text-xs font-semibold text-green-500">{pct}%</span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Progress bar */}
      {done.size > 0 && (
        <div className="px-4 pb-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-2">
              {(week.tasks ?? []).map((task, ti) => {
                const key  = `${week.week}-${ti}`;
                const isDone = done.has(key);
                return (
                  <motion.div
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                      isDone ? "bg-green-50 dark:bg-green-950/30" : "bg-muted/50"
                    }`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleDone(key)}
                  >
                    {/* Day badge */}
                    <div className={`w-8 h-8 rounded-lg ${DAY_COLORS[task.day] ?? "bg-gray-500"} flex items-center justify-center shrink-0`}>
                      <span className="text-white text-[10px] font-bold">{task.day}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isDone ? "line-through text-muted-foreground" : ""}`}>
                          {task.subject}
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {task.duration}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isDone ? "line-through text-muted-foreground" : ""}`}>
                        {task.topic}
                      </p>
                      {task.tip && !isDone && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic">
                          💡 {task.tip}
                        </p>
                      )}
                    </div>

                    {isDone && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function PlannerForm({
  goal,
  onGenerate,
  loading,
}: {
  goal: string;
  onGenerate: (data: { examDate: string; currentLevel: string; dailyHours: number; weakSubjects: string[] }) => void;
  loading: boolean;
}) {
  const subjects = GOAL_SUBJECTS[goal] ?? [];
  const today    = new Date();
  const minDate  = today.toISOString().split("T")[0];
  const maxDate  = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [examDate,    setExamDate]    = useState("");
  const [level,       setLevel]       = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [dailyHours,  setDailyHours]  = useState(3);
  const [weak,        setWeak]        = useState<string[]>([]);

  const toggleWeak = (s: string) => {
    setWeak(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = () => {
    onGenerate({ examDate, currentLevel: level, dailyHours, weakSubjects: weak });
  };

  return (
    <div className="space-y-5">
      {/* Exam Date */}
      <div>
        <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-primary" />
          Exam / Target Date
        </label>
        <input
          type="date"
          value={examDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-[11px] text-muted-foreground mt-1">Leave blank to get a 12-week plan</p>
      </div>

      {/* Current Level */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-primary" />
          Your Current Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["beginner", "intermediate", "advanced"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                level === l
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Hours */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary" />
          Daily Study Hours: <span className="text-primary ml-1">{dailyHours}h</span>
        </label>
        <input
          type="range"
          min={1}
          max={8}
          value={dailyHours}
          onChange={(e) => setDailyHours(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>1h</span><span>4h</span><span>8h</span>
        </div>
      </div>

      {/* Weak Subjects */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-primary" />
          Weak Subjects (select any)
        </label>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => toggleWeak(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                weak.includes(s)
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating your plan…
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate My Study Plan
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudyPlannerPage() {
  const navigate    = useNavigate();
  const { user }    = useUser();
  const goal        = user?.selectedGoal ?? "engineering";
  const meta        = GOAL_META[goal] ?? GOAL_META.engineering;

  const [plan,    setPlan]    = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [view,    setView]    = useState<"form" | "plan">("form");

  // Load saved plan from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${LS_KEY}_${goal}`);
      if (saved) {
        const parsed = JSON.parse(saved) as StudyPlan;
        setPlan(parsed);
        setView("plan");
      }
    } catch {
      // ignore
    }
  }, [goal]);

  const generate = async (params: {
    examDate:      string;
    currentLevel:  string;
    dailyHours:    number;
    weakSubjects:  string[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/study-planner", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ goal, ...params }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Server error");
      }

      const data = await res.json() as StudyPlan;
      data.createdAt = Date.now();
      setPlan(data);
      localStorage.setItem(`${LS_KEY}_${goal}`, JSON.stringify(data));
      setView("plan");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPlan = () => {
    localStorage.removeItem(`${LS_KEY}_${goal}`);
    setPlan(null);
    setView("form");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${meta.color} text-white px-4 pt-12 pb-6`}>
        <button onClick={() => navigate(-1)} className="mb-3 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
            {meta.emoji}
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Study Planner</h1>
            <p className="text-sm opacity-80">{meta.label} · Personalised Schedule</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 pb-28 overflow-y-auto">

        {/* Tabs — only shown when a plan exists */}
        {plan && (
          <div className="flex bg-muted rounded-xl p-1 mb-5">
            <button
              onClick={() => setView("form")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === "form" ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5 inline mr-1" />
              New Plan
            </button>
            <button
              onClick={() => setView("plan")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === "plan" ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              My Plan ({plan.planWeeks}w)
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Form view */}
        {view === "form" && (
          <PlannerForm
            goal={goal}
            onGenerate={generate}
            loading={loading}
          />
        )}

        {/* Plan view */}
        {view === "plan" && plan && (
          <div className="space-y-4">
            {/* Plan summary */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">{plan.examName}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.planWeeks} weeks · {plan.weeksLeft} weeks to go
                  {plan.examDate ? ` · Exam: ${new Date(plan.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                </p>
              </div>
              <button
                onClick={resetPlan}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>

            {/* Week legend */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {DAYS.map(d => (
                <span key={d} className={`${DAY_COLORS[d]} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                  {d}
                </span>
              ))}
              <span className="text-[10px] text-muted-foreground ml-1 self-center">· Tap tasks to mark done</span>
            </div>

            {/* Week cards */}
            {plan.weeks.map((week, i) => (
              <WeekCard key={week.week} week={week} index={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
