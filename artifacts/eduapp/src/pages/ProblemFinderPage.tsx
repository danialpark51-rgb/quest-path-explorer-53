/**
 * Problem Finder — Two tabs:
 *   1. AI Discover  — OpenAI-powered real-world problem discovery (unchanged)
 *   2. Community    — Student-submitted problems with support + comments
 *
 * Community problems are stored in localStorage (frontend-first architecture).
 * No backend changes required. FAB (+) opens the submit modal.
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Zap, Search, MapPin, ChevronRight,
  Lightbulb, AlertCircle, Loader2, FolderPlus,
  Plus, X, Heart, MessageSquare, Send, Share2,
  Trash2, ImagePlus, CheckCircle, BookOpen,
  Leaf, Cpu, Activity, Car, Wheat,
  Users, Eye, Globe, Droplets, Recycle,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────

type AIProblem = {
  title: string;
  emoji: string;
  domain: string;
  description: string;
  cause: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  location: string;
};

type CommunityComment = {
  id: string;
  username: string;
  fullName: string;
  message: string;
  createdAt: string;
};

type CommunityProblem = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  authorUsername: string;
  authorName: string;
  createdAt: string;
  supports: string[];     // usernames who supported
  comments: CommunityComment[];
  location?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const AI_GOALS = ["Engineering", "Medical", "Commerce", "Arts", "IT", "Defence", "Govt", "Science", "Agriculture", "Environment", "Technology"];

const CATEGORIES: { id: string; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "Education",        label: "Education",        icon: <BookOpen className="w-4 h-4" />,    color: "bg-blue-100 text-blue-700" },
  { id: "Environment",      label: "Environment",      icon: <Leaf className="w-4 h-4" />,         color: "bg-green-100 text-green-700" },
  { id: "Technology",       label: "Technology",       icon: <Cpu className="w-4 h-4" />,          color: "bg-violet-100 text-violet-700" },
  { id: "Health",           label: "Health",           icon: <Activity className="w-4 h-4" />,     color: "bg-red-100 text-red-700" },
  { id: "Transportation",   label: "Transportation",   icon: <Car className="w-4 h-4" />,          color: "bg-yellow-100 text-yellow-700" },
  { id: "Agriculture",      label: "Agriculture",      icon: <Wheat className="w-4 h-4" />,        color: "bg-amber-100 text-amber-700" },
  { id: "Community",        label: "Community",        icon: <Users className="w-4 h-4" />,        color: "bg-pink-100 text-pink-700" },
  { id: "Accessibility",    label: "Accessibility",    icon: <Eye className="w-4 h-4" />,          color: "bg-indigo-100 text-indigo-700" },
  { id: "Water Management", label: "Water Mgmt",       icon: <Droplets className="w-4 h-4" />,    color: "bg-cyan-100 text-cyan-700" },
  { id: "Waste Management", label: "Waste Mgmt",       icon: <Recycle className="w-4 h-4" />,     color: "bg-orange-100 text-orange-700" },
  { id: "Other",            label: "Other",            icon: <Globe className="w-4 h-4" />,        color: "bg-muted text-muted-foreground" },
];

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard:   "bg-red-100 text-red-700",
};

const STORAGE_KEY = "eduapp_community_problems";

function loadProblems(): CommunityProblem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CommunityProblem[]) : [];
  } catch { return []; }
}

function saveProblems(probs: CommunityProblem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(probs));
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function nanoid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProblemFinderPage = () => {
  const navigate     = useNavigate();
  const { user }     = useUser();
  const { t }        = useLanguage();

  const [tab, setTab] = useState<"ai" | "community">("ai");

  // ── AI tab state ───────────────────────────────────────────────────────────
  const [goal,         setGoal]         = useState(user?.selectedGoal || "Engineering");
  const [region,       setRegion]       = useState("");
  const [aiProblems,   setAiProblems]   = useState<AIProblem[]>([]);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiError,      setAiError]      = useState("");
  const [expandedIdx,  setExpandedIdx]  = useState<number | null>(null);
  const [aiDone,       setAiDone]       = useState(false);

  // ── Community tab state ────────────────────────────────────────────────────
  const [communityProbs, setCommunityProbs]   = useState<CommunityProblem[]>(loadProblems);
  const [filterCat,      setFilterCat]        = useState("All");
  const [expandedId,     setExpandedId]       = useState<string | null>(null);
  const [commentInputs,  setCommentInputs]    = useState<Record<string, string>>({});
  const [showSubmit,     setShowSubmit]       = useState(false);

  // ── Submit modal state ─────────────────────────────────────────────────────
  const [sTitle,       setSTitle]       = useState("");
  const [sDesc,        setSDesc]        = useState("");
  const [sCat,         setSCat]         = useState("Education");
  const [sLocation,    setSLocation]    = useState("");
  const [sImage,       setSImage]       = useState("");
  const [sSubmitting,  setSSubmitting]  = useState(false);
  const [sSuccess,     setSSuccess]     = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  // Persist to localStorage whenever communityProbs change
  useEffect(() => { saveProblems(communityProbs); }, [communityProbs]);

  // ── AI tab handlers ────────────────────────────────────────────────────────
  const handleFind = async () => {
    setAiLoading(true);
    setAiError("");
    setAiProblems([]);
    setAiDone(false);
    setExpandedIdx(null);
    try {
      const res = await fetch("/api/problem-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          region: region.trim() || "India",
          classStandard: user?.classStandard || "9",
        }),
      });
      const data = await res.json() as { problems?: AIProblem[]; error?: string };
      if (!res.ok || data.error) { setAiError(data.error ?? "Failed to generate problems"); return; }
      setAiProblems(data.problems ?? []);
      setAiDone(true);
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const useAsProject = (prob: AIProblem) => {
    sessionStorage.setItem("eduapp-prefill-project", JSON.stringify({
      title: prob.title,
      description: `Problem: ${prob.description}\n\nCause: ${prob.cause}\n\nImpact: ${prob.impact}`,
      subject: mapDomainToSubject(prob.domain),
    }));
    navigate("/projects?prefill=1");
  };

  // ── Community tab handlers ─────────────────────────────────────────────────
  const handleSupport = (id: string) => {
    if (!user) return;
    setCommunityProbs(prev => prev.map(p => {
      if (p.id !== id) return p;
      const alreadySupported = p.supports.includes(user.username);
      return {
        ...p,
        supports: alreadySupported
          ? p.supports.filter(u => u !== user.username)
          : [...p.supports, user.username],
      };
    }));
  };

  const handleComment = (id: string) => {
    if (!user) return;
    const msg = (commentInputs[id] ?? "").trim();
    if (!msg) return;
    const comment: CommunityComment = {
      id: nanoid(),
      username: user.username,
      fullName: user.fullName,
      message: msg,
      createdAt: new Date().toISOString(),
    };
    setCommunityProbs(prev => prev.map(p =>
      p.id === id ? { ...p, comments: [...p.comments, comment] } : p
    ));
    setCommentInputs(prev => ({ ...prev, [id]: "" }));
  };

  const handleDeleteComment = (probId: string, commentId: string) => {
    if (!user) return;
    setCommunityProbs(prev => prev.map(p =>
      p.id === probId
        ? { ...p, comments: p.comments.filter(c => !(c.id === commentId && c.username === user.username)) }
        : p
    ));
  };

  const handleDeleteProblem = (id: string) => {
    setCommunityProbs(prev => prev.filter(p => !(p.id === id && p.authorUsername === user?.username)));
  };

  const handleShare = (prob: CommunityProblem) => {
    const text = encodeURIComponent(`🚨 Real Problem: ${prob.title}\n${prob.description.slice(0, 100)}…\n#EduPath #ProblemFinder`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // ── Submit modal handlers ──────────────────────────────────────────────────
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = () => {
    if (!user || !sTitle.trim() || !sDesc.trim()) return;
    setSSubmitting(true);
    const newProblem: CommunityProblem = {
      id: nanoid(),
      title: sTitle.trim().slice(0, 120),
      description: sDesc.trim().slice(0, 1000),
      category: sCat,
      imageUrl: sImage || undefined,
      location: sLocation.trim() || undefined,
      authorUsername: user.username,
      authorName: user.fullName,
      createdAt: new Date().toISOString(),
      supports: [],
      comments: [],
    };
    setCommunityProbs(prev => [newProblem, ...prev]);
    setSSuccess(true);
    setSSubmitting(false);
    setTimeout(() => {
      setSTitle(""); setSDesc(""); setSCat("Education");
      setSLocation(""); setSImage(""); setSSuccess(false);
      setShowSubmit(false);
      setTab("community");
    }, 1400);
  };

  const displayedProbs = filterCat === "All"
    ? communityProbs
    : communityProbs.filter(p => p.category === filterCat);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-28 relative">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition text-sm">
            <ArrowLeft className="w-4 h-4" /> {t("pf.back")}
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-400/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">{t("pf.title")}</h1>
              <p className="text-sm text-primary-foreground/70">AI Discovery + Community Reporting</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="bg-card rounded-2xl border border-border p-1 flex gap-1 shadow-sm">
          <button
            onClick={() => setTab("ai")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === "ai"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" /> AI Discover
          </button>
          <button
            onClick={() => setTab("community")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === "community"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Community
            {communityProbs.length > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === "community" ? "bg-white/20" : "bg-primary/15 text-primary"
              }`}>{communityProbs.length}</span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════════════════════════════════
            TAB: AI DISCOVER (unchanged existing functionality)
        ══════════════════════════════════════════════════════════════════ */}
        {tab === "ai" && (
          <motion.div key="ai" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            className="max-w-2xl mx-auto px-4 mt-4 space-y-4">

            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
              {/* Goal picker */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">{t("pf.select_goal")}</label>
                <div className="flex flex-wrap gap-2">
                  {AI_GOALS.map((g) => (
                    <button key={g} onClick={() => setGoal(g)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                        goal === g
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >{g}</button>
                  ))}
                </div>
              </div>

              {/* Region input */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  {t("pf.region")} <span className="font-normal">({t("pf.optional")})</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={region} onChange={(e) => setRegion(e.target.value)}
                    placeholder={t("pf.region_ph")} maxLength={80}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <button onClick={handleFind} disabled={aiLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {aiLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{t("pf.finding")}</>
                  : <><Search className="w-4 h-4" />{t("pf.find")}</>}
              </button>
            </div>

            {aiError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{aiError}</p>
              </div>
            )}

            {aiLoading && (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            )}

            {aiDone && aiProblems.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("pf.no_results")}</p>
              </div>
            )}

            {aiProblems.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground px-1">
                  {t("pf.results_for")} <strong>{goal}</strong>{region ? ` · ${region}` : ""}
                </p>
                <div className="space-y-3">
                  {aiProblems.map((prob, i) => {
                    const isOpen = expandedIdx === i;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <button className="w-full text-left p-4 flex items-start gap-3"
                          onClick={() => setExpandedIdx(isOpen ? null : i)}>
                          <span className="text-2xl flex-shrink-0 mt-0.5">{prob.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-display font-bold text-foreground text-sm leading-snug">{prob.title}</h3>
                              <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{prob.domain}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLE[prob.difficulty]}`}>{prob.difficulty}</span>
                              {prob.location && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5" />{prob.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                                <DetailRow label={t("pf.description")} text={prob.description} />
                                <DetailRow label={t("pf.cause")} text={prob.cause} />
                                <DetailRow label={t("pf.impact")} text={prob.impact} />
                                <button onClick={() => useAsProject(prob)}
                                  className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition">
                                  <FolderPlus className="w-4 h-4" />
                                  {t("pf.use_project")}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: COMMUNITY PROBLEMS
        ══════════════════════════════════════════════════════════════════ */}
        {tab === "community" && (
          <motion.div key="community" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            className="max-w-2xl mx-auto px-4 mt-4 space-y-4">

            {/* Category filter strip */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setFilterCat("All")}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                  filterCat === "All" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
                }`}>All</button>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setFilterCat(cat.id)}
                  className={`shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                    filterCat === cat.id ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Problem count */}
            {displayedProbs.length > 0 && (
              <p className="text-xs text-muted-foreground px-1">
                {displayedProbs.length} problem{displayedProbs.length !== 1 ? "s" : ""} reported
                {filterCat !== "All" && ` · ${filterCat}`}
              </p>
            )}

            {/* Empty state */}
            {displayedProbs.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-4xl mx-auto">🚨</div>
                <div>
                  <p className="font-bold text-foreground text-lg">No problems reported yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to report a real-world problem in your community!
                  </p>
                </div>
                <button onClick={() => setShowSubmit(true)}
                  className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-semibold text-sm active:scale-95 transition-transform">
                  <Plus className="w-4 h-4" /> Report a Problem
                </button>
              </div>
            )}

            {/* Problem feed */}
            <div className="space-y-4">
              {displayedProbs.map(prob => {
                const catInfo    = CATEGORIES.find(c => c.id === prob.category) ?? CATEGORIES[CATEGORIES.length - 1];
                const isExpanded = expandedId === prob.id;
                const isSupported = prob.supports.includes(user?.username ?? "");
                const isMine     = prob.authorUsername === user?.username;

                return (
                  <motion.div key={prob.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">

                    {/* Problem image */}
                    {prob.imageUrl && (
                      <img src={prob.imageUrl} alt={prob.title}
                        className="w-full max-h-52 object-cover border-b border-border" />
                    )}

                    <div className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground leading-snug">{prob.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${catInfo.color}`}>
                              {catInfo.icon} {prob.category}
                            </span>
                            {prob.location && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />{prob.location}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">@{prob.authorUsername} · {fmtDate(prob.createdAt)}</span>
                          </div>
                        </div>
                        {isMine && (
                          <button onClick={() => handleDeleteProblem(prob.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {prob.description.length > 140 && !isExpanded
                          ? prob.description.slice(0, 140) + "…"
                          : prob.description}
                      </p>
                      {prob.description.length > 140 && (
                        <button onClick={() => setExpandedId(isExpanded ? null : prob.id)}
                          className="text-xs text-primary font-medium">
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}

                      {/* Action bar */}
                      <div className="flex items-center gap-3 pt-1">
                        {/* Support */}
                        <button onClick={() => handleSupport(prob.id)}
                          className={`flex items-center gap-1.5 text-sm font-medium transition-colors active:scale-90 ${
                            isSupported ? "text-orange-500" : "text-muted-foreground hover:text-orange-400"
                          }`}>
                          <Heart className={`w-4 h-4 ${isSupported ? "fill-orange-500" : ""}`} />
                          <span>{prob.supports.length}</span>
                          <span className="text-xs">{isSupported ? "Supported" : "Support"}</span>
                        </button>

                        {/* Comments */}
                        <button onClick={() => setExpandedId(expandedId === prob.id ? null : prob.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>{prob.comments.length}</span>
                        </button>

                        {/* Share */}
                        <button onClick={() => handleShare(prob)}
                          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-green-500 transition-colors">
                          <Share2 className="w-3.5 h-3.5" />
                          Share
                        </button>

                        {/* Use as Project */}
                        <button
                          onClick={() => {
                            sessionStorage.setItem("eduapp-prefill-project", JSON.stringify({
                              title: prob.title,
                              description: `Community Problem: ${prob.description}`,
                              subject: mapDomainToSubject(prob.category),
                            }));
                            navigate("/projects?prefill=1");
                          }}
                          className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                        >
                          <FolderPlus className="w-3 h-3" /> Use as Project
                        </button>
                      </div>

                      {/* Comments section */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="border-t border-border pt-3 space-y-3">
                              {prob.comments.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Share your thoughts!</p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {prob.comments.map(c => (
                                    <div key={c.id} className="flex items-start gap-2">
                                      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                        {c.fullName?.[0]?.toUpperCase() ?? "?"}
                                      </div>
                                      <div className="bg-muted rounded-xl px-3 py-2 flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs font-semibold text-foreground">{c.fullName}</p>
                                          {c.username === user?.username && (
                                            <button onClick={() => handleDeleteComment(prob.id, c.id)}
                                              className="text-muted-foreground hover:text-destructive transition-colors">
                                              <X className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{c.message}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Comment input */}
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                  {user?.fullName?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <div className="flex-1 flex items-center gap-1 bg-muted rounded-full px-3 py-1.5">
                                  <input
                                    value={commentInputs[prob.id] ?? ""}
                                    onChange={e => setCommentInputs(prev => ({ ...prev, [prob.id]: e.target.value }))}
                                    onKeyDown={e => e.key === "Enter" && handleComment(prob.id)}
                                    placeholder="Share your thoughts…"
                                    maxLength={300}
                                    className="flex-1 bg-transparent text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
                                  />
                                  <button onClick={() => handleComment(prob.id)}
                                    disabled={!(commentInputs[prob.id] ?? "").trim()}
                                    className="text-primary disabled:opacity-40">
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Floating Action Button (+) ─────────────────────────────────────── */}
      <button
        onClick={() => setShowSubmit(true)}
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center active:scale-90 transition-all hover:bg-primary/90"
        aria-label="Report a problem"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* ── Submit Problem Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showSubmit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className="bg-card rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10 rounded-t-3xl">
                <div>
                  <h2 className="font-bold text-foreground text-base">Report a Problem</h2>
                  <p className="text-xs text-muted-foreground">Share a real-world issue in your community</p>
                </div>
                <button onClick={() => { setShowSubmit(false); setSSuccess(false); }}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sSuccess ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </motion.div>
                  <p className="font-bold text-foreground text-lg">Problem Reported!</p>
                  <p className="text-sm text-muted-foreground">Your report is now live in the community feed.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Category *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setSCat(cat.id)}
                          className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                            sCat === cat.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40"
                          }`}>
                          <span className={`p-1.5 rounded-lg ${cat.color}`}>{cat.icon}</span>
                          <span className="text-[10px] leading-tight text-center">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Problem Title *</label>
                    <input
                      value={sTitle}
                      onChange={e => setSTitle(e.target.value)}
                      placeholder="e.g. Broken streetlights near our school"
                      maxLength={120}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description *</label>
                    <textarea
                      value={sDesc}
                      onChange={e => setSDesc(e.target.value)}
                      placeholder="Describe the problem in detail — what's happening, who it affects, and why it needs to be solved…"
                      maxLength={1000}
                      rows={4}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground text-right mt-0.5">{sDesc.length}/1000</p>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Location (optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={sLocation}
                        onChange={e => setSLocation(e.target.value)}
                        placeholder="e.g. Koramangala, Bengaluru"
                        maxLength={100}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Image upload */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Photo (optional)</label>
                    {sImage ? (
                      <div className="relative">
                        <img src={sImage} alt="preview" className="w-full max-h-40 object-cover rounded-xl border border-border" />
                        <button onClick={() => setSImage("")}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Add a photo</span>
                        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                      </label>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={sSubmitting || !sTitle.trim() || !sDesc.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {sSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Publish to Community
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

// ─── Helper components ────────────────────────────────────────────────────────

const DetailRow = ({ label, text }: { label: string; text: string }) => (
  <div>
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm text-foreground leading-relaxed">{text}</p>
  </div>
);

function mapDomainToSubject(domain: string): string {
  const map: Record<string, string> = {
    Robotics: "Computer Science", Electronics: "Physics", Nutrition: "Biology",
    Medicine: "Biology", Finance: "Mathematics", Economics: "Mathematics",
    Agriculture: "Environmental Science", Climate: "Environmental Science",
    Environment: "Environmental Science", Programming: "Computer Science",
    Astronomy: "Science", Chemistry: "Chemistry", History: "History",
    Geography: "Geography", Arts: "Arts",
    Education: "Social Science", Technology: "Computer Science",
    Health: "Biology", Transportation: "Science",
    Community: "Social Science", Accessibility: "Social Science",
    Water: "Environmental Science", Waste: "Environmental Science",
  };
  for (const [k, v] of Object.entries(map)) {
    if (domain.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "Science";
}

export default ProblemFinderPage;
