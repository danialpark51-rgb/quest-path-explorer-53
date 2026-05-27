import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Lightbulb, Plus, Heart, User, Clock,
  BookOpen, Search, SlidersHorizontal, MessageSquare,
  Send, X, ChevronDown, ChevronUp, Zap, MapPin, Navigation,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

type Project = {
  id: number;
  username: string;
  fullName: string;
  title: string;
  description: string;
  subject: string;
  goal: string;
  classStandard: string;
  school: string;
  // Location fields — optional (null for older projects)
  city: string | null;
  state: string | null;
  likes: number;
  createdAt: string;
};

type Comment = {
  id: number;
  projectId: number;
  username: string;
  fullName: string;
  message: string;
  createdAt: string;
};

const SUBJECTS = [
  "All", "Mathematics", "Science", "Physics", "Chemistry", "Biology",
  "Social Studies", "History", "Geography", "Computer Science",
  "Environmental Science", "Arts", "Language", "Other",
];

const SUBJECT_EMOJI: Record<string, string> = {
  Mathematics: "🔢", Science: "🔬", Physics: "⚡", Chemistry: "🧪",
  Biology: "🌱", "Social Studies": "🌍", History: "📜", Geography: "🗺️",
  "Computer Science": "💻", "Environmental Science": "🌿",
  Arts: "🎨", Language: "📖", Other: "📌", All: "✨",
};

