import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { skills } from "@/data/skills";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Circle, PlayCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import EmbeddedVideoLibrary from "@/components/EmbeddedVideoLibrary";
import { getSkillLessonVideoRecommendations, skillOverviewVideoMap } from "@/data/videoRecommendations";

const SkillDetailPage = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { user, completeLesson, addXP } = useUser();
  const skill = skills.find((s) => s.id === skillId);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(skill?.lessons[0]?.id ?? null);

  if (!skill) return <div className="min-h-screen flex items-center justify-center text-foreground">Skill not found</div>;

  const selectedLesson = skill.lessons.find((lesson) => lesson.id === selectedLessonId) ?? skill.lessons[0];
  const selectedLessonRecommendations = getSkillLessonVideoRecommendations(skill.id, skill.title, selectedLesson.id, selectedLesson.title);

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

        <div className="mb-6 rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">Selected lesson</p>
              <h2 className="font-display text-xl font-bold text-foreground">{selectedLesson.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Every video for this lesson stays inside the app so you can learn without leaving the module.
              </p>
            </div>
          </div>
          <EmbeddedVideoLibrary
            videos={selectedLessonRecommendations.length > 0 ? selectedLessonRecommendations : [{
              label: "Module overview",
              title: `${skill.title} overview`,
              url: skillOverviewVideoMap[skill.id],
            }]}
            emptyMessage="Lesson videos will appear here once they are mapped."
          />
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
                      className={`rounded-xl border border-border p-3 transition ${selectedLesson.id === lesson.id ? "bg-primary/5 shadow-card" : "bg-card hover:shadow-card"}`}
                    >
                      <div className="flex items-start gap-3">
                        {done ? <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                        <button onClick={() => setSelectedLessonId(lesson.id)} className="flex-1 text-left">
                          <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{lesson.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {lesson.level} lesson focused on {lesson.title.toLowerCase()}.
                          </p>
                        </button>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{lesson.duration}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
                        <button
                          onClick={() => handleComplete(lesson.id)}
                          className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                        >
                          {done ? "Completed" : "Mark complete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:opacity-90"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Topic video
                        </button>
                      </div>
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
