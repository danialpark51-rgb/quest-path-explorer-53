import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Zap, Search, MapPin, ChevronRight,
  Lightbulb, AlertCircle, Loader2, FolderPlus,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

type Problem = {
  title: string;
  emoji: string;
  domain: string;
  description: string;
  cause: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  location: string;
};

const GOALS = ["Engineering", "Medical", "Commerce", "Arts", "IT", "Defence", "Govt", "Science", "Agriculture", "Environment", "Technology"];

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard:   "bg-red-100 text-red-700",
};

const ProblemFinderPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useLanguage();

  const [goal, setGoal] = useState(user?.selectedGoal || "Engineering");
  const [region, setRegion] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const handleFind = async () => {
    setLoading(true);
    setError("");
    setProblems([]);
    setDone(false);
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
      const data = await res.json() as { problems?: Problem[]; error?: string };
      if (!res.ok || data.error) { setError(data.error ?? "Failed to generate problems"); return; }
      setProblems(data.problems ?? []);
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const useAsProject = (prob: Problem) => {
    sessionStorage.setItem("eduapp-prefill-project", JSON.stringify({
      title: prob.title,
      description: `Problem: ${prob.description}\n\nCause: ${prob.cause}\n\nImpact: ${prob.impact}`,
      subject: mapDomainToSubject(prob.domain),
    }));
    navigate("/projects?prefill=1");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
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
              <p className="text-sm text-primary-foreground/70">{t("pf.subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">
        {/* Config Card */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
          {/* Goal Picker */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">{t("pf.select_goal")}</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                    goal === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Region Input */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("pf.region")} <span className="font-normal">({t("pf.optional")})</span></label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder={t("pf.region_ph")}
                maxLength={80}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <button
            onClick={handleFind}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{t("pf.finding")}</>
            ) : (
              <><Search className="w-4 h-4" />{t("pf.find")}</>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {done && problems.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t("pf.no_results")}</p>
          </div>
        )}

        {problems.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground px-1">
              {t("pf.results_for")} <strong>{goal}</strong>{region ? ` · ${region}` : ""}
            </p>
            <div className="space-y-3">
              {problems.map((prob, i) => {
                const isOpen = expandedIdx === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                  >
                    {/* Card Header */}
                    <button
                      className="w-full text-left p-4 flex items-start gap-3"
                      onClick={() => setExpandedIdx(isOpen ? null : i)}
                    >
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

                    {/* Expanded Details */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            <DetailRow label={t("pf.description")} text={prob.description} />
                            <DetailRow label={t("pf.cause")} text={prob.cause} />
                            <DetailRow label={t("pf.impact")} text={prob.impact} />

                            <button
                              onClick={() => useAsProject(prob)}
                              className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition"
                            >
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
      </div>

      <BottomNav />
    </div>
  );
};

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
  };
  for (const [k, v] of Object.entries(map)) {
    if (domain.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "Science";
}

export default ProblemFinderPage;
