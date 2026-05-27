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
  // ISO date string (YYYY-MM-DD) of the last day the user logged in
  // Used to compute streak correctly across sessions and devices
  lastLoginDate: string;
  completedTasks: string[];
  completedLessons: string[];
};

type UserContextType = {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isLoggedIn: boolean;
  logout: () => void;
  addXP: (amount: number) => void;
  completeTask: (taskId: string) => void;
  completeLesson: (lessonId: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Returns today's date as a YYYY-MM-DD string in local time
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Given a stored lastLoginDate, calculate the new streak value:
//   - Same day   → no change (prevent double-counting)
//   - Yesterday  → increment
//   - Older/none → reset to 1
function computeStreak(currentStreak: number, lastLoginDate: string | undefined): { streak: number; lastLoginDate: string } {
  const today = todayStr();

  // Already logged in today — keep streak as-is
  if (lastLoginDate === today) {
    return { streak: currentStreak, lastLoginDate: today };
  }

  if (lastLoginDate) {
    // Check if lastLoginDate was exactly yesterday
    const last = new Date(lastLoginDate + "T00:00:00");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (lastLoginDate === yesterdayStr) {
      // Consecutive day — increment streak
      return { streak: currentStreak + 1, lastLoginDate: today };
    }
  }

  // Gap of 2+ days or first login ever — reset to 1
  return { streak: 1, lastLoginDate: today };
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(() => {
    try {
      const saved = localStorage.getItem("eduapp-user");
      if (!saved) return null;
      const parsed = JSON.parse(saved) as UserData;
      // Migrate old data: if lastLoginDate is missing, set it so streak starts fresh
      if (!parsed.lastLoginDate) {
        parsed.lastLoginDate = "";
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // On every app open: update streak based on login date, ONCE per session
  useEffect(() => {
    if (!user) return;
    const { streak, lastLoginDate } = computeStreak(user.streak, user.lastLoginDate);
    // Only update state if something actually changed (avoid infinite loop)
    if (streak !== user.streak || lastLoginDate !== user.lastLoginDate) {
      const updated = { ...user, streak, lastLoginDate };
      setUserState(updated);
      syncLeaderboard(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount, not on every user change

  // Persist to localStorage whenever user state changes
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

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn: !!user, logout, addXP, completeTask, completeLesson }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
