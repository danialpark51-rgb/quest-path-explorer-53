import { useParams, useNavigate } from "react-router-dom";
import { goals } from "@/data/goals";
import { quizzes } from "@/data/quizzes";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Star, Briefcase, TrendingUp, BookOpen, Trophy } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import YouTubeEmbed, { YouTubePreviewCard } from "@/components/YouTubeEmbed";

const GoalDetailPage = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const goal = goals.find((g) => g.id === goalId);
  const goalQuizzes = quizzes.filter((q) => q.goalId === goalId);

  if (!goal) return <div className="min-h-screen flex items-center justify-center text-foreground">Goal not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className={`px-4 pt-6 pb-8 rounded-b-3xl border-b-2 ${goal.bgClass}`}>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
            <ArrowLeft className="w-4 h-4" /> {t("back")}
          </button>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{goal.emoji}</span>
            <h1 className="text-3xl font-display font-bold text-foreground">{goal.title}</h1>
          </div>
          <p className="text-muted-foreground">{goal.description}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="flex items-center gap-1 text-sm bg-card px-3 py-1.5 rounded-full border border-border">
              <Star className="w-3.5 h-3.5 text-accent" /> {goal.difficulty}
            </span>
            <span className="flex items-center gap-1 text-sm bg-card px-3 py-1.5 rounded-full border border-border">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> {goal.salaryRange}
            </span>
            <span className="flex items-center gap-1 text-sm bg-card px-3 py-1.5 rounded-full border border-border">
              🌟 {goal.roleModel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        <div>
          <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> {t("skills_required")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {goal.skills.map((s) => (
              <span key={s} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> {t("career_options")}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {goal.careers.map((c) => (
              <div key={c} className="bg-card border border-border rounded-lg p-3 text-sm text-foreground">{c}</div>
            ))}
          </div>
        </div>

        {goalQuizzes.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" /> {t("quizzes")}
            </h2>
            <div className="space-y-2">
              {goalQuizzes.map((q) => (
                <div key={q.id} onClick={() => navigate(`/quiz/${q.id}`)}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-card transition">
                  <div>
                    <h3 className="font-semibold text-foreground">{q.topic}</h3>
                    <p className="text-xs text-muted-foreground">{q.questions.length} questions</p>
                  </div>
                  <span className="text-sm text-primary font-medium">Start →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" /> {t("video_library")} ({goal.videos.length})
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {goal.videos.slice(0, 4).map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <YouTubeEmbed url={v.url} title={v.title} compact />
              </motion.div>
            ))}
          </div>

          {goal.videos.length > 4 && (
            <div className="mt-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">More goal videos</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {goal.videos.slice(4).map((v, i) => (
                  <motion.div key={`${v.title}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <YouTubePreviewCard url={v.url} title={v.title} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default GoalDetailPage;
