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
import { newsItems } from "@/data/news";

export default function NewsScreen() {
  const colors = useColors();
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.topBar}>
        <Text style={s.pageTitle}>Daily News</Text>
        <Text style={s.pageSub}>Stay current with education & tech</Text>
      </View>

      <FlatList
        data={newsItems}
        keyExtractor={(n) => n.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item: news }) => (
          <Pressable
            style={s.card}
            onPress={() => router.push(`/news/${news.id}`)}
          >
            <View style={[s.iconWrap, { backgroundColor: news.color + "18" }]}>
              <Ionicons name={news.iconName as any} size={24} color={news.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.cardTop}>
                <View style={[s.catBadge, { backgroundColor: news.color + "15" }]}>
                  <Text style={[s.catText, { color: news.color }]}>{news.category}</Text>
                </View>
                <Text style={s.dateText}>{news.date}</Text>
              </View>
              <Text style={s.newsTitle} numberOfLines={2}>{news.title}</Text>
              <Text style={s.newsSummary} numberOfLines={2}>{news.summary}</Text>
            </View>
          </Pressable>
        )}
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
      borderColor: colors.border, padding: 14, flexDirection: "row", gap: 12,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    iconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 2 },
    cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
    catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    catText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
    dateText: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    newsTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4, lineHeight: 20 },
    newsSummary: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 17 },
  });
}
