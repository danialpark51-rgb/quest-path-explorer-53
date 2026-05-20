import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { goals } from "@/data/goals";
import { motion } from "framer-motion";
import { ArrowRight, Star, Briefcase, TrendingUp } from "lucide-react";

const GoalSelectionPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const selectGoal = (goalId: string) => {
    if (!user) return;
    setUser({ ...user, selectedGoal: goalId });
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Choose Your Goal 🎯</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Select the career path that excites you. You can always change it later!
          </p>
        </motion.div>

        {/* Goal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, idx) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => selectGoal(goal.id)}
              className={`relative bg-card rounded-2xl border-2 ${goal.bgClass} p-5 cursor-pointer hover:shadow-elevated transition-all group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-2xl mr-2">{goal.emoji}</span>
                  <span className="text-xl font-display font-bold text-foreground">{goal.title}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{goal.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {goal.fields.slice(0, 4).map((f) => (
                  <span key={f} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{f}</span>
                ))}
                {goal.fields.length > 4 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">+{goal.fields.length - 4}</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {goal.difficulty}</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {goal.salaryRange}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {goal.careers.length} careers</span>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                🌟 Role model: {goal.roleModel}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalSelectionPage;
