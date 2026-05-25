import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { goals } from "@/data/goals";
import { skills } from "@/data/skills";
import { dailyTasks } from "@/data/dailyTasks";

export default function ProfileScreen() {
  const colors = useColors();
  const { user, logout } = useUser();
  const s = makeStyles(colors);

  if (!user) {
    router.replace("/");
    return null;
  }

  const currentGoal = goals.find((g) => g.id === user.selectedGoal);
  const progress = Math.min((user.xp % 100), 100);
  const completedLessons = skills.reduce(
    (acc, skill) =>
      acc + skill.lessons.filter((l) => user.completedLessons.includes(`${skill.id}-${l.id}`)).length,
    0
  );

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  const stats = [
    { label: "Total XP", value: `${user.xp}`, icon: "star", color: "#f59e0b" },
    { label: "Level", value: `${user.level}`, icon: "trending-up", color: "#10b981" },
    { label: "Streak", value: `${user.streak}d`, icon: "flame", color: "#ef4444" },
    { label: "Tasks Done", value: `${user.completedTasks.length}/${dailyTasks.length}`, icon: "checkmark-circle", color: "#3b82f6" },
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient
          colors={["#0d1524", "#1a2744"]}
          style={s.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {user.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={s.name}>{user.fullName}</Text>
          <Text style={s.username}>@{user.username}</Text>
          {user.school ? (
            <View style={s.schoolBadge}>
              <Ionicons name="school" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={s.schoolText}>{user.school}</Text>
            </View>
          ) : null}
        </LinearGradient>

        <View style={s.body}>
          {/* Stats Grid */}
          <View style={s.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: stat.color + "18" }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* XP Progress */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Level Progress</Text>
            <View style={s.progressCard}>
              <View style={s.progressRow}>
                <Text style={s.progressLabel}>Level {user.level}</Text>
                <Text style={s.progressPct}>{progress}%</Text>
              </View>
              <View style={s.barBg}>
                <View style={[s.barFill, { width: `${progress}%` as any }]} />
              </View>
              <Text style={s.progressSub}>{100 - progress} XP until Level {user.level + 1}</Text>
            </View>
          </View>

          {/* Goal */}
          {currentGoal && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Current Goal</Text>
              <Pressable
                style={[s.goalCard, { borderColor: currentGoal.color + "50" }]}
                onPress={() => router.push("/goals")}
              >
                <View style={[s.goalIcon, { backgroundColor: currentGoal.color + "20" }]}>
                  <Ionicons name={currentGoal.icon as any} size={24} color={currentGoal.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.goalTitle}>{currentGoal.title}</Text>
                  <Text style={s.goalSub}>{currentGoal.difficulty} · {currentGoal.salaryRange}</Text>
                </View>
                <View style={s.changeBadge}>
                  <Text style={s.changeText}>Change</Text>
                </View>
              </Pressable>
            </View>
          )}

          {/* Info */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Details</Text>
            <View style={s.infoCard}>
              <InfoRow icon="person" label="Username" value={`@${user.username}`} colors={colors} />
              <InfoRow icon="book" label="Class" value={`Class ${user.classStandard}`} colors={colors} />
              {user.usnOrSetsNo ? (
                <InfoRow icon="document-text" label="USN / Seat No." value={user.usnOrSetsNo} colors={colors} />
              ) : null}
              <InfoRow icon="checkmark-done" label="Lessons Completed" value={`${completedLessons}`} colors={colors} />
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={s.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, colors }: {
  icon: string; label: string; value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
      <Ionicons name={icon as any} size={16} color={colors.mutedForeground} />
      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{value}</Text>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    safe: { flex: 1 },
    header: { paddingTop: 40, paddingBottom: 32, alignItems: "center" },
    avatar: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
      marginBottom: 12, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)",
    },
    avatarText: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
    name: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
    username: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginBottom: 8 },
    schoolBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    schoolText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)" },
    body: { padding: 16 },
    statsGrid: { flexDirection: "row", gap: 10, marginTop: 8 },
    statCard: {
      flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12,
      alignItems: "center", borderWidth: 1, borderColor: colors.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 6 },
    statValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 },
    statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" },
    section: { marginTop: 20 },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 10 },
    progressCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
    progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    progressLabel: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground },
    progressPct: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primary },
    barBg: { height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: "hidden" },
    barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
    progressSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 8 },
    goalCard: { backgroundColor: colors.card, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5 },
    goalIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    goalTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground },
    goalSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    changeBadge: { backgroundColor: colors.primary + "18", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    changeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary },
    infoCard: {
      backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    logoutBtn: {
      marginTop: 24, backgroundColor: colors.destructive + "12", borderRadius: 14,
      paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      borderWidth: 1, borderColor: colors.destructive + "30",
    },
    logoutText: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.destructive },
  });
}
