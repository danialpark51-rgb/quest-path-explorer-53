import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { goals } from "@/data/goals";

export default function GoalSelectionScreen() {
  const colors = useColors();
  const { user, setUser } = useUser();
  const [selected, setSelected] = useState(user?.selectedGoal ?? "");

  const handleSelect = (id: string) => {
    setSelected(id);
    Haptics.selectionAsync();
  };

  const handleConfirm = async () => {
    if (!selected || !user) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setUser({ ...user, selectedGoal: selected });
    router.replace("/(tabs)");
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.header}>
        <LinearGradient
          colors={["#10b981", "#059669"]}
          style={s.headerGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={s.headerTitle}>Choose Your Goal</Text>
          <Text style={s.headerSub}>Pick the career path you want to pursue</Text>
        </LinearGradient>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(g) => g.id}
        numColumns={2}
        contentContainerStyle={s.grid}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            selected={selected === item.id}
            onPress={() => handleSelect(item.id)}
            colors={colors}
          />
        )}
      />

      {selected && (
        <View style={s.footer}>
          <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85}>
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={s.confirmBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={s.confirmText}>Start Learning</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function GoalCard({
  goal, selected, onPress, colors,
}: {
  goal: typeof goals[0]; selected: boolean; onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const s = makeStyles(colors);
  return (
    <Pressable
      style={[s.card, selected && { borderColor: goal.color, borderWidth: 2.5 }]}
      onPress={onPress}
    >
      <View style={[s.iconCircle, { backgroundColor: goal.color + "20" }]}>
        <Ionicons name={goal.icon as any} size={28} color={goal.color} />
      </View>
      <Text style={s.cardTitle}>{goal.title}</Text>
      <Text style={s.cardSub} numberOfLines={2}>{goal.description}</Text>
      <View style={[s.diffBadge, { backgroundColor: goal.color + "18" }]}>
        <Text style={[s.diffText, { color: goal.color }]}>{goal.difficulty}</Text>
      </View>
      {selected && (
        <View style={[s.checkBadge, { backgroundColor: goal.color }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    safe: { flex: 1 },
    header: { marginBottom: 4 },
    headerGrad: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 28 },
    headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
    headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)" },
    grid: { padding: 16, paddingBottom: 120 },
    card: {
      flex: 1, backgroundColor: colors.card, borderRadius: 16,
      padding: 16, borderWidth: 1.5, borderColor: colors.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, position: "relative",
    },
    iconCircle: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    cardTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    cardSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 16, marginBottom: 8 },
    diffBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    diffText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
    checkBadge: {
      position: "absolute", top: 10, right: 10,
      width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center",
    },
    footer: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: 20, backgroundColor: colors.background,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    confirmBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    confirmText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  });
}
