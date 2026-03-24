import { useUser } from "@/context/UserContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { goals } from "@/data/goals";
import { skills } from "@/data/skills";
import { dailyTasks } from "@/data/dailyTasks";
import { newsItems } from "@/data/news";
import { audioStories } from "@/data/audioStories";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getDailyTaskResource } from "@/data/videoRecommendations";
import {
  Target, Play, Brain, Flame, Trophy, Newspaper,
  Headphones, MessageCircle, LogOut, ChevronRight, Award,
  Gamepad2, Eye, Globe, UserCircle2,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

const HomePage = () => {
  const { user, logout, addXP, completeTask } = useUser();
  const { t, language, setLanguage, languageNames } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  const currentGoal = goals.find((g) => g.id === user.selectedGoal);
  const progress = Math.min((user.xp % 100), 100);
  const completedTaskCount = user.completedTasks.length;
  const totalTasks = dailyTasks.length;

  const handleTaskComplete = (taskId: string, xp: number) => {
    if (user.completedTasks.includes(taskId)) return;
    completeTask(taskId);
    addXP(xp);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Bar */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-80">{t("welcome_back")}</p>
              <h1 className="text-xl font-display font-bold">{user.fullName} 👋</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-secondary/20 text-primary-foreground text-xs px-2 py-1.5 rounded-full border-none outline-none cursor-pointer"
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <option key={code} value={code} className="text-foreground bg-background">{name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1 bg-accent/20 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold">{user.streak} {t("days")}</span>
              </div>
              <button onClick={() => navigate("/profile")} className="p-2 rounded-full bg-secondary/20 hover:bg-secondary/30 transition" aria-label="Open profile">
                <UserCircle2 className="w-4 h-4" />
              </button>
              <button onClick={logout} className="p-2 rounded-full bg-secondary/20 hover:bg-secondary/30 transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Level & XP */}
          <div className="bg-secondary/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                <span className="font-semibold">{t("level")} {user.level}</span>
              </div>
              <span className="text-sm opacity-80">{user.xp} XP</span>
            </div>
            <div className="w-full h-2.5 bg-secondary/20 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="text-xs opacity-70 mt-1">{100 - progress} {t("xp_to_next")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-2 space-y-6">
        {/* Goal Progress */}
        {currentGoal && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <SectionHeader icon={<Target className="w-5 h-5" />} title={t("your_goal")} action={t("change")} onAction={() => navigate("/goals")} />
            <div onClick={() => navigate(`/goal/${currentGoal.id}`)} className={`bg-card rounded-xl border-2 ${currentGoal.bgClass} p-4 flex items-center gap-3 cursor-pointer hover:shadow-card transition`}>
              <span className="text-3xl">{currentGoal.emoji}</span>
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground">{currentGoal.title}</h3>
                <p className="text-xs text-muted-foreground">{currentGoal.careers.slice(0, 3).join(" · ")}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </motion.div>
        )}

        {/* Videos */}
        {currentGoal && (
          <Section icon={<Play className="w-5 h-5" />} title={t("recommended_videos")} action={t("see_all")} onAction={() => navigate(`/goal/${currentGoal.id}`)}>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {currentGoal.videos.slice(0, 5).map((v, i) => (
                <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-52 group">
                  <div className="relative rounded-xl overflow-hidden bg-muted aspect-video mb-2">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary-foreground opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <span className="absolute bottom-1 right-1 bg-foreground/70 text-primary-foreground text-xs px-1.5 py-0.5 rounded">{v.duration}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{v.title}</p>
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Daily Tasks */}
        <Section icon={<Flame className="w-5 h-5" />} title={`${t("daily_tasks")} (${completedTaskCount}/${totalTasks})`} action={t("view_all")} onAction={() => navigate("/tasks")}>
          <div className="space-y-2">
            {dailyTasks.slice(0, 4).map((task) => {
              const done = user.completedTasks.includes(task.id);
              const resource = getDailyTaskResource(task.id, user.selectedGoal);
              return (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl ${done ? "bg-primary/5" : "bg-card"} border border-border transition`}>
                  <button onClick={() => handleTaskComplete(task.id, task.xp)} disabled={done}
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${done ? "bg-primary border-primary" : "border-border hover:border-primary"} transition`}>
                    {done && <span className="text-primary-foreground text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                    {resource.videoTitle && (
                      <p className="mt-1 text-xs text-primary">Recommended: {resource.videoTitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <DifficultyBadge d={task.difficulty} />
                    <span className="text-xs font-semibold text-accent">+{task.xp}XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Skills */}
        <Section icon={<Brain className="w-5 h-5" />} title={t("skill_modules")} action={t("all_skills")} onAction={() => navigate("/skills")}>
          <div className="grid grid-cols-2 gap-3">
            {skills.slice(0, 4).map((skill) => (
              <div key={skill.id} onClick={() => navigate(`/skill/${skill.id}`)}
                className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:shadow-card transition group">
                <span className="text-2xl">{skill.icon}</span>
                <h4 className="font-semibold text-sm text-foreground mt-2">{skill.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{skill.lessons.length} {t("lessons")}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Games & Observation */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/games")}
            className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:shadow-card transition">
            <Gamepad2 className="w-6 h-6 text-accent" />
            <h4 className="font-semibold text-sm text-foreground mt-2">{t("games")}</h4>
            <p className="text-xs text-muted-foreground mt-1">15 brain games</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/observation")}
            className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:shadow-card transition">
            <Eye className="w-6 h-6 text-primary" />
            <h4 className="font-semibold text-sm text-foreground mt-2">{t("observation")}</h4>
            <p className="text-xs text-muted-foreground mt-1">20 image challenges</p>
          </motion.div>
        </div>

        {/* Audio Stories */}
        <Section icon={<Headphones className="w-5 h-5" />} title={t("audio_stories")} action={t("all_stories")} onAction={() => navigate("/stories")}>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {audioStories.slice(0, 6).map((story) => (
              <div key={story.id} onClick={() => navigate("/stories")} className="flex-shrink-0 w-40 bg-card rounded-xl border border-border p-3 cursor-pointer hover:shadow-card transition">
                <span className="text-3xl">{story.emoji}</span>
                <h4 className="text-sm font-semibold text-foreground mt-2 line-clamp-2">{story.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{story.duration}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* News */}
        <Section icon={<Newspaper className="w-5 h-5" />} title={t("daily_news")} action={t("more")} onAction={() => navigate("/news")}>
          <div className="space-y-2">
            {newsItems.slice(0, 3).map((news) => (
              <div key={news.id} className="bg-card rounded-xl border border-border p-3 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{news.emoji}</span>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{news.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{news.summary}</p>
                  <span className="text-xs text-primary mt-1 inline-block">{news.category}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={() => navigate("/quiz")} className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-2 hover:shadow-card transition">
            <Trophy className="w-6 h-6 text-accent" />
            <span className="text-sm font-semibold text-foreground">{t("quizzes")}</span>
          </button>
          <button onClick={() => navigate("/ai-assistant")} className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-2 hover:shadow-card transition">
            <MessageCircle className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("ai_assistant")}</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

const SectionHeader = ({ icon, title, action, onAction }: { icon: React.ReactNode; title: string; action?: string; onAction?: () => void }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <h2 className="font-display font-bold text-foreground">{title}</h2>
    </div>
    {action && <button onClick={onAction} className="text-sm text-primary font-medium hover:underline">{action}</button>}
  </div>
);

const Section = ({ icon, title, action, onAction, children }: { icon: React.ReactNode; title: string; action?: string; onAction?: () => void; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <SectionHeader icon={icon} title={title} action={action} onAction={onAction} />
    {children}
  </motion.div>
);

const DifficultyBadge = ({ d }: { d: string }) => {
  const cls = d === "Easy" ? "bg-primary/10 text-primary" : d === "Medium" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive";
  return <span className={`text-xs px-2 py-0.5 rounded-full ${cls} font-medium`}>{d}</span>;
};

export default HomePage;
