import { useParams, useNavigate } from "react-router-dom";
import { goals } from "@/data/goals";
import { quizzes } from "@/data/quizzes";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Star, Briefcase, TrendingUp, BookOpen, Trophy } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const GoalDetailPage = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const goal = goals.find((g) => g.id === goalId);
  const goalQuizzes = quizzes.filter((q) => q.goalId === goalId);

  if (!goal) return <div className="min-h-screen flex items-center justify-center text-foreground">Goal not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className={`px-4 pt-6 pb-8 rounded-b-3xl border-b-2 ${goal.bgClass}`}>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
            <ArrowLeft className="w-4 h-4" /> Back
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
        {/* Skills Needed */}
        <div>
          <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Skills Required
          </h2>
          <div className="flex flex-wrap gap-2">
            {goal.skills.map((s) => (
              <span key={s} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>

        {/* Career Options */}
        <div>
          <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Career Options
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {goal.careers.map((c) => (
              <div key={c} className="bg-card border border-border rounded-lg p-3 text-sm text-foreground">{c}</div>
            ))}
          </div>
        </div>

        {/* Quizzes */}
        {goalQuizzes.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" /> Quizzes
            </h2>
            <div className="space-y-2">
              {goalQuizzes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => navigate(`/quiz/${q.id}`)}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-card transition"
                >
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

        {/* Videos */}
        <div>
          <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" /> Video Library ({goal.videos.length})
          </h2>
          <div className="space-y-3">
            {goal.videos.map((v, i) => (
              <motion.a
                key={i}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 bg-card border border-border rounded-xl p-3 hover:shadow-card transition group"
              >
                <div className="relative w-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted aspect-video">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/20 transition">
                    <Play className="w-6 h-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{v.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{v.duration}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default GoalDetailPage;
