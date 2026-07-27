import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, PlayCircle, X, Globe, ChevronDown,
  BookOpen, Loader2, Wifi, WifiOff, ExternalLink,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoItem = {
  id: string;
  title: string;
  channel: string;
  topic: string;
  duration: string;
  language: string;
  goal: string;
  thumb: string;
};

type VideoSection = {
  topic: string;
  videos: VideoItem[];
};

type ApiResponse = {
  goal: string;
  language: string;
  totalVideos: number;
  sections: VideoSection[];
};

// ─── Goal metadata ─────────────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  // ── Main career categories shown in the picker ──
  engineering:        { label: "Engineering",         emoji: "⚙️",  color: "from-blue-500 to-cyan-500" },
  medical:            { label: "Medical",             emoji: "🏥",  color: "from-green-500 to-teal-500" },
  commerce:           { label: "Commerce",            emoji: "💼",  color: "from-yellow-500 to-orange-500" },
  arts:               { label: "Arts",                emoji: "🎨",  color: "from-purple-500 to-pink-500" },
  it:                 { label: "IT & Coding",         emoji: "💻",  color: "from-indigo-500 to-blue-500" },
  defence:            { label: "Defence",             emoji: "🎖️",  color: "from-gray-600 to-slate-700" },
  govt:               { label: "Government",          emoji: "🏛️",  color: "from-orange-500 to-red-500" },
  all:                { label: "All Topics",          emoji: "📚",  color: "from-violet-500 to-fuchsia-500" },
  // ── Specific career goal IDs (navigated to via Discover Goal → Watch Videos) ──
  "software-engineer":  { label: "Software Engineer",  emoji: "🧑‍💻", color: "from-indigo-600 to-blue-600" },
  "ai-engineer":        { label: "AI Engineer",        emoji: "🤖",  color: "from-violet-600 to-purple-600" },
  "data-scientist":     { label: "Data Scientist",     emoji: "📊",  color: "from-teal-500 to-cyan-600" },
  "cybersecurity":      { label: "Cybersecurity",      emoji: "🔐",  color: "from-red-600 to-rose-600" },
  "mechanical":         { label: "Mechanical Engr.",   emoji: "🔧",  color: "from-blue-600 to-sky-600" },
  "civil":              { label: "Civil Engineer",     emoji: "🏗️",  color: "from-amber-500 to-yellow-600" },
  "lawyer":             { label: "Lawyer",             emoji: "⚖️",  color: "from-slate-600 to-gray-700" },
  "scientist":          { label: "Scientist",          emoji: "🔬",  color: "from-emerald-500 to-green-600" },
  "entrepreneur":       { label: "Entrepreneur",       emoji: "🚀",  color: "from-orange-500 to-amber-600" },
  "design":             { label: "Design",             emoji: "🎨",  color: "from-fuchsia-500 to-pink-600" },
  "digital-marketing":  { label: "Digital Marketing",  emoji: "📣",  color: "from-pink-500 to-rose-500" },
  "ca":                 { label: "CA (Accountant)",    emoji: "📑",  color: "from-yellow-600 to-amber-700" },
  "science":            { label: "Science & Research", emoji: "⚗️",  color: "from-green-500 to-emerald-600" },
};

const LANG_LABELS: Record<string, string> = {
  en: "English", hi: "हिंदी", kn: "ಕನ್ನಡ",
  mr: "मराठी",   te: "తెలుగు", ta: "தமிழ்",
};

// ─── YouTube Player Modal ─────────────────────────────────────────────────────

function PlayerModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-card rounded-2xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 16:9 embed */}
          <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="p-4">
            <h3 className="font-bold text-sm leading-snug line-clamp-2">{video.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{video.channel} · {video.duration}</p>
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Watch on YouTube
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({ video, onPlay }: { video: VideoItem; onPlay: (v: VideoItem) => void }) {
  const [thumbErr, setThumbErr] = useState(false);

  return (
    <motion.div
      className="bg-card rounded-xl overflow-hidden shadow-sm border border-border cursor-pointer group hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPlay(video)}
    >
      <div className="relative overflow-hidden">
        {thumbErr ? (
          <div className="w-full aspect-video bg-muted flex items-center justify-center">
            <PlayCircle className="w-10 h-10 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={video.thumb}
            alt={video.title}
            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setThumbErr(true)}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" />
        </div>
        <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
          {video.duration}
        </span>
        {video.language !== "en" && (
          <span className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {LANG_LABELS[video.language] ?? video.language}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold line-clamp-2 leading-snug">{video.title}</p>
        <p className="text-[11px] text-muted-foreground mt-1 truncate">{video.channel}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const VideosPage = () => {
  const navigate  = useNavigate();
  const { user }  = useUser();
  const { language } = useLanguage();

  const userGoal = user?.selectedGoal ?? "all";

  const [activeGoal, setActiveGoal]   = useState(userGoal);
  const [data, setData]               = useState<ApiResponse | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [playing, setPlaying]         = useState<VideoItem | null>(null);
  const [expandedTopics, setExpanded] = useState<Set<string>>(new Set(["Physics", "Biology", "Programming", "Study Skills", "Career", "Coding", "General Studies"]));
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const fetchVideos = useCallback(async (goal: string, lang: string) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/videos?goal=${goal}&language=${lang}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json() as ApiResponse;
      setData(json);
      // Auto-expand first 3 sections
      if (json.sections.length > 0) {
        setExpanded(new Set(json.sections.slice(0, 3).map((s) => s.topic)));
      }
    } catch {
      setError("Could not load videos. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(activeGoal, language);
  }, [activeGoal, language, fetchVideos]);

  const goalMeta = GOAL_LABELS[activeGoal] ?? GOAL_LABELS.all;

  const toggleTopic = (topic: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(topic) ? next.delete(topic) : next.add(topic);
      return next;
    });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className={`bg-gradient-to-r ${goalMeta.color} text-white px-4 pt-12 pb-6`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>{goalMeta.emoji}</span> Video Lessons
            </h1>
            <p className="text-white/80 text-sm mt-0.5">{goalMeta.label} · {LANG_LABELS[language] ?? "English"}</p>
          </div>

          {/* Goal picker */}
          <button
            onClick={() => setShowGoalPicker(!showGoalPicker)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <BookOpen className="w-4 h-4" />
            <span>Goal</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showGoalPicker ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Goal picker dropdown */}
        <AnimatePresence>
          {showGoalPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-4 gap-2 mt-2"
            >
              {Object.entries(GOAL_LABELS).map(([id, meta]) => (
                <button
                  key={id}
                  onClick={() => { setActiveGoal(id); setShowGoalPicker(false); }}
                  className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium transition ${
                    activeGoal === id ? "bg-white text-gray-800 shadow-lg scale-105" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <span className="text-lg">{meta.emoji}</span>
                  <span className="mt-0.5 leading-tight text-center">{meta.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats pill */}
        {data && (
          <div className="flex items-center gap-2 mt-3">
            <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {data.totalVideos} curated videos
            </span>
            <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {data.sections.length} topics
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading videos for you…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <WifiOff className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <button
              onClick={() => fetchVideos(activeGoal, language)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && data.sections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <PlayCircle className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No videos found for this combination.</p>
            <button
              onClick={() => setActiveGoal("all")}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium"
            >
              Show All Topics
            </button>
          </div>
        )}

        {!loading && !error && data && data.sections.map((section, si) => {
          const open = expandedTopics.has(section.topic);
          return (
            <motion.div
              key={section.topic}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.05 }}
              className="mb-5"
            >
              {/* Section header */}
              <button
                onClick={() => toggleTopic(section.topic)}
                className="w-full flex items-center justify-between py-2 mb-2 border-b border-border"
              >
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary inline-block" />
                  {section.topic}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({section.videos.length})
                  </span>
                </h2>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {/* Grid of videos */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3 overflow-hidden"
                  >
                    {section.videos.map((v) => (
                      <VideoCard key={v.id} video={v} onPlay={setPlaying} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Player modal */}
      {playing && <PlayerModal video={playing} onClose={() => setPlaying(null)} />}

      <BottomNav />
    </div>
  );
};

export default VideosPage;
