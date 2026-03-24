import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Award, BookOpen, School, Target, UserCircle2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/context/UserContext";
import { goals } from "@/data/goals";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

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
            ← Back to home
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
              <StatCard label="Level" value={String(user.level)} />
              <StatCard label="XP" value={String(user.xp)} />
              <StatCard label="Streak" value={`${user.streak}d`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <section className="grid gap-4 md:grid-cols-2">
          <InfoCard icon={<School className="h-5 w-5 text-primary" />} label="School / College" value={user.school || "Not added yet"} />
          <InfoCard icon={<BookOpen className="h-5 w-5 text-primary" />} label="Class / Standard" value={user.classStandard ? `Class ${user.classStandard}` : "Not added yet"} />
          <InfoCard icon={<UserCircle2 className="h-5 w-5 text-primary" />} label="USN / Seat Number" value={user.usnOrSetsNo || "Not added yet"} />
          <InfoCard icon={<Target className="h-5 w-5 text-primary" />} label="Selected Goal" value={currentGoal ? `${currentGoal.emoji} ${currentGoal.title}` : "Goal not selected"} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-foreground">Learning Progress</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <ProgressCard label="Completed tasks" value={String(user.completedTasks.length)} />
            <ProgressCard label="Completed lessons" value={String(user.completedLessons.length)} />
            <ProgressCard label="Goal videos ready" value={String(currentGoal?.videos.length ?? 0)} />
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