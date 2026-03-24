import { dailyTasks } from "@/data/dailyTasks";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Flame, PlayCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { getDailyTaskResource } from "@/data/videoRecommendations";

const TasksPage = () => {
  const navigate = useNavigate();
  const { user, completeTask, addXP } = useUser();

  if (!user) return null;

  const handleComplete = (taskId: string, xp: number) => {
    if (user.completedTasks.includes(taskId)) return;
    completeTask(taskId);
    addXP(xp);
  };

  const openTaskResource = (actionType?: string) => {
    switch (actionType) {
      case "goal-videos":
        navigate(user.selectedGoal ? `/goal/${user.selectedGoal}` : "/goals");
        break;
      case "skills":
        navigate("/skills");
        break;
      case "quiz":
        navigate("/quiz");
        break;
      case "stories":
        navigate("/stories");
        break;
      case "games":
        navigate("/games");
        break;
      case "news":
        navigate("/news");
        break;
      case "observation":
        navigate("/observation");
        break;
      case "ai":
        navigate("/ai-assistant");
        break;
      default:
        break;
    }
  };

  const openTaskPath = (path?: string) => {
    if (path) navigate(path);
  };

  const difficulties = ["Easy", "Medium", "Hard"] as const;
  const diffColors = { Easy: "text-primary", Medium: "text-accent", Hard: "text-destructive" };
  const diffEmoji = { Easy: "🟢", Medium: "🟡", Hard: "🔴" };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
          <Flame className="w-6 h-6 text-accent" /> Daily Tasks
        </h1>
        <p className="text-sm text-muted-foreground mb-6">Complete tasks to earn XP and level up!</p>

        {difficulties.map((diff) => {
          const tasks = dailyTasks.filter((t) => t.difficulty === diff);
          return (
            <div key={diff} className="mb-6">
              <h2 className={`font-display font-bold mb-3 ${diffColors[diff]}`}>
                {diffEmoji[diff]} {diff}
              </h2>
              <div className="space-y-2">
                {tasks.map((task, idx) => {
                  const done = user.completedTasks.includes(task.id);
                  const resource = getDailyTaskResource(task.id, user.selectedGoal);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-border transition ${done ? "bg-primary/5" : "bg-card"}`}
                    >
                      <button
                        onClick={() => handleComplete(task.id, task.xp)}
                        disabled={done}
                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition ${done ? "bg-primary border-primary" : "border-border hover:border-primary"}`}
                      >
                        {done && <span className="text-primary-foreground text-xs">✓</span>}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                        {task.actionType && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => openTaskPath(resource.path) || openTaskResource(task.actionType)}
                              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:opacity-90"
                            >
                              {task.actionLabel ?? "Open"}
                            </button>
                            {resource.videoUrl && (
                              <a
                                href={resource.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                              >
                                <PlayCircle className="h-3.5 w-3.5" /> Watch video
                              </a>
                            )}
                            {resource.path && task.actionType !== "goal-videos" && (
                              <button
                                onClick={() => openTaskPath(resource.path)}
                                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> Open lesson
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-accent">+{task.xp}XP</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
};

export default TasksPage;
