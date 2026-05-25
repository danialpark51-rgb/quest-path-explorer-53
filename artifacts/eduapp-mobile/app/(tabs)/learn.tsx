import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

export default function LearnScreen() {
  const colors = useColors();
  const { user } = useUser();
  const s = makeStyles(colors);

  const completedLessons = user?.completedLessons ?? [];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.topBar}>
        <Text style={s.pageTitle}>Skill Modules</Text>
        <Text style={s.pageSub}>{skills.length} skills available</Text>
      </View>

      <FlatList
        data={skills}
        keyExtractor={(s) => s.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item: skill }) => {
          const completed = completedLessons.filter((l) =>
            l.startsWith(`${skill.id}-`)
          ).length;
          const pct = Math.round((completed / skill.lessons.length) * 100);
          return (
            <Pressable
              style={s.card}
              onPress={() => router.push(`/skill/${skill.id}`)}
            >
              <View style={[s.iconWrap, { backgroundColor: colors.primary + "18" }]}>
                <Ionicons name={skill.icon as any} size={28} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.skillName}>{skill.title}</Text>
                <Text style={s.skillDesc} numberOfLines={1}>{skill.description}</Text>
                <View style={s.progressRow}>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={s.pctText}>{pct}%</Text>
                </View>
              </View>
              <View style={s.meta}>
                <Text style={s.lessonCount}>{skill.lessons.length}</Text>
                <Text style={s.lessonLabel}>lessons</Text>
              </View>
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
    topBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
    pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground },
    pageSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    list: { paddingHorizontal: 16, paddingBottom: 120 },
    card: {
      backgroundColor: colors.card, borderRadius: 16, borderWidth: 1,
      borderColor: colors.border, padding: 16, flexDirection: "row",
      alignItems: "center", gap: 14,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    iconWrap: { width: 54, height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    skillName: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 3 },
    skillDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 8 },
    progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    barBg: { flex: 1, height: 5, backgroundColor: colors.muted, borderRadius: 3, overflow: "hidden" },
    barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 3 },
    pctText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.primary, width: 30 },
    meta: { alignItems: "center" },
    lessonCount: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.primary },
    lessonLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
  });
}
