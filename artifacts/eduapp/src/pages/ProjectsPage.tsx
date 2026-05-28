import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Lightbulb, Plus, Heart, Clock,
  BookOpen, Search, SlidersHorizontal, MessageSquare,
  Send, X, ChevronDown, ChevronUp, Zap, MapPin, Navigation,
  CheckCircle2, AlertCircle, Loader2, Pencil, Trash2, TriangleAlert,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type ProjectForm = {
  title: string;
  description: string;
  subject: string;
  city: string;
  state: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

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
  Engineering: "bg-blue-100 text-blue-700",  Medical: "bg-green-100 text-green-700",
  Commerce:    "bg-yellow-100 text-yellow-700", Arts: "bg-purple-100 text-purple-700",
  IT:          "bg-cyan-100 text-cyan-700",   Defence: "bg-red-100 text-red-700",
  Govt:        "bg-orange-100 text-orange-700",
};

const EMPTY_FORM: ProjectForm = { title: "", description: "", subject: SUBJECTS[1], city: "", state: "" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function parseApiError(res: Response, fallback: string): Promise<string> {
  try { const b = await res.json() as { error?: string }; return b.error ?? fallback; }
  catch { return fallback; }
}

// ─── Toasts / dialogs ─────────────────────────────────────────────────────────

const SuccessToast = ({ message, onDone }: { message: string; onDone: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    transition={{ type: "spring", damping: 18, stiffness: 260 }}
    onAnimationComplete={() => setTimeout(onDone, 2400)}
    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-green-500 text-white font-semibold text-sm px-5 py-3 rounded-full shadow-xl pointer-events-none whitespace-nowrap"
  >
    <CheckCircle2 className="w-4 h-4" /> {message}
  </motion.div>
);

// ─── Project Form (shared by Create + Edit) ───────────────────────────────────

type ProjectFormPanelProps = {
  heading: string;
  submitLabel: string;
  form: ProjectForm;
  onChange: (f: ProjectForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
};

const ProjectFormPanel = ({
  heading, submitLabel, form, onChange, onSubmit, onCancel, submitting, error,
}: ProjectFormPanelProps) => {
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json() as {
            address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
          };
          const addr = d.address ?? {};
          onChange({ ...form, city: addr.city ?? addr.town ?? addr.village ?? "", state: addr.state ?? addr.country ?? "" });
        } catch { /**/ } finally { setGpsLoading(false); }
      },
      () => setGpsLoading(false),
      { timeout: 8000 }
    );
  };

  return (
    <form onSubmit={onSubmit} className="p-5 space-y-4">
      <h2 className="font-display font-bold text-foreground">{heading}</h2>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Project Title *</label>
        <input value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="Give your project a clear title" maxLength={100} required
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition" />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Subject *</label>
        <select value={form.subject} onChange={(e) => onChange({ ...form, subject: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition">
          {SUBJECTS.slice(1).map((s) => <option key={s} value={s}>{SUBJECT_EMOJI[s]} {s}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description *</label>
        <textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Explain your project idea, method, and expected outcome…" rows={4} maxLength={1000} required
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition resize-none" />
        <p className="text-xs text-muted-foreground text-right">{form.description.length}/1000</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Location <span className="font-normal opacity-60 ml-1">(optional)</span>
          </label>
          {typeof navigator !== "undefined" && navigator.geolocation && (
            <button type="button" onClick={handleGPS} disabled={gpsLoading}
              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition disabled:opacity-50">
              {gpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
              {gpsLoading ? "Detecting…" : "Use GPS"}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input value={form.city} onChange={(e) => onChange({ ...form, city: e.target.value })}
            placeholder="City / Place" maxLength={100}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition" />
          <input value={form.state} onChange={(e) => onChange({ ...form, state: e.target.value })}
            placeholder="State / Country" maxLength={100}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition" />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:bg-muted transition">
          Cancel
        </button>
        <button type="submit" disabled={submitting || !form.title.trim() || !form.description.trim()}
          className="flex-1 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : submitLabel}
        </button>
      </div>
    </form>
  );
};

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

type DeleteDialogProps = {
  projectTitle: string;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteDialog = ({ projectTitle, deleting, error, onConfirm, onCancel }: DeleteDialogProps) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 300 }}
      className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <TriangleAlert className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="font-display font-bold text-foreground text-center text-lg mb-1">Delete Project?</h3>
      <p className="text-sm text-muted-foreground text-center mb-1">
        This will permanently delete
      </p>
      <p className="text-sm font-semibold text-foreground text-center mb-4 line-clamp-2">"{projectTitle}"</p>
      <p className="text-xs text-muted-foreground text-center mb-5">
        All comments and discussions will also be deleted. This cannot be undone.
      </p>
      {error && (
        <p className="text-xs text-red-600 text-center mb-3 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition">
          Keep it
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white py-2.5 text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
          {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</> : <><Trash2 className="w-4 h-4" /> Delete</>}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProjectsPage = () => {
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const { user }    = useUser();
  const { t }       = useLanguage();

  const [tab, setTab]               = useState<"all" | "mine">("all");
  const [showForm, setShowForm]     = useState(false);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Create form
  const [createForm, setCreateForm]     = useState<ProjectForm>(EMPTY_FORM);
  const [creating, setCreating]         = useState(false);
  const [createError, setCreateError]   = useState<string | null>(null);

  // Edit modal
  const [editingProject, setEditingProject]   = useState<Project | null>(null);
  const [editForm, setEditForm]               = useState<ProjectForm>(EMPTY_FORM);
  const [editing, setEditing]                 = useState(false);
  const [editError, setEditError]             = useState<string | null>(null);

  // Delete dialog
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleting, setDeleting]               = useState(false);
  const [deleteError, setDeleteError]         = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Misc
  const [search, setSearch]               = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [sortBy, setSortBy]               = useState<"newest" | "liked">("newest");
  const [showFilters, setShowFilters]     = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("eduapp-liked-projects") ?? "[]")); }
    catch { return new Set(); }
  });

  // Pre-fill from Problem Finder
  useEffect(() => {
    if (searchParams.get("prefill")) {
      try {
        const saved = sessionStorage.getItem("eduapp-prefill-project");
        if (saved) {
          sessionStorage.removeItem("eduapp-prefill-project");
          setCreateForm({ ...JSON.parse(saved), city: "", state: "" });
        }
      } catch { /**/ }
      setShowForm(true);
    }
  }, [searchParams]);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(() => {
    setLoading(true);
    setFetchError(false);
    fetch("/api/projects")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: { projects: Project[] }) => setProjects(d.projects ?? []))
      .catch(() => { setProjects([]); setFetchError(true); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Create ───────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !createForm.title.trim() || !createForm.description.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username, fullName: user.fullName,
          title: createForm.title.trim(), description: createForm.description.trim(),
          subject: createForm.subject, goal: user.selectedGoal,
          classStandard: user.classStandard, school: user.school,
          city: createForm.city.trim() || undefined,
          state: createForm.state.trim() || undefined,
        }),
      });
      if (!res.ok) { setCreateError(await parseApiError(res, `Server error (${res.status})`)); return; }
      setCreateForm(EMPTY_FORM);
      setShowForm(false);
      setTab("all");
      fetchProjects();
      setToast("Project published! 🎉");
    } catch { setCreateError("Network error — please check your connection."); }
    finally { setCreating(false); }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────

  const openEdit = (proj: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProject(proj);
    setEditForm({ title: proj.title, description: proj.description, subject: proj.subject, city: proj.city ?? "", state: proj.state ?? "" });
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingProject || !editForm.title.trim() || !editForm.description.trim()) return;
    setEditing(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          subject: editForm.subject,
          city: editForm.city.trim() || null,
          state: editForm.state.trim() || null,
        }),
      });
      if (!res.ok) { setEditError(await parseApiError(res, `Server error (${res.status})`)); return; }
      const updated = await res.json() as Project;
      // Patch in-place across all state
      setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      if (selectedProject?.id === updated.id) setSelectedProject(updated);
      setEditingProject(null);
      setToast("Project updated! ✏️");
    } catch { setEditError("Network error — please check your connection."); }
    finally { setEditing(false); }
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const openDelete = (proj: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingProject(proj);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!user || !deletingProject) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username }),
      });
      if (!res.ok) { setDeleteError(await parseApiError(res, `Server error (${res.status})`)); return; }
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      if (selectedProject?.id === deletingProject.id) setSelectedProject(null);
      setDeletingProject(null);
      setToast("Project deleted.");
    } catch { setDeleteError("Network error — please try again."); }
    finally { setDeleting(false); }
  };

  // ── Like ─────────────────────────────────────────────────────────────────

  const handleLike = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (likedIds.has(id)) return;
    const next = new Set(likedIds); next.add(id);
    setLikedIds(next);
    localStorage.setItem("eduapp-liked-projects", JSON.stringify([...next]));
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    if (selectedProject?.id === id) setSelectedProject((p) => p ? { ...p, likes: p.likes + 1 } : p);
    try { await fetch(`/api/projects/${id}/like`, { method: "POST" }); } catch { /**/ }
  };

  // ── Filter / sort ─────────────────────────────────────────────────────────

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
    .sort((a, b) =>
      sortBy === "liked"
        ? b.likes - a.likes
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const myCount = projects.filter((p) => p.username === user?.username).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition text-sm">
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
              <button onClick={() => navigate("/problem-finder")}
                className="flex items-center gap-1.5 bg-orange-400/20 hover:bg-orange-400/30 text-orange-300 text-xs font-medium px-3 py-2 rounded-full transition">
                <Zap className="w-3.5 h-3.5" /> {t("pf.find_short")}
              </button>
              <button
                onClick={() => { setShowForm((v) => !v); setCreateError(null); }}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-2 rounded-full transition">
                <Plus className="w-4 h-4" /> {t("proj.add")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-3">

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
            >
              <ProjectFormPanel
                heading={t("proj.form_heading")}
                submitLabel={`${t("proj.submit")} 🚀`}
                form={createForm}
                onChange={setCreateForm}
                onSubmit={handleCreate}
                onCancel={() => { setShowForm(false); setCreateError(null); }}
                submitting={creating}
                error={createError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + filter */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t("proj.search_ph")}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary transition" />
            </div>
            <button onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                showFilters ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 bg-card"
              }`}>
              <SlidersHorizontal className="w-4 h-4" /> {t("proj.filter")}
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-card rounded-xl border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>{t("proj.filter_subject")}</span>
                    <div className="flex gap-1">
                      {(["newest", "liked"] as const).map((s) => (
                        <button key={s} onClick={() => setSortBy(s)}
                          className={`px-2 py-0.5 rounded-full border text-xs transition ${sortBy === s ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                          {s === "newest" ? t("proj.sort_new") : t("proj.sort_liked")}
                        </button>
                      ))}
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
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5 ${tab === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {v === "all" ? t("proj.all") : (
                <>{t("proj.mine")}{myCount > 0 && <span className="text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">{myCount}</span>}</>
              )}
            </button>
          ))}
        </div>

        {/* Fetch error */}
        {fetchError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">Couldn't load projects. Check your connection.</p>
            <button onClick={fetchProjects} className="text-xs text-red-600 font-semibold hover:underline">Retry</button>
          </div>
        )}

        {/* Stats */}
        {!loading && !fetchError && (
          <p className="text-xs text-muted-foreground px-1">
            {displayed.length} {t("proj.count")}
            {filterSubject !== "All" && <> · {filterSubject}</>}
            {search && <> · "{search}"</>}
          </p>
        )}

        {/* Project list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading projects…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm font-medium">
              {tab === "mine" ? "You haven't published any projects yet" : "No projects found"}
            </p>
            <p className="text-xs text-muted-foreground">
              {tab === "mine" ? "Share your first project and get feedback from students across India!"
                : filterSubject !== "All" || search ? "Try adjusting your filters" : "Be the first to share a project!"}
            </p>
            {tab === "mine" && (
              <button onClick={() => { setShowForm(true); setCreateError(null); }}
                className="mt-2 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition">
                <Plus className="w-4 h-4" /> Publish your first project
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((proj, i) => {
              const isLiked = likedIds.has(proj.id);
              const isMine  = proj.username === user?.username;
              return (
                <motion.div key={proj.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-2xl border border-border shadow-card overflow-hidden cursor-pointer hover:border-primary/30 transition"
                  onClick={() => setSelectedProject(proj)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-lg">{SUBJECT_EMOJI[proj.subject] ?? "📌"}</span>
                          <h3 className="font-display font-bold text-foreground text-sm leading-snug">{proj.title}</h3>
                          {isMine && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{t("proj.yours")}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                            <BookOpen className="w-2.5 h-2.5 inline mr-0.5" />{proj.subject}
                          </span>
                          {proj.goal && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${GOAL_COLORS[proj.goal] ?? "bg-muted text-muted-foreground"}`}>{proj.goal}</span>}
                          {proj.classStandard && <span className="text-[10px] text-muted-foreground">Class {proj.classStandard}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Edit + Delete — only for owner */}
                        {isMine && (
                          <>
                            <button
                              onClick={(e) => openEdit(proj, e)}
                              title="Edit project"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => openDelete(proj, e)}
                              title="Delete project"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button onClick={(e) => handleLike(proj.id, e)} disabled={isLiked}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition ${isLiked ? "bg-red-50 border-red-200 text-red-500" : "border-border text-muted-foreground hover:text-red-500 hover:border-red-200"}`}>
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                          {proj.likes}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{proj.description}</p>

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                        {proj.fullName[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs text-muted-foreground flex-1 truncate">{proj.fullName}</span>
                      {(proj.city || proj.state) && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
                          <MapPin className="w-2.5 h-2.5" />
                          {[proj.city, proj.state].filter(Boolean).join(", ")}
                        </span>
                      )}
                      <span className="text-xs text-primary flex items-center gap-1 flex-shrink-0">
                        <MessageSquare className="w-3 h-3" />{t("proj.view_chat")}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(proj.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            user={user}
            likedIds={likedIds}
            onLike={handleLike}
            onEdit={(proj) => { setSelectedProject(null); setTimeout(() => openEdit(proj), 150); }}
            onDelete={(proj) => { setSelectedProject(null); setTimeout(() => openDelete(proj), 150); }}
            onClose={() => setSelectedProject(null)}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* ── Edit modal ── */}
      <AnimatePresence>
        {editingProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => { setEditingProject(null); setEditError(null); }}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-border shadow-xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Edit modal header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Pencil className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-display font-bold text-foreground">Edit Project</span>
                </div>
                <button onClick={() => { setEditingProject(null); setEditError(null); }}
                  className="p-1.5 rounded-full hover:bg-muted transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ProjectFormPanel
                heading=""
                submitLabel="Save Changes ✓"
                form={editForm}
                onChange={setEditForm}
                onSubmit={handleEdit}
                onCancel={() => { setEditingProject(null); setEditError(null); }}
                submitting={editing}
                error={editError}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete dialog ── */}
      <AnimatePresence>
        {deletingProject && (
          <DeleteDialog
            projectTitle={deletingProject.title}
            deleting={deleting}
            error={deleteError}
            onConfirm={handleDelete}
            onCancel={() => { setDeletingProject(null); setDeleteError(null); }}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

// ─── Project Detail Modal ─────────────────────────────────────────────────────

type ModalProps = {
  project: Project;
  user: { username: string; fullName: string } | null;
  likedIds: Set<number>;
  onLike: (id: number, e?: React.MouseEvent) => void;
  onEdit: (proj: Project) => void;
  onDelete: (proj: Project) => void;
  onClose: () => void;
  t: (key: string) => string;
};

const ProjectDetailModal = ({ project, user, likedIds, onLike, onEdit, onDelete, onClose, t }: ModalProps) => {
  const [comments, setComments]           = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [message, setMessage]             = useState("");
  const [sending, setSending]             = useState(false);
  const [sendError, setSendError]         = useState<string | null>(null);
  const [showFull, setShowFull]           = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLiked  = likedIds.has(project.id);
  const isMine   = project.username === user?.username;

  const fetchComments = useCallback(() => {
    fetch(`/api/projects/${project.id}/comments`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: { comments: Comment[] }) => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [project.id]);

  useEffect(() => {
    fetchComments();
    pollRef.current = setInterval(fetchComments, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchComments]);

  useEffect(() => { commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    setSending(true); setSendError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, fullName: user.fullName, message: message.trim() }),
      });
      if (!res.ok) { setSendError(await parseApiError(res, `Error (${res.status})`)); return; }
      setMessage(""); fetchComments();
    } catch { setSendError("Network error — couldn't send."); }
    finally { setSending(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-border shadow-xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}>

        {/* Modal header */}
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
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {/* Edit / Delete buttons — only for project owner */}
            {isMine && (
              <>
                <button onClick={() => onEdit(project)} title="Edit"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(project)} title="Delete"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <div>
            <p className={`text-sm text-foreground leading-relaxed ${showFull ? "" : "line-clamp-4"}`}>{project.description}</p>
            {project.description.length > 200 && (
              <button onClick={() => setShowFull(!showFull)} className="text-xs text-primary mt-1 flex items-center gap-0.5">
                {showFull ? <><ChevronUp className="w-3 h-3" />{t("proj.less")}</> : <><ChevronDown className="w-3 h-3" />{t("proj.more")}</>}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 py-3 border-y border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {project.fullName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{project.fullName}</p>
              <p className="text-xs text-muted-foreground">{project.school || "Student"}{project.classStandard ? ` · Class ${project.classStandard}` : ""}</p>
              {(project.city || project.state) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-primary/60 flex-shrink-0" />
                  <span className="font-medium text-primary/80">Published from:</span>
                  {[project.school, project.city, project.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <button onClick={(e) => onLike(project.id, e)} disabled={isLiked}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition flex-shrink-0 ${isLiked ? "bg-red-50 border-red-200 text-red-500" : "border-border text-muted-foreground hover:text-red-500"}`}>
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              {project.likes}
            </button>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              {t("proj.discussion")} {!loadingComments && `(${comments.length})`}
            </h3>
            {loadingComments ? (
              <div className="flex justify-center py-4"><div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 bg-muted/50 rounded-xl">💬 No messages yet — start the discussion!</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className={`flex gap-2.5 ${c.username === user?.username ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                      {c.fullName[0]?.toUpperCase()}
                    </div>
                    <div className={`flex-1 max-w-[80%] flex flex-col ${c.username === user?.username ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] text-muted-foreground mb-0.5 px-1">{c.username === user?.username ? "You" : c.fullName}</span>
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${c.username === user?.username ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        {c.message}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                        {new Date(c.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-border flex-shrink-0">
          {sendError && (
            <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {sendError}
            </p>
          )}
          <form onSubmit={sendComment} className="flex gap-2">
            <input value={message}
              onChange={(e) => { setMessage(e.target.value); if (sendError) setSendError(null); }}
              placeholder={user ? t("proj.msg_ph") : "Login to comment…"}
              maxLength={500} disabled={!user || sending}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition disabled:opacity-60" />
            <button type="submit" disabled={!user || !message.trim() || sending}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition hover:bg-primary/90 disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectsPage;
