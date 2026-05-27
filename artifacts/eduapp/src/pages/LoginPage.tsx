import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, User, School, Hash, Globe } from "lucide-react";

const classes = ["6", "7", "8", "9", "10"];

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { t, language, setLanguage, languageNames } = useLanguage();
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
    // Set lastLoginDate to today so streak logic in UserContext starts correctly
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setUser({
      ...form,
      selectedGoal: "",
      xp: 0,
      level: 1,
      streak: 1,
      lastLoginDate: todayStr,
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
          <p className="text-muted-foreground mt-1">{t("login.tagline")}</p>
        </div>

        {/* Language picker — visible before login */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="text-sm px-3 py-1.5 rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            {Object.entries(languageNames).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-elevated p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> {t("login.username")}
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder={t("login.username_ph")}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> {t("login.fullname")}
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder={t("login.fullname_ph")}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <School className="w-4 h-4 text-primary" /> {t("login.school")}
            </label>
            <input
              type="text"
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder={t("login.school_ph")}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" /> {t("login.usn")}
            </label>
            <input
              type="text"
              value={form.usnOrSetsNo}
              onChange={(e) => setForm({ ...form, usnOrSetsNo: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder={t("login.usn_ph")}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> {t("login.class")}
            </label>
            <select
              value={form.classStandard}
              onChange={(e) => setForm({ ...form, classStandard: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              required
            >
              <option value="">{t("login.class_ph")}</option>
              {classes.map((c) => (
                <option key={c} value={c}>{t("login.class_opt")} {c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg gradient-hero text-primary-foreground font-semibold text-lg shadow-glow hover:opacity-90 transition-opacity"
          >
            {t("login.get_started")}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