const GOAL_COLORS: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700", Medical: "bg-green-100 text-green-700",
  Commerce: "bg-yellow-100 text-yellow-700", Arts: "bg-purple-100 text-purple-700",
  IT: "bg-cyan-100 text-cyan-700", Defence: "bg-red-100 text-red-700",
  Govt: "bg-orange-100 text-orange-700",
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const { t } = useLanguage();

  const [tab, setTab] = useState<"all" | "mine">("all");
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "liked">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("eduapp-liked-projects") ?? "[]")); }
    catch { return new Set(); }
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Pre-fill from Problem Finder
  const [form, setForm] = useState<{
    title: string;
    description: string;
    subject: string;
    city: string;
    state: string;
  }>(() => {
    if (searchParams.get("prefill")) {
      try {
        const saved = sessionStorage.getItem("eduapp-prefill-project");
        if (saved) {
          sessionStorage.removeItem("eduapp-prefill-project");
          return { ...JSON.parse(saved), city: "", state: "" };
        }
      } catch { /* ignore */ }
    }
    return { title: "", description: "", subject: SUBJECTS[1], city: "", state: "" };
  });
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("prefill")) setShowForm(true);
  }, [searchParams]);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d: { projects: Project[] }) => setProjects(d.projects ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // GPS auto-fill: reverse-geocode coordinates to city/state using a free API
  const handleGPSPick = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json() as { address?: { city?: string; town?: string; village?: string; state?: string; country?: string } };
          const addr = d.address ?? {};
          const city  = addr.city ?? addr.town ?? addr.village ?? "";
          const state = addr.state ?? addr.country ?? "";
          setForm((f) => ({ ...f, city, state }));
        } catch {
          // Silently fail — user can fill manually
        } finally {
          setGpsLoading(false);
        }
      },
      () => setGpsLoading(false),
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username:      user.username,
          fullName:      user.fullName,
          title:         form.title.trim(),
          description:   form.description.trim(),
          subject:       form.subject,
          goal:          user.selectedGoal,
          classStandard: user.classStandard,
          school:        user.school,
          // Location — send only if filled; backend sanitizes and stores null if empty
          city:          form.city.trim() || undefined,
          state:         form.state.trim() || undefined,
        }),
      });
      setForm({ title: "", description: "", subject: SUBJECTS[1], city: "", state: "" });
      setShowForm(false);
      fetchProjects();
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (likedIds.has(id)) return;
    const newLiked = new Set(likedIds);
    newLiked.add(id);
    setLikedIds(newLiked);
    localStorage.setItem("eduapp-liked-projects", JSON.stringify([...newLiked]));
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    if (selectedProject?.id === id) setSelectedProject((p) => p ? { ...p, likes: p.likes + 1 } : p);
    await fetch(`/api/projects/${id}/like`, { method: "POST" });
  };

  // Filtering & sorting
  const displayed = projects
    .filter((p) => {
      if (tab === "mine" && p.username !== user?.username) return false;
      if (filterSubject !== "All" && p.subject !== filterSubject) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) ||
          p.fullName.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => sortBy === "liked" ? b.likes - a.likes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition text-sm">
            <ArrowLeft className="w-4 h-4" /> {t("proj.back")}
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">{t("proj.title")}</h1>
                <p className="text-sm text-primary-foreground/70">{t("proj.subtitle")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/problem-finder")}
                className="flex items-center gap-1.5 bg-orange-400/20 hover:bg-orange-400/30 text-orange-300 text-xs font-medium px-3 py-2 rounded-full transition"
              >
                <Zap className="w-3.5 h-3.5" />
                {t("pf.find_short")}
              </button>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-2 rounded-full transition"
              >
                <Plus className="w-4 h-4" />
                {t("proj.add")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-3">
        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4"
            >
              <h2 className="font-display font-bold text-foreground">{t("proj.form_heading")}</h2>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("proj.form_title")}</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t("proj.form_title_ph")} maxLength={100}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("proj.form_subject")}</label>
                <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition">
                  {SUBJECTS.slice(1).map((s) => <option key={s} value={s}>{SUBJECT_EMOJI[s]} {s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("proj.form_desc")}</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t("proj.form_desc_ph")} rows={4} maxLength={1000}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition resize-none" required />
                <p className="text-xs text-muted-foreground text-right">{form.description.length}/1000</p>
              </div>

              {/* Location fields */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location <span className="font-normal text-muted-foreground/60">(optional)</span>
                  </label>
                  {typeof navigator !== "undefined" && navigator.geolocation && (
                    <button type="button" onClick={handleGPSPick} disabled={gpsLoading}
                      className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition disabled:opacity-50">
                      <Navigation className="w-3 h-3" />
                      {gpsLoading ? "Detecting…" : "Use GPS"}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="City / Place"
                    maxLength={100}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
                  />
                  <input
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    placeholder="State / Country"
                    maxLength={100}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition">{t("proj.cancel")}</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
                  {submitting ? t("proj.submitting") : t("proj.submit")}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Search + Filter Bar */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t("proj.search_ph")}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition"
              />
            </div>
            <button onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${showFilters ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 bg-card"}`}>
              <SlidersHorizontal className="w-4 h-4" />
              {t("proj.filter")}
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="bg-card rounded-xl border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>{t("proj.filter_subject")}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setSortBy("newest")} className={`px-2 py-0.5 rounded-full border text-xs transition ${sortBy === "newest" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{t("proj.sort_new")}</button>
                      <button onClick={() => setSortBy("liked")} className={`px-2 py-0.5 rounded-full border text-xs transition ${sortBy === "liked" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{t("proj.sort_liked")}</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECTS.map((s) => (
                      <button key={s} onClick={() => setFilterSubject(s)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition ${filterSubject === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                        {SUBJECT_EMOJI[s]} {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted rounded-xl p-1">
          {(["all", "mine"] as const).map((v) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition ${tab === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {v === "all" ? t("proj.all") : t("proj.mine")}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        {!loading && (
          <p className="text-xs text-muted-foreground px-1">
            {displayed.length} {t("proj.count")}
            {filterSubject !== "All" && <> · {filterSubject}</>}
            {search && <> · "{search}"</>}
          </p>
        )}

        {/* Project List */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">{tab === "mine" ? t("proj.empty_mine") : t("proj.empty_all")}</p>
            {tab === "mine" && <button onClick={() => setShowForm(true)} className="text-primary text-sm font-medium hover:underline">{t("proj.be_first")}</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((proj, i) => {
              const isLiked = likedIds.has(proj.id);
              const isMine = proj.username === user?.username;
              return (
                <motion.div key={proj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-2xl border border-border shadow-card overflow-hidden cursor-pointer hover:border-primary/30 transition"
                  onClick={() => setSelectedProject(proj)}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-lg">{SUBJECT_EMOJI[proj.subject] ?? "📌"}</span>
                          <h3 className="font-display font-bold text-foreground text-sm leading-snug">{proj.title}</h3>
                          {isMine && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{t("proj.yours")}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground"><BookOpen className="w-2.5 h-2.5 inline mr-0.5" />{proj.subject}</span>
                          {proj.goal && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${GOAL_COLORS[proj.goal] ?? "bg-muted text-muted-foreground"}`}>{proj.goal}</span>}
                          {proj.classStandard && <span className="text-[10px] text-muted-foreground">Class {proj.classStandard}</span>}
                        </div>
                      </div>
                      <button onClick={(e) => handleLike(proj.id, e)} disabled={isLiked}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition flex-shrink-0 ${isLiked ? "bg-red-50 border-red-200 text-red-500" : "border-border text-muted-foreground hover:text-red-500 hover:border-red-200"}`}>
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        {proj.likes}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{proj.description}</p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground flex-1">{proj.fullName}</span>
                      <span className="text-xs text-primary flex items-center gap-1"><MessageSquare className="w-3 h-3" />{t("proj.view_chat")}</span>
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{new Date(proj.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            user={user}
            likedIds={likedIds}
            onLike={handleLike}
            onClose={() => setSelectedProject(null)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// Project Detail Modal with Comments/Chat
// ─────────────────────────────────────────────
type ModalProps = {
  project: Project;
  user: { username: string; fullName: string } | null;
  likedIds: Set<number>;
  onLike: (id: number, e?: React.MouseEvent) => void;
  onClose: () => void;
  t: (key: string) => string;
};

const ProjectDetailModal = ({ project, user, likedIds, onLike, onClose, t }: ModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLiked = likedIds.has(project.id);

  const fetchComments = useCallback(() => {
    fetch(`/api/projects/${project.id}/comments`)
      .then((r) => r.json())
      .then((d: { comments: Comment[] }) => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [project.id]);

  useEffect(() => {
    fetchComments();
    pollRef.current = setInterval(fetchComments, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchComments]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/projects/${project.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, fullName: user.fullName, message: message.trim() }),
      });
      setMessage("");
      fetchComments();
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-border shadow-xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-2xl">{SUBJECT_EMOJI[project.subject] ?? "📌"}</span>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-foreground text-sm leading-snug">{project.title}</h2>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{project.subject}</span>
                {project.goal && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${GOAL_COLORS[project.goal] ?? "bg-muted text-muted-foreground"}`}>{project.goal}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition ml-2 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Description */}
          <div>
            <p className={`text-sm text-foreground leading-relaxed ${showFull ? "" : "line-clamp-4"}`}>{project.description}</p>
            {project.description.length > 200 && (
              <button onClick={() => setShowFull(!showFull)} className="text-xs text-primary mt-1 flex items-center gap-0.5">
                {showFull ? <><ChevronUp className="w-3 h-3" />{t("proj.less")}</> : <><ChevronDown className="w-3 h-3" />{t("proj.more")}</>}
              </button>
            )}
          </div>

          {/* Author + Meta */}
          <div className="flex items-center gap-3 py-3 border-y border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {project.fullName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{project.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {project.school || "Student"}{project.classStandard ? ` · Class ${project.classStandard}` : ""}
              </p>
              {/* Location — shown only if present */}
              {(project.city || project.state) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-primary/60 flex-shrink-0" />
                  <span className="font-medium text-primary/80">Published from:</span>
                  {[project.school, project.city, project.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <button onClick={(e) => onLike(project.id, e)} disabled={isLiked}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition ${isLiked ? "bg-red-50 border-red-200 text-red-500" : "border-border text-muted-foreground hover:text-red-500"}`}>
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              {project.likes}
            </button>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              {t("proj.discussion")} {!loadingComments && `(${comments.length})`}
            </h3>

            {loadingComments ? (
              <div className="flex justify-center py-4"><div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">{t("proj.no_comments")}</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className={`flex gap-2.5 ${c.username === user?.username ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                      {c.fullName[0]?.toUpperCase()}
                    </div>
                    <div className={`max-w-[75%] ${c.username === user?.username ? "items-end" : "items-start"} flex flex-col`}>
                      <p className="text-[10px] text-muted-foreground mb-0.5">{c.fullName}</p>
                      <div className={`px-3 py-2 rounded-2xl text-sm ${c.username === user?.username ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        {c.message}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {new Date(c.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        {user && (
          <form onSubmit={sendComment} className="flex gap-2 p-3 border-t border-border flex-shrink-0 bg-card">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("proj.comment_ph")}
              maxLength={500}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
            />
            <button type="submit" disabled={sending || !message.trim()}
              className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 flex-shrink-0 hover:bg-primary/90 transition">
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProjectsPage;
