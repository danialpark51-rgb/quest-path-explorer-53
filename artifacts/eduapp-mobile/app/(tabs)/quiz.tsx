import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { quizzes } from "@/data/quizzes";

const LEVELS = ["All", "Easy", "Medium", "Hard"] as const;

export default function QuizScreen() {
  const colors = useColors();
  const { user } = useUser();
  const [filter, setFilter] = useState<typeof LEVELS[number]>("All");
  const s = makeStyles(colors);

  const goalId = user?.selectedGoal ?? "";
  const filtered = quizzes.filter((q) => {
    if (filter !== "All" && q.level !== filter) return false;
    return true;
  });

  const goalFirst = [
    ...filtered.filter((q) => q.goalId === goalId),
    ...filtered.filter((q) => q.goalId !== goalId),
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.topBar}>
        <Text style={s.pageTitle}>Quizzes</Text>
        <Text style={s.pageSub}>{quizzes.length} quizzes available</Text>
      </View>

      {/* Filter Chips */}
      <View style={s.filters}>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[s.chip, filter === level && s.chipActive]}
            onPress={() => setFilter(level)}
          >
            <Text style={[s.chipText, filter === level && s.chipTextActive]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={goalFirst}
        keyExtractor={(q) => q.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item: quiz }) => {
          const levelColor =
            quiz.level === "Easy"
              ? colors.primary
              : quiz.level === "Medium"
              ? "#f59e0b"
              : colors.destructive;
          const isGoalMatch = quiz.goalId === goalId;
          return (
            <Pressable
              style={[s.card, isGoalMatch && { borderColor: colors.primary + "50" }]}
              onPress={() => router.push(`/quiz/${quiz.id}`)}
            >
              <View style={[s.iconWrap, { backgroundColor: levelColor + "18" }]}>
                <Ionicons name="trophy" size={24} color={levelColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.cardTop}>
                  <Text style={s.quizTitle} numberOfLines={1}>{quiz.topic}</Text>
                  {isGoalMatch && (
                    <View style={s.goalBadge}>
                      <Text style={s.goalBadgeText}>Your Goal</Text>
                    </View>
                  )}
                </View>
                <View style={s.meta}>
                  <View style={[s.levelBadge, { backgroundColor: levelColor + "18" }]}>
                    <Text style={[s.levelText, { color: levelColor }]}>{quiz.level}</Text>
                  </View>
                  <Text style={s.qCount}>{quiz.questions.length} questions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
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
    topBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
    pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    pageSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    filters: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
    chip: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
      backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    chipTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
    list: { paddingHorizontal: 16, paddingBottom: 120 },
    card: {
      backgroundColor: colors.card, borderRadius: 16, borderWidth: 1.5,
      borderColor: colors.border, padding: 14, flexDirection: "row",
      alignItems: "center", gap: 12,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    iconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    quizTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1 },
    goalBadge: { backgroundColor: colors.primary + "20", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
    goalBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.primary },
    meta: { flexDirection: "row", alignItems: "center", gap: 8 },
    levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    qCount: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
  });
}
