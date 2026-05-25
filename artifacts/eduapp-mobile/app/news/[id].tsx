import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { newsItems } from "@/data/news";

export default function NewsDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = makeStyles(colors);

  const news = newsItems.find((n) => n.id === id);

  if (!news) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
        <View style={s.center}>
          <Text style={s.emptyText}>Article not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={[s.iconWrap, { backgroundColor: news.color + "18" }]}>
          <Ionicons name={news.iconName as any} size={36} color={news.color} />
        </View>

        <View style={s.meta}>
          <View style={[s.catBadge, { backgroundColor: news.color + "18" }]}>
            <Text style={[s.catText, { color: news.color }]}>{news.category}</Text>
          </View>
          <Text style={s.dateText}>{news.date}</Text>
        </View>

        <Text style={s.title}>{news.title}</Text>
        <Text style={s.summary}>{news.summary}</Text>

        <View style={s.divider} />
        <Text style={s.bodyText}>{news.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    safe: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: { fontSize: 16, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    content: { padding: 20, paddingBottom: 40 },
    iconWrap: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    meta: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    catText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    dateText: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    title: { fontSize: 24, fontFamily: "Inter_700Bold", color: colors.foreground, lineHeight: 32, marginBottom: 12 },
    summary: { fontSize: 15, fontFamily: "Inter_500Medium", color: colors.mutedForeground, lineHeight: 22, marginBottom: 16 },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
    bodyText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 24 },
  });
}
