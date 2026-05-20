import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, User, School, Hash } from "lucide-react";

const classes = ["6", "7", "8", "9", "10"];

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    school: "",
    usnOrSetsNo: "",
    classStandard: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.fullName || !form.classStandard) return;
    setUser({
      ...form,
      selectedGoal: "",
      xp: 0,
      level: 1,
      streak: 3,
      completedTasks: [],
      completedLessons: [],
    });
    navigate("/goals");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-hero mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">EduPath</h1>
          <p className="text-muted-foreground mt-1">Your personalized learning journey starts here</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-elevated p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <School className="w-4 h-4 text-primary" /> School / College
            </label>
            <input
              type="text"
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder="Your school or college"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" /> USN / Seat Number
            </label>
            <input
              type="text"
              value={form.usnOrSetsNo}
              onChange={(e) => setForm({ ...form, usnOrSetsNo: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder="Your USN or seat number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Class / Standard
            </label>
            <select
              value={form.classStandard}
              onChange={(e) => setForm({ ...form, classStandard: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              required
            >
              <option value="">Select your class</option>
              {classes.map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg gradient-hero text-primary-foreground font-semibold text-lg shadow-glow hover:opacity-90 transition-opacity"
          >
            Get Started 🚀
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
