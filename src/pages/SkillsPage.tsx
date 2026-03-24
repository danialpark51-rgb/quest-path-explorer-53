import { skills } from "@/data/skills";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const SkillsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">🧠 Skill Modules</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((skill, idx) => {
            const completedCount = skill.lessons.filter((l) => l.completed).length;
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => navigate(`/skill/${skill.id}`)}
                className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-elevated transition group"
              >
                <span className="text-3xl">{skill.icon}</span>
                <h3 className="text-lg font-display font-bold text-foreground mt-3">{skill.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{completedCount}/{skill.lessons.length} lessons</span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(completedCount / skill.lessons.length) * 100}%` }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SkillsPage;
