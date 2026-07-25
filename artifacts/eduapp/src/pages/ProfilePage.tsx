import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Award, BookOpen, School, Target, UserCircle2, Globe, Moon, Sun } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import SchoolMap from "@/components/SchoolMap";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/context/UserContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { goals } from "@/data/goals";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t, language, setLanguage, languageNames } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  if (!user) return null;

  const currentGoal = goals.find((goal) => goal.id === user.selectedGoal);
  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-dark rounded-b-3xl px-4 pb-8 pt-6 text-primary-foreground">
        <div className="mx-auto max-w-3xl">
          <button onClick={() => navigate("/home")} className="mb-5 text-sm opacity-80 transition hover:opacity-100">
            {t("profile.back")}
          </button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border border-primary-foreground/20">
                <AvatarFallback className="gradient-hero text-xl font-bold text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-3xl font-bold">{user.fullName}</h1>
                <p className="text-sm opacity-80">@{user.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <StatCard label={t("profile.level")} value={String(user.level)} />
              <StatCard label={t("profile.xp")} value={String(user.xp)} />
              <StatCard label={t("profile.streak")} value={`${user.streak}d`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <section className="grid gap-4 md:grid-cols-2">
          <InfoCard icon={<School className="h-5 w-5 text-primary" />} label={t("profile.school")} value={user.school || t("profile.not_added")} />
          <InfoCard icon={<BookOpen className="h-5 w-5 text-primary" />} label={t("profile.class")} value={user.classStandard ? `${t("profile.class_prefix")} ${user.classStandard}` : t("profile.not_added")} />
          <InfoCard icon={<UserCircle2 className="h-5 w-5 text-primary" />} label={t("profile.usn")} value={user.usnOrSetsNo || t("profile.not_added")} />
          <InfoCard icon={<Target className="h-5 w-5 text-primary" />} label={t("profile.goal")} value={currentGoal ? `${currentGoal.emoji} ${currentGoal.title}` : (user.selectedGoal || t("profile.no_goal"))} />
        </section>

        {/* Custom Goals */}
        {user.customGoals && user.customGoals.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">🎯 My Custom Goals</h2>
            <div className="flex flex-wrap gap-2">
              {user.customGoals.map((g) => (
                <span key={g} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {g}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* School Location Map */}
        {user.school && <SchoolMap schoolName={user.school} />}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-foreground">{t("profile.progress")}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <ProgressCard label={t("profile.completed_tasks")} value={String(user.completedTasks.length)} />
            <ProgressCard label={t("profile.completed_lessons")} value={String(user.completedLessons.length)} />
            <ProgressCard label={t("profile.goal_videos")} value={String(currentGoal?.videos.length ?? 0)} />
          </div>
        </section>

        {/* Language Setting */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">{t("profile.language")}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{t("profile.lang_hint")}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(languageNames).map(([code, name]) => (
              <button
                key={code}
                onClick={() => setLanguage(code as Language)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition border ${language === code ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-foreground border-border hover:border-primary"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </section>

        {/* Appearance / Dark Mode */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            {isDark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <h2 className="font-display text-lg font-bold text-foreground">Appearance</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Choose your preferred display mode. Your preference is saved automatically.</p>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-3">
              {isDark
                ? <Moon className="w-5 h-5 text-blue-400" />
                : <Sun className="w-5 h-5 text-yellow-500" />
              }
              <div>
                <p className="font-semibold text-foreground text-sm">{isDark ? "Dark Mode" : "Light Mode"}</p>
                <p className="text-xs text-muted-foreground">{isDark ? "Easy on eyes in low light" : "Classic bright appearance"}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isDark ? "bg-primary" : "bg-muted-foreground/30"}`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-3 backdrop-blur-sm">
    <p className="text-lg font-bold">{value}</p>
    <p className="text-xs opacity-80">{label}</p>
  </div>
);

const InfoCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
    <p className="text-base font-semibold text-foreground">{value}</p>
  </div>
);

const ProgressCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-muted p-4">
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default ProfilePage;
