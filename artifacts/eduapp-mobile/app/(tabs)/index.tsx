import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { goals } from "@/data/goals";
import { skills } from "@/data/skills";
import { dailyTasks } from "@/data/dailyTasks";

export default function HomeScreen() {
  const colors = useColors();
  const { user, logout, addXP, completeTask } = useUser();

  if (!user) {
    router.replace("/");
    return null;
  }

  const currentGoal = goals.find((g) => g.id === user.selectedGoal);
  const progress = Math.min((user.xp % 100), 100);
  const completedCount = user.completedTasks.length;
  const s = makeStyles(colors);

  const handleTask = async (taskId: string, xp: number) => {
    if (user.completedTasks.includes(taskId)) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeTask(taskId);
    await addXP(xp);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={["#0d1524", "#1a2744"]}
        style={s.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.headerRow}>
          <View>
            <Text style={s.welcome}>Welcome back</Text>
            <Text style={s.userName}>{user.fullName}</Text>
          </View>
          <View style={s.headerRight}>
            <View style={s.streakBadge}>
              <Ionicons name="flame" size={15} color="#f59e0b" />
              <Text style={s.streakText}>{user.streak} days</Text>
            </View>
            <TouchableOpacity onPress={logout} style={s.logoutBtn}>
              <Feather name="log-out" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* XP Bar */}
        <View style={s.xpCard}>
          <View style={s.xpRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={s.levelText}>Level {user.level}</Text>
            </View>
            <Text style={s.xpText}>{user.xp} XP</Text>
          </View>
          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={s.xpSub}>{100 - progress} XP to next level</Text>
        </View>
      </LinearGradient>

      <View style={s.body}>
        {/* Goal */}
        {currentGoal && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <SectionHeader
              icon="navigate-circle"
              title="Your Goal"
              action="Change"
              onAction={() => router.push("/goals")}
              colors={colors}
            />
            <Pressable
              style={[s.goalCard, { borderColor: currentGoal.color + "60" }]}
              onPress={() => {}}
            >
              <View style={[s.goalIcon, { backgroundColor: currentGoal.color + "20" }]}>
                <Ionicons name={currentGoal.icon as any} size={26} color={currentGoal.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.goalTitle}>{currentGoal.title}</Text>
                <Text style={s.goalSub} numberOfLines={1}>
                  {currentGoal.careers.slice(0, 3).join(" · ")}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          </Animated.View>
        )}

        {/* Daily Tasks */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <SectionHeader
            icon="flame"
            title={`Daily Tasks (${completedCount}/${dailyTasks.length})`}
            action="View All"
            onAction={() => router.push("/(tabs)/quiz")}
            colors={colors}
          />
          {dailyTasks.slice(0, 5).map((task) => {
            const done = user.completedTasks.includes(task.id);
            return (
              <TaskItem
                key={task.id}
                task={task}
                done={done}
                onPress={() => handleTask(task.id, task.xp)}
                colors={colors}
              />
            );
          })}
        </Animated.View>

        {/* Skills */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <SectionHeader
            icon="book"
            title="Skill Modules"
            action="All Skills"
            onAction={() => router.push("/(tabs)/learn")}
            colors={colors}
          />
          <View style={s.skillGrid}>
            {skills.slice(0, 4).map((skill) => (
              <Pressable
                key={skill.id}
                style={s.skillCard}
                onPress={() => router.push(`/skill/${skill.id}`)}
              >
                <Ionicons name={skill.icon as any} size={26} color={colors.primary} />
                <Text style={s.skillTitle}>{skill.title}</Text>
                <Text style={s.skillSub}>{skill.lessons.length} lessons</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader icon="grid" title="Quick Actions" colors={colors} />
          <View style={s.quickGrid}>
            <QuickAction
              icon="trophy"
              label="Quizzes"
              color="#f59e0b"
              onPress={() => router.push("/(tabs)/quiz")}
              colors={colors}
            />
            <QuickAction
              icon="newspaper"
              label="News"
              color="#3b82f6"
              onPress={() => router.push("/(tabs)/news")}
              colors={colors}
            />
            <QuickAction
              icon="person-circle"
              label="Profile"
              color="#10b981"
              onPress={() => router.push("/(tabs)/profile")}
              colors={colors}
            />
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function SectionHeader({
  icon,
  title,
  action,
  onAction,
  colors,
}: {
  icon: string;
  title: string;
  action?: string;
  onAction?: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const s = makeStyles(colors);
  return (
    <View style={s.sectionHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={s.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function TaskItem({
  task,
  done,
  onPress,
  colors,
}: {
  task: (typeof dailyTasks)[0];
  done: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const s = makeStyles(colors);
  const diffColor =
    task.difficulty === "Easy"
      ? colors.primary
      : task.difficulty === "Medium"
      ? "#f59e0b"
      : colors.destructive;
  return (
    <Pressable
      style={[s.taskRow, done && { backgroundColor: colors.primary + "08" }]}
      onPress={onPress}
    >
      <TouchableOpacity
        style={[
          s.checkbox,
          done && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={onPress}
      >
        {done && <Ionicons name="checkmark" size={14} color="#fff" />}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            s.taskTitle,
            done && {
              textDecorationLine: "line-through",
              color: colors.mutedForeground,
            },
          ]}
        >
          {task.title}
        </Text>
        <Text style={s.taskDesc} numberOfLines={1}>
          {task.description}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 3 }}>
        <View style={[s.diffBadge, { backgroundColor: diffColor + "18" }]}>
          <Text style={[s.diffText, { color: diffColor }]}>{task.difficulty}</Text>
        </View>
        <Text style={s.xpBadge}>+{task.xp}XP</Text>
      </View>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
  colors,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const s = makeStyles(colors);
  return (
    <Pressable style={s.quickCard} onPress={onPress}>
      <View style={[s.quickIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={s.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 32 },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
    },
    welcome: {
      fontSize: 13,
      color: "rgba(255,255,255,0.65)",
      fontFamily: "Inter_400Regular",
    },
    userName: {
      fontSize: 22,
      color: "#fff",
      fontFamily: "Inter_700Bold",
      marginTop: 2,
    },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(245,158,11,0.2)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    streakText: { fontSize: 13, color: "#f59e0b", fontFamily: "Inter_600SemiBold" },
    logoutBtn: {
      padding: 8,
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 20,
    },
    xpCard: {
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 16,
      padding: 14,
    },
    xpRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    levelText: { fontSize: 15, color: "#fff", fontFamily: "Inter_700Bold" },
    xpText: {
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      fontFamily: "Inter_500Medium",
    },
    barBg: {
      height: 8,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 4,
      overflow: "hidden",
    },
    barFill: { height: "100%", backgroundColor: "#10b981", borderRadius: 4 },
    xpSub: {
      fontSize: 11,
      color: "rgba(255,255,255,0.55)",
      fontFamily: "Inter_400Regular",
      marginTop: 6,
    },
    body: { padding: 16, gap: 8, paddingBottom: 120 },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    sectionAction: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    goalCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    goalIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    goalTitle: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    goalSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    taskRow: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    taskTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 2,
    },
    taskDesc: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    diffBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
    diffText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
    xpBadge: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#f59e0b" },
    skillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    skillCard: {
      width: "47%",
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    skillTitle: {
      fontSize: 13,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginTop: 8,
      marginBottom: 3,
    },
    skillSub: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    quickGrid: { flexDirection: "row", gap: 10 },
    quickCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      alignItems: "center",
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    quickIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    quickLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
  });
}
