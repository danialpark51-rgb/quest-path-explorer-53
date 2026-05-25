import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
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
import { quizzes } from "@/data/quizzes";

export default function QuizPlayScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addXP } = useUser();
  const s = makeStyles(colors);

  const quiz = quizzes.find((q) => q.id === id);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  if (!quiz) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
        <View style={s.center}>
          <Text style={s.emptyTitle}>Quiz not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const question = quiz.questions[current];
  const isLast = current === quiz.questions.length - 1;
  const isCorrect = selected === question.correctAnswer;

  const handleSelect = async (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === question.correctAnswer) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleNext = async () => {
    const newAnswers = [...answers, selected];
    if (isLast) {
      const s = newAnswers.filter((a, i) => a === quiz.questions[i].correctAnswer).length;
      setScore(s);
      setFinished(true);
      const xpEarned = Math.round((s / quiz.questions.length) * 50);
      await addXP(xpEarned);
    } else {
      setAnswers(newAnswers);
      setCurrent(current + 1);
      setSelected(null);
    }
  };

  if (finished) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    const grade =
      pct >= 80 ? { label: "Excellent!", color: "#10b981", icon: "trophy" }
        : pct >= 60 ? { label: "Good Job!", color: "#f59e0b", icon: "star" }
        : { label: "Keep Practicing", color: "#ef4444", icon: "refresh" };

    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={s.resultContainer} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[grade.color, grade.color + "cc"]}
            style={s.resultBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={grade.icon as any} size={48} color="#fff" />
          </LinearGradient>
          <Text style={[s.resultGrade, { color: grade.color }]}>{grade.label}</Text>
          <Text style={s.resultScore}>{score} / {quiz.questions.length}</Text>
          <Text style={s.resultPct}>{pct}% correct</Text>
          <Text style={s.resultXP}>+{Math.round((score / quiz.questions.length) * 50)} XP earned</Text>

          <View style={s.reviewCard}>
            {quiz.questions.map((q, i) => {
              const userAns = answers[i] ?? null;
              const correct = userAns === q.correctAnswer;
              return (
                <View key={q.id} style={s.reviewRow}>
                  <View style={[s.reviewIcon, { backgroundColor: correct ? "#10b981" + "20" : "#ef4444" + "20" }]}>
                    <Ionicons
                      name={correct ? "checkmark" : "close"}
                      size={14}
                      color={correct ? "#10b981" : "#ef4444"}
                    />
                  </View>
                  <Text style={s.reviewQ} numberOfLines={2}>{q.question}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[s.retryBtn, { backgroundColor: grade.color }]}
            onPress={() => {
              setCurrent(0);
              setSelected(null);
              setAnswers([]);
              setFinished(false);
              setScore(0);
            }}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={s.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.back()}
          >
            <Text style={[s.backText, { color: colors.primary }]}>Back to Quizzes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      {/* Progress */}
      <View style={s.progressBar}>
        {quiz.questions.map((_, i) => (
          <View
            key={i}
            style={[
              s.progressDot,
              {
                backgroundColor:
                  i < current
                    ? colors.primary
                    : i === current
                    ? colors.primary + "60"
                    : colors.muted,
              },
            ]}
          />
        ))}
      </View>

      <View style={s.qHeader}>
        <Text style={s.qNum}>Question {current + 1} of {quiz.questions.length}</Text>
        <View style={[s.levelBadge, {
          backgroundColor:
            quiz.level === "Easy" ? "#10b981" + "18"
              : quiz.level === "Medium" ? "#f59e0b" + "18"
              : "#ef4444" + "18",
        }]}>
          <Text style={[s.levelText, {
            color: quiz.level === "Easy" ? "#10b981" : quiz.level === "Medium" ? "#f59e0b" : "#ef4444",
          }]}>
            {quiz.level}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.questionCard}>
          <Text style={s.questionText}>{question.question}</Text>
        </View>

        <View style={s.options}>
          {question.options.map((opt, i) => {
            let bg = colors.card;
            let border = colors.border;
            let textColor = colors.foreground;

            if (selected !== null) {
              if (i === question.correctAnswer) {
                bg = "#10b981" + "18";
                border = "#10b981";
                textColor = "#10b981";
              } else if (i === selected && i !== question.correctAnswer) {
                bg = "#ef4444" + "18";
                border = "#ef4444";
                textColor = "#ef4444";
              }
            } else if (selected === i) {
              bg = colors.primary + "18";
              border = colors.primary;
            }

            return (
              <Pressable
                key={i}
                style={[s.option, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleSelect(i)}
                disabled={selected !== null}
              >
                <View style={[s.optLetter, { backgroundColor: border + "30" }]}>
                  <Text style={[s.optLetterText, { color: textColor }]}>
                    {["A", "B", "C", "D"][i]}
                  </Text>
                </View>
                <Text style={[s.optText, { color: textColor }]}>{opt}</Text>
                {selected !== null && i === question.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                )}
                {selected === i && i !== question.correctAnswer && (
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                )}
              </Pressable>
            );
          })}
        </View>

        {selected !== null && (
          <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={s.nextGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={s.nextText}>{isLast ? "See Results" : "Next Question"}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    safe: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    progressBar: { flexDirection: "row", gap: 4, paddingHorizontal: 16, paddingVertical: 12 },
    progressDot: { flex: 1, height: 4, borderRadius: 2 },
    qHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 12 },
    qNum: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    content: { padding: 16, paddingBottom: 40 },
    questionCard: {
      backgroundColor: colors.card, borderRadius: 20, padding: 20, marginBottom: 20,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
    },
    questionText: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, lineHeight: 26 },
    options: { gap: 10, marginBottom: 20 },
    option: {
      borderRadius: 14, borderWidth: 1.5, padding: 14,
      flexDirection: "row", alignItems: "center", gap: 12,
    },
    optLetter: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    optLetterText: { fontSize: 13, fontFamily: "Inter_700Bold" },
    optText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
    nextBtn: { borderRadius: 14, overflow: "hidden" },
    nextGrad: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    nextText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    resultContainer: { padding: 24, alignItems: "center" },
    resultBadge: { width: 100, height: 100, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 20, marginTop: 20 },
    resultGrade: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
    resultScore: { fontSize: 48, fontFamily: "Inter_700Bold", color: colors.foreground },
    resultPct: { fontSize: 16, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 8 },
    resultXP: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#f59e0b", marginBottom: 24 },
    reviewCard: { width: "100%", backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10, marginBottom: 24 },
    reviewRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    reviewIcon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    reviewQ: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground },
    retryBtn: { width: "100%", borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
    retryText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    backBtn: { paddingVertical: 12 },
    backText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  });
}
