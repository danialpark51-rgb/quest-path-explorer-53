import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserData = {
  username: string;
  fullName: string;
  school: string;
  usnOrSetsNo: string;
  classStandard: string;
  selectedGoal: string;
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
  completedTasks: string[];
  completedLessons: string[];
  // Tracks which thinkers the user has already analyzed (prevents XP farming)
  analyzedThinkers: string[];
};

type UserContextType = {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isLoggedIn: boolean;
  logout: () => void;
  addXP: (amount: number) => void;
  completeTask: (taskId: string) => void;
  completeLesson: (lessonId: string) => void;
  // Returns XP earned (25) or 0 if already analyzed
  analyzeThinker: (personName: string) => number;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(currentStreak: number, lastLoginDate: string | undefined): { streak: number; lastLoginDate: string } {
  const today = todayStr();
  if (lastLoginDate === today) return { streak: currentStreak, lastLoginDate: today };

  if (lastLoginDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (lastLoginDate === yStr) return { streak: currentStreak + 1, lastLoginDate: today };
  }

  return { streak: 1, lastLoginDate: today };
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(() => {
    try {
      const saved = localStorage.getItem("eduapp-user");
      if (!saved) return null;
      const parsed = JSON.parse(saved) as UserData;
      if (!parsed.lastLoginDate) parsed.lastLoginDate = "";
      // Migrate: add analyzedThinkers if missing
      if (!parsed.analyzedThinkers) parsed.analyzedThinkers = [];
      return parsed;
    } catch {
      return null;
    }
  });

  // Update streak once on app mount
  useEffect(() => {
    if (!user) return;
    const { streak, lastLoginDate } = computeStreak(user.streak, user.lastLoginDate);
    if (streak !== user.streak || lastLoginDate !== user.lastLoginDate) {
      const updated = { ...user, streak, lastLoginDate };
      setUserState(updated);
      syncLeaderboard(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("eduapp-user", JSON.stringify(user));
    else localStorage.removeItem("eduapp-user");
  }, [user]);

  const setUser = (u: UserData | null) => setUserState(u);
  const logout = () => setUserState(null);

  const syncLeaderboard = (u: UserData) => {
    fetch("/api/leaderboard/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: u.username,
        fullName: u.fullName,
        xp: u.xp,
        level: u.level,
        streak: u.streak,
        goal: u.selectedGoal,
        school: u.school,
      }),
    }).catch(() => {});
  };

  const addXP = (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const updated = { ...user, xp: newXP, level: newLevel };
    setUserState(updated);
    syncLeaderboard(updated);
  };

  const completeTask = (taskId: string) => {
    if (!user || user.completedTasks.includes(taskId)) return;
    setUserState({ ...user, completedTasks: [...user.completedTasks, taskId] });
  };

  const completeLesson = (lessonId: string) => {
    if (!user || user.completedLessons.includes(lessonId)) return;
    setUserState({ ...user, completedLessons: [...user.completedLessons, lessonId] });
  };

  // Award 25 XP for each unique thinker analyzed — returns XP earned (0 if duplicate)
  const analyzeThinker = (personName: string): number => {
    if (!user) return 0;
    const key = personName.toLowerCase().trim();
    if (user.analyzedThinkers.includes(key)) return 0;

    const XP_REWARD = 25;
    const newXP = user.xp + XP_REWARD;
    const newLevel = Math.floor(newXP / 100) + 1;
    const updated = {
      ...user,
      xp: newXP,
      level: newLevel,
      analyzedThinkers: [...user.analyzedThinkers, key],
    };
    setUserState(updated);
    syncLeaderboard(updated);
    return XP_REWARD;
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn: !!user, logout, addXP, completeTask, completeLesson, analyzeThinker }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
