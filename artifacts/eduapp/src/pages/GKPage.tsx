/**
 * GK (General Knowledge) Page
 * Three tabs: Lessons | Quiz | Search
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Brain, Search, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Zap, RotateCcw, Star, Trophy,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";
import {
  gkTopics, gkLessons, gkQuestions,
  type GKTopic, type GKLesson, type GKQuestion,
} from "@/data/gkData";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "lessons" | "quiz" | "search";
type Difficulty = "all" | "easy" | "medium" | "hard";

// ─── Topic Card ───────────────────────────────────────────────────────────────

function TopicCard({
  topic,
  onSelect,
  selected,
}: {
  topic: GKTopic;
  onSelect: (id: string) => void;
  selected: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(topic.id)}
      className={`w-full text-left rounded-xl overflow-hidden border transition shadow-sm ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      <div className={`bg-gradient-to-r ${topic.color} px-3 py-2.5 flex items-center gap-2`}>
        <span className="text-xl">{topic.emoji}</span>
        <span className="text-white font-bold text-sm leading-tight">{topic.name}</span>
      </div>
      <div className="bg-card px-3 py-2">
        <p className="text-xs text-muted-foreground line-clamp-2">{topic.description}</p>
        <p className="text-xs text-primary font-semibold mt-1">{topic.lessonCount} lessons</p>
      </div>
    </motion.button>
  );
}

// ─── Lesson Card ──────────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  onEarnXP,
  earned,
}: {
  lesson: GKLesson;
  onEarnXP: (id: string, xp: number) => void;
  earned: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-semibold text-sm text-foreground">{lesson.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {earned && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <p className="text-sm text-foreground/90 leading-relaxed">{lesson.content}</p>

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Key Facts</p>
                {lesson.keyFacts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold text-xs mt-0.5">•</span>
                    <span className="text-xs text-foreground">{fact}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onEarnXP(lesson.id, lesson.xp)}
                disabled={earned}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
                  earned
                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 cursor-default"
                    : "bg-primary text-white hover:bg-primary/90 active:scale-95"
                }`}
              >
                {earned ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> +{lesson.xp} XP Earned!
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Earn +{lesson.xp} XP
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Quiz Component ───────────────────────────────────────────────────────────

function QuizTab({ addXP }: { addXP: (xp: number) => void }) {
  const [activeTopic, setActiveTopic] = useState<string>("world-history");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());

  const filtered = gkQuestions.filter(
    (q) =>
      q.topicId === activeTopic &&
      (difficulty === "all" || q.difficulty === difficulty),
  );

  const current: GKQuestion | undefined = filtered[currentIdx];
  const total = filtered.length;
  const progress = total > 0 ? ((currentIdx) / total) * 100 : 0;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current.answer && !earnedIds.has(current.id)) {
      setScore((s) => s + 1);
      addXP(5);
      setEarnedIds((prev) => new Set(prev).add(current.id));
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= total) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const handleTopicChange = (id: string) => {
    setActiveTopic(id);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const diffColors: Record<Difficulty, string> = {
    all: "bg-muted text-muted-foreground",
    easy: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
    hard: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  };

  return (
    <div className="space-y-4">
      {/* Topic chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {gkTopics.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTopicChange(t.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              activeTopic === t.id
                ? "bg-primary text-white border-primary"
                : "bg-card text-foreground border-border hover:border-primary"
            }`}
          >
            {t.emoji} {t.name}
          </button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2">
        {(["all", "easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => { setDifficulty(d); handleRestart(); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border transition ${
              difficulty === d
                ? `${diffColors[d]} border-current`
                : "border-border text-muted-foreground hover:border-primary"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No questions for this combination.
        </div>
      ) : finished ? (
        /* Results screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Quiz Complete!</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {score} / {total} correct
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <span className="bg-accent/10 text-accent font-bold px-3 py-1 rounded-full text-sm">
              +{score * 5} XP earned
            </span>
            <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
              {Math.round((score / total) * 100)}% score
            </span>
          </div>
          {score === total && (
            <p className="text-green-600 dark:text-green-400 font-semibold text-sm">
              🌟 Perfect Score! Excellent work!
            </p>
          )}
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </motion.div>
      ) : (
        /* Question screen */
        <div className="space-y-3">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {currentIdx + 1} of {total}</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full ${diffColors[current.difficulty]}`}>
              {current.difficulty}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question card */}
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="font-semibold text-foreground text-sm leading-snug mb-4">
              {current.question}
            </p>

            <div className="space-y-2">
              {current.options.map((opt, idx) => {
                let style = "bg-muted border-border text-foreground";
                if (selected !== null) {
                  if (idx === current.answer) {
                    style = "bg-green-100 border-green-500 text-green-800 dark:bg-green-950/50 dark:text-green-300";
                  } else if (idx === selected && selected !== current.answer) {
                    style = "bg-red-100 border-red-400 text-red-700 dark:bg-red-950/50 dark:text-red-300";
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition font-medium ${style} ${
                      selected === null ? "hover:border-primary hover:bg-primary/5" : ""
                    }`}
                  >
                    <span className="font-bold mr-2 text-muted-foreground">
                      {["A", "B", "C", "D"][idx]}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${
                  selected === current.answer
                    ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300"
                    : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  {selected === current.answer ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{current.explanation}</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {selected !== null && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
            >
              {currentIdx + 1 >= total ? "See Results" : "Next Question →"}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Search Tab ───────────────────────────────────────────────────────────────

function SearchTab() {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();

  const matchedTopics = q
    ? gkTopics.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      )
    : [];

  const matchedLessons = q
    ? gkLessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.content.toLowerCase().includes(q) ||
          l.keyFacts.some((f) => f.toLowerCase().includes(q)),
      )
    : [];

  const matchedQuestions = q
    ? gkQuestions
        .filter(
          (qu) =>
            qu.question.toLowerCase().includes(q) ||
            qu.options.some((o) => o.toLowerCase().includes(q)) ||
            qu.explanation.toLowerCase().includes(q),
        )
        .slice(0, 6)
    : [];

  const total = matchedTopics.length + matchedLessons.length + matchedQuestions.length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics, facts, questions… (e.g. ISRO, Olympics, DNA)"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition"
        />
      </div>

      {q && total === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No results for "<strong>{query}</strong>"
        </p>
      )}

      {matchedTopics.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Topics</p>
          {matchedTopics.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
            >
              <span className="text-xl">{t.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {matchedLessons.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Lessons</p>
          {matchedLessons.map((l) => {
            const topic = gkTopics.find((t) => t.id === l.topicId);
            return (
              <div
                key={l.id}
                className="p-3 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{topic?.emoji}</span>
                  <span className="text-xs text-muted-foreground">{topic?.name}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{l.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{l.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {matchedQuestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Quiz Questions
          </p>
          {matchedQuestions.map((qu) => {
            const topic = gkTopics.find((t) => t.id === qu.topicId);
            return (
              <div key={qu.id} className="p-3 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{topic?.emoji}</span>
                  <span className="text-xs text-muted-foreground">{topic?.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      qu.difficulty === "easy"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : qu.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                    }`}
                  >
                    {qu.difficulty}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">{qu.question}</p>
                <p className="text-xs text-primary mt-1">Answer: {qu.options[qu.answer]}</p>
              </div>
            );
          })}
        </div>
      )}

      {!q && (
        <div className="text-center py-10 space-y-3">
          <Search className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Search across all GK topics, lessons, and quiz questions.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["ISRO", "Olympics", "Nobel", "DNA", "Parliament", "Climate", "GDP"].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const GKPage = () => {
  const navigate = useNavigate();
  const { addXP } = useUser();

  const [tab, setTab] = useState<Tab>("lessons");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [earnedLessons, setEarnedLessons] = useState<Set<string>>(new Set());

  const activeTopic = selectedTopic
    ? gkTopics.find((t) => t.id === selectedTopic)
    : null;

  const topicLessons = activeTopic
    ? gkLessons.filter((l) => l.topicId === activeTopic.id)
    : [];

  const handleEarnXP = (id: string, xp: number) => {
    if (!earnedLessons.has(id)) {
      addXP(xp);
      setEarnedLessons((prev) => new Set(prev).add(id));
    }
  };

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "lessons", icon: "📚", label: "Lessons" },
    { id: "quiz",    icon: "🧠", label: "Quiz" },
    { id: "search",  icon: "🔍", label: "Search" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white px-4 pt-12 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">📖 General Knowledge</h1>
              <p className="text-white/70 text-sm">
                {gkTopics.length} topics · {gkLessons.length} lessons · {gkQuestions.length} questions
              </p>
            </div>
          </div>

          {/* XP banner */}
          <div className="flex items-center gap-3">
            <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-300" />
              +10 XP per lesson
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-300" />
              +5 XP per correct answer
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition border-b-2 ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          {/* ── LESSONS TAB ──────────────────────────────────────── */}
          {tab === "lessons" && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {!activeTopic ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Select a topic to explore lessons and earn XP.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {gkTopics.map((t) => (
                      <TopicCard
                        key={t.id}
                        topic={t}
                        onSelect={setSelectedTopic}
                        selected={selectedTopic === t.id}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Back to topics */}
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    ← All Topics
                  </button>

                  {/* Topic header */}
                  <div
                    className={`bg-gradient-to-r ${activeTopic.color} rounded-xl p-4 text-white`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{activeTopic.emoji}</span>
                      <div>
                        <h2 className="font-bold text-lg">{activeTopic.name}</h2>
                        <p className="text-white/80 text-sm">{activeTopic.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="space-y-3">
                    {topicLessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        onEarnXP={handleEarnXP}
                        earned={earnedLessons.has(lesson.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── QUIZ TAB ─────────────────────────────────────────── */}
          {tab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <QuizTab addXP={addXP} />
            </motion.div>
          )}

          {/* ── SEARCH TAB ───────────────────────────────────────── */}
          {tab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <SearchTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default GKPage;
