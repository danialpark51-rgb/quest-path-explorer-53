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

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(() => {
    const saved = localStorage.getItem("eduapp-user");
    return saved ? JSON.parse(saved) : null;
  });

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
