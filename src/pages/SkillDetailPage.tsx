import { useParams, useNavigate } from "react-router-dom";
import { skills } from "@/data/skills";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Circle, Lock } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const SkillDetailPage = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { user, completeLesson, addXP } = useUser();
  const skill = skills.find((s) => s.id === skillId);

  if (!skill) return <div className="min-h-screen flex items-center justify-center text-foreground">Skill not found</div>;

  const handleComplete = (lessonId: number) => {
    const lid = `${skill.id}-${lessonId}`;
    if (user?.completedLessons.includes(lid)) return;
    completeLesson(lid);
    addXP(20);
  };

  const levels = ["Beginner", "Intermediate", "Advanced"] as const;
  const levelColors = { Beginner: "text-primary", Intermediate: "text-accent", Advanced: "text-destructive" };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/skills")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Skills
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{skill.icon}</span>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{skill.title}</h1>
            <p className="text-sm text-muted-foreground">{skill.description}</p>
          </div>
        </div>

        {levels.map((level) => {
          const levelLessons = skill.lessons.filter((l) => l.level === level);
          return (
            <div key={level} className="mb-6">
              <h2 className={`font-display font-bold mb-3 ${levelColors[level]}`}>
                {level === "Beginner" ? "🌱" : level === "Intermediate" ? "🌿" : "🌳"} {level}
              </h2>
              <div className="space-y-2">
                {levelLessons.map((lesson, idx) => {
                  const lid = `${skill.id}-${lesson.id}`;
                  const done = user?.completedLessons.includes(lid);
                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleComplete(lesson.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer transition ${done ? "bg-primary/5" : "bg-card hover:shadow-card"}`}
                    >
                      {done ? <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{lesson.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{lesson.duration}</span>
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

export default SkillDetailPage;
