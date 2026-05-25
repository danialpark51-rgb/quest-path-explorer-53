import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { skills } from "@/data/skills";

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

export default function SkillDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, completeLesson, addXP } = useUser();
  const s = makeStyles(colors);

  const skill = skills.find((s) => s.id === id);

  if (!skill) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
        <View style={s.center}>
          <Text style={s.emptyTitle}>Skill not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completedIds = user?.completedLessons ?? [];
  const completedCount = skill.lessons.filter((l) =>
    completedIds.includes(`${skill.id}-${l.id}`)
  ).length;
  const pct = Math.round((completedCount / skill.lessons.length) * 100);

  const handleComplete = async (lessonId: number) => {
    const key = `${skill.id}-${lessonId}`;
    if (completedIds.includes(key)) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeLesson(key);
    await addXP(15);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      {/* Header */}
      <View style={s.topCard}>
        <View style={[s.iconWrap, { backgroundColor: colors.primary + "18" }]}>
          <Ionicons name={skill.icon as any} size={32} color={colors.primary} />
        </View>
        <Text style={s.skillName}>{skill.title}</Text>
        <Text style={s.skillDesc}>{skill.description}</Text>
        <View style={s.progressRow}>
          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={s.pctText}>{pct}%</Text>
        </View>
        <Text style={s.progressSub}>{completedCount} of {skill.lessons.length} lessons completed</Text>
      </View>

      <FlatList
        data={skill.lessons}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item: lesson, index }) => {
          const key = `${skill.id}-${lesson.id}`;
          const done = completedIds.includes(key);
          const levelColor = LEVEL_COLOR[lesson.level];
          return (
            <Pressable
              style={[s.lessonRow, done && { backgroundColor: colors.primary + "08" }]}
              onPress={() => handleComplete(lesson.id)}
            >
              <View style={s.lessonNum}>
                {done ? (
                  <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                ) : (
                  <View style={[s.numCircle, { borderColor: colors.border }]}>
                    <Text style={s.numText}>{index + 1}</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.lessonTitle, done && { color: colors.mutedForeground }]}>
                  {lesson.title}
                </Text>
                <View style={s.lessonMeta}>
                  <View style={[s.levelBadge, { backgroundColor: levelColor + "18" }]}>
                    <Text style={[s.levelText, { color: levelColor }]}>{lesson.level}</Text>
                  </View>
                  <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                  <Text style={s.duration}>{lesson.duration}</Text>
                </View>
              </View>
              {done ? (
                <Text style={s.xpEarned}>+15 XP</Text>
              ) : (
                <View style={s.tapHint}>
                  <Text style={s.tapHintText}>Tap to complete</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    safe: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    topCard: {
      margin: 16, backgroundColor: colors.card, borderRadius: 20, padding: 20,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
    },
    iconWrap: { width: 60, height: 60, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    skillName: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    skillDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 16, lineHeight: 19 },
    progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
    barBg: { flex: 1, height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: "hidden" },
    barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
    pctText: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary, width: 38 },
    progressSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    list: { paddingHorizontal: 16, paddingBottom: 32 },
    lessonRow: {
      backgroundColor: colors.card, borderRadius: 14, borderWidth: 1,
      borderColor: colors.border, padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
    },
    lessonNum: { width: 32, alignItems: "center" },
    numCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    numText: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground },
    lessonTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 5 },
    lessonMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
    levelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
    levelText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
    duration: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    xpEarned: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#f59e0b" },
    tapHint: { backgroundColor: colors.muted, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    tapHintText: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
  });
}
