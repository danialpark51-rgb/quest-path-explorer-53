import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "edupath-user";

export type UserData = {
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
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (u: UserData | null) => Promise<void>;
  logout: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setUserState(JSON.parse(raw));
      setIsLoading(false);
    });
  }, []);

  const persist = async (u: UserData | null) => {
    if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(STORAGE_KEY);
    setUserState(u);
  };

  const setUser = (u: UserData | null) => persist(u);
  const logout = () => persist(null);

  const addXP = async (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    await persist({ ...user, xp: newXP, level: newLevel });
  };

  const completeTask = async (taskId: string) => {
    if (!user || user.completedTasks.includes(taskId)) return;
    await persist({ ...user, completedTasks: [...user.completedTasks, taskId] });
  };

  const completeLesson = async (lessonId: string) => {
    if (!user || user.completedLessons.includes(lessonId)) return;
    await persist({ ...user, completedLessons: [...user.completedLessons, lessonId] });
  };

  return (
    <UserContext.Provider
      value={{ user, isLoggedIn: !!user, isLoading, setUser, logout, addXP, completeTask, completeLesson }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
