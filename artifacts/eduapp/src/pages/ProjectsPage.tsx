import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lightbulb, Plus, Heart, User, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
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
  likes: number;
  createdAt: string;
};

const SUBJECTS = [
  "Mathematics", "Science", "Physics", "Chemistry", "Biology",
  "Social Studies", "History", "Geography", "Computer Science",
  "Environmental Science", "Arts", "Language", "Other",
];

const SUBJECT_EMOJI: Record<string, string> = {
  Mathematics: "🔢", Science: "🔬", Physics: "⚡", Chemistry: "🧪",
  Biology: "🌱", "Social Studies": "🌍", History: "📜", Geography: "🗺️",
  "Computer Science": "💻", "Environmental Science": "🌿",
  Arts: "🎨", Language: "📖", Other: "📌",
};

const GOAL_COLORS: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700", Medical: "bg-green-100 text-green-700",
  Commerce: "bg-yellow-100 text-yellow-700", Arts: "bg-purple-100 text-purple-700",
  IT: "bg-cyan-100 text-cyan-700", Defence: "bg-red-100 text-red-700",
  Govt: "bg-orange-100 text-orange-700",
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useLanguage();

  const [tab, setTab] = useState<"all" | "mine">("all");
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("eduapp-liked-projects") ?? "[]")); }
    catch { return new Set(); }
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [form, setForm] = useState({ title: "", description: "", subject: SUBJECTS[0] });

  const fetchProjects = () => {
    setLoading(true);
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d: { projects: Project[] }) => setProjects(d.projects ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          fullName: user.fullName,
          title: form.title.trim(),
          description: form.description.trim(),
          subject: form.subject,
          goal: user.selectedGoal,
          classStandard: user.classStandard,
          school: user.school,
        }),
      });
      setForm({ title: "", description: "", subject: SUBJECTS[0] });
      setShowForm(false);
      fetchProjects();
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: number) => {
    if (likedIds.has(id)) return;
    const newLiked = new Set(likedIds);
    newLiked.add(id);
    setLikedIds(newLiked);
    localStorage.setItem("eduapp-liked-projects", JSON.stringify([...newLiked]));
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    await fetch(`/api/projects/${id}/like`, { method: "POST" });
  };

  const displayed = tab === "mine"
    ? projects.filter((p) => p.username === user?.username)
    : projects;

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

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">
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
                <input
                  value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t("proj.form_title_ph")}
                  maxLength={100}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("proj.form_subject")}</label>
                <select
                  value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
                >
                  {SUBJECTS.map((s) => <option key={s} value={s}>{SUBJECT_EMOJI[s]} {s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("proj.form_desc")}</label>
                <textarea
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t("proj.form_desc_ph")}
                  rows={4} maxLength={1000}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground text-right">{form.description.length}/1000</p>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition">
                  {t("proj.cancel")}
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
                  {submitting ? t("proj.submitting") : t("proj.submit")}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted rounded-xl p-1">
          {(["all", "mine"] as const).map((v) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition ${tab === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {v === "all" ? t("proj.all") : t("proj.mine")}
            </button>
          ))}
        </div>

        {/* Project List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">
              {tab === "mine" ? t("proj.empty_mine") : t("proj.empty_all")}
            </p>
            {tab === "mine" && (
              <button onClick={() => setShowForm(true)} className="text-primary text-sm font-medium hover:underline">
                {t("proj.be_first")}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((proj, i) => {
              const isExpanded = expandedId === proj.id;
              const isLiked = likedIds.has(proj.id);
              const isMine = proj.username === user?.username;
              return (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                >
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-lg">{SUBJECT_EMOJI[proj.subject] ?? "📌"}</span>
                          <h3 className="font-display font-bold text-foreground text-sm leading-snug">{proj.title}</h3>
                          {isMine && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{t("proj.yours")}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground`}>
                            <BookOpen className="w-2.5 h-2.5 inline mr-0.5" />{proj.subject}
                          </span>
                          {proj.goal && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${GOAL_COLORS[proj.goal] ?? "bg-muted text-muted-foreground"}`}>{proj.goal}</span>}
                          {proj.classStandard && <span className="text-[10px] text-muted-foreground">Class {proj.classStandard}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleLike(proj.id)} disabled={isLiked}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition flex-shrink-0 ${isLiked ? "bg-red-50 border-red-200 text-red-500" : "border-border text-muted-foreground hover:text-red-500 hover:border-red-200"}`}>
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        {proj.likes}
                      </button>
                    </div>

                    {/* Description */}
                    <p className={`text-sm text-muted-foreground leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                      {proj.description}
                    </p>
                    {proj.description.length > 120 && (
                      <button onClick={() => setExpandedId(isExpanded ? null : proj.id)}
                        className="text-xs text-primary mt-1 flex items-center gap-0.5 hover:underline">
                        {isExpanded ? <><ChevronUp className="w-3 h-3" />{t("proj.less")}</> : <><ChevronDown className="w-3 h-3" />{t("proj.more")}</>}
                      </button>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground flex-1">{proj.fullName}</span>
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{new Date(proj.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ProjectsPage;
