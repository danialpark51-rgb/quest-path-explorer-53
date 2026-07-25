/**
 * Internships Page — AI-powered internship recommendations
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, ArrowLeft, Search, AlertCircle,
  RotateCcw, ExternalLink, ChevronDown, ChevronUp,
  MapPin, Clock, DollarSign, Wifi, Building2, Lightbulb,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Internship {
  name: string;
  emoji: string;
  company: string;
  location: string;
  mode: "Online" | "Offline" | "Hybrid";
  requiredSkills: string[];
  duration: string;
  stipend: string;
  officialWebsite: string;
  applicationGuide: string[];
  eligibility: string;
  lastDate: string;
  description: string;
  category: string;
  matchScore: number;
}

interface Platform {
  name: string;
  url: string;
  description: string;
}

interface InternshipsResult {
  summary: string;
  internships: Internship[];
  platforms: Platform[];
  tips: string[];
}

// ─── Mode Badge ───────────────────────────────────────────────────────────────

const ModeBadge = ({ mode }: { mode: string }) => {
  const map: Record<string, string> = {
    Online:  "bg-green-100 text-green-700",
    Offline: "bg-blue-100 text-blue-700",
    Hybrid:  "bg-purple-100 text-purple-700",
  };
  const icons: Record<string, React.ReactNode> = {
    Online:  <Wifi className="w-3 h-3" />,
    Offline: <Building2 className="w-3 h-3" />,
    Hybrid:  <Wifi className="w-3 h-3" />,
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit ${map[mode] ?? "bg-muted text-muted-foreground"}`}>
      {icons[mode]} {mode}
    </span>
  );
};

// ─── Internship Card ──────────────────────────────────────────────────────────

const InternshipCard = ({ item, index }: { item: Internship; index: number }) => {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20 flex items-center justify-center text-2xl flex-shrink-0">
          {item.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <ModeBadge mode={item.mode} />
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {item.matchScore}% match
            </span>
          </div>
          <p className="font-semibold text-foreground text-sm leading-tight">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.company}</p>
        </div>
        {expanded
          ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-4">

              {/* Quick info grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-xs font-semibold text-muted-foreground">Location</p>
                  </div>
                  <p className="text-sm text-foreground font-medium">{item.location}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-green-500" />
                    <p className="text-xs font-semibold text-muted-foreground">Duration</p>
                  </div>
                  <p className="text-sm text-foreground font-medium">{item.duration}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    <p className="text-xs font-semibold text-muted-foreground">Stipend</p>
                  </div>
                  <p className="text-sm text-foreground font-medium">{item.stipend}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">📅</span>
                    <p className="text-xs font-semibold text-muted-foreground">Last Date</p>
                  </div>
                  <p className="text-sm text-foreground font-medium">{item.lastDate}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">About</p>
                <p className="text-sm text-foreground/80">{item.description}</p>
              </div>

              {/* Eligibility */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Eligibility</p>
                <p className="text-sm text-foreground/80">{item.eligibility}</p>
              </div>

              {/* Required Skills */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.requiredSkills.map((s) => (
                    <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              {/* Application Guide */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">📋 How to Apply</p>
                <div className="space-y-1.5">
                  {item.applicationGuide.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-foreground/80">{step.replace(/^Step \d+:\s*/i, "")}</p>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={item.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Official Website
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const InternshipsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [location, setLocation]   = useState("");
  const [skills, setSkills]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<InternshipsResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [searched, setSearched]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const res = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classStandard: user?.classStandard ?? "",
          name: user?.fullName ?? "",
          location: location.trim(),
          skills: skills.trim(),
          interests: user?.selectedGoal ?? "",
          selectedGoal: user?.selectedGoal ?? "",
        }),
      });
      const data = await res.json() as InternshipsResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data);
        setTimeout(() => window.scrollTo({ top: 350, behavior: "smooth" }), 300);
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
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-4 pt-6 pb-12 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Internships</h1>
              <p className="text-sm text-white/70">AI-recommended for your profile</p>
            </div>
          </div>

          {/* Profile summary */}
          <div className="bg-white/10 rounded-xl p-3 mb-4 text-sm">
            <p className="font-semibold text-white">{user?.fullName} · Class {user?.classStandard}</p>
            <p className="text-white/70 text-xs mt-0.5">
              {user?.selectedGoal ? `Goal: ${user.selectedGoal}` : "Explore all opportunities"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-white/70 font-medium block mb-1">Your Location (State/City)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, Mumbai, Online"
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-white/60 transition"
              />
            </div>
            <div>
              <label className="text-xs text-white/70 font-medium block mb-1">Your Skills (optional)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, Design, Writing, Science"
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-white/60 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 font-bold py-2.5 rounded-xl disabled:opacity-50 hover:bg-blue-50 transition text-sm"
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching…" : "Find Internships"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">

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
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-300 border-t-transparent animate-spin" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground">Finding internships for you…</p>
                <p className="text-sm text-muted-foreground mt-1">Matching opportunities for Class {user?.classStandard}</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
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
                <p className="text-sm font-semibold text-red-700 mb-1">Unable to load internships</p>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-2">
              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-900 font-medium">{result.summary}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-foreground">{result.internships.length} internships found</p>
                <button onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 bg-card transition">
                  <RotateCcw className="w-3.5 h-3.5" /> Search again
                </button>
              </div>

              {/* Internship cards */}
              {result.internships.map((item, i) => (
                <InternshipCard key={item.name} item={item} index={i} />
              ))}

              {/* Platforms */}
              {result.platforms && result.platforms.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    🔍 Also Search On
                  </h3>
                  <div className="space-y-2">
                    {result.platforms.map((p) => (
                      <a
                        key={p.name}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-foreground">Pro Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="text-primary mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intro cards */}
        {!searched && !loading && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { emoji: "🏢", title: "Real Companies", desc: "IITs, IISc, ISRO, top corporates & NGOs" },
              { emoji: "💻", title: "Online & Offline", desc: "Work from home or in-person opportunities" },
              { emoji: "📋", title: "How to Apply", desc: "Step-by-step application guide included" },
              { emoji: "💰", title: "Stipend Info", desc: "Know what you can earn while you learn" },
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

export default InternshipsPage;
