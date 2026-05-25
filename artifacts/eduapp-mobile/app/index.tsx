import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";

const CLASSES = ["6", "7", "8", "9", "10"];

export default function LoginScreen() {
  const colors = useColors();
  const { isLoggedIn, isLoading, setUser, user } = useUser();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    school: "",
    usnOrSetsNo: "",
    classStandard: "",
  });
  const [classOpen, setClassOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      if (user?.selectedGoal) {
        router.replace("/(tabs)");
      } else {
        router.replace("/goals");
      }
    }
  }, [isLoggedIn, isLoading, user]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.classStandard) e.classStandard = "Please select your class";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    await setUser({
      ...form,
      selectedGoal: "",
      xp: 0,
      level: 1,
      streak: 3,
      completedTasks: [],
      completedLessons: [],
    });
    setSubmitting(false);
    router.replace("/goals");
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={s.hero}>
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={s.iconWrap}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="school" size={36} color="#fff" />
            </LinearGradient>
            <Text style={s.appName}>EduPath</Text>
            <Text style={s.tagline}>Your personalized learning journey starts here</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Field
              label="Username"
              icon="at-sign"
              value={form.username}
              onChange={(v) => setForm({ ...form, username: v })}
              placeholder="Choose a username"
              error={errors.username}
              colors={colors}
            />
            <Field
              label="Full Name"
              icon="user"
              value={form.fullName}
              onChange={(v) => setForm({ ...form, fullName: v })}
              placeholder="Your full name"
              error={errors.fullName}
              colors={colors}
            />
            <Field
              label="School / College"
              icon="home"
              value={form.school}
              onChange={(v) => setForm({ ...form, school: v })}
              placeholder="Your school or college"
              colors={colors}
            />
            <Field
              label="USN / Seat Number"
              icon="hash"
              value={form.usnOrSetsNo}
              onChange={(v) => setForm({ ...form, usnOrSetsNo: v })}
              placeholder="Your USN or seat number"
              colors={colors}
            />

            {/* Class Selector */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>
                <Feather name="book-open" size={13} color={colors.primary} /> Class / Standard
              </Text>
              <Pressable
                style={[s.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
                onPress={() => setClassOpen(!classOpen)}
              >
                <Text style={form.classStandard ? s.inputText : s.placeholder}>
                  {form.classStandard ? `Class ${form.classStandard}` : "Select your class"}
                </Text>
                <Feather name={classOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
              </Pressable>
              {errors.classStandard && <Text style={s.error}>{errors.classStandard}</Text>}
              {classOpen && (
                <View style={s.dropdown}>
                  {CLASSES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[s.dropItem, form.classStandard === c && s.dropItemActive]}
                      onPress={() => { setForm({ ...form, classStandard: c }); setClassOpen(false); }}
                    >
                      <Text style={[s.dropText, form.classStandard === c && { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                        Class {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={s.btn}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={s.btnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnText}>Get Started</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, icon, value, onChange, placeholder, error, colors,
}: {
  label: string; icon: string; value: string; onChange: (v: string) => void;
  placeholder: string; error?: string; colors: ReturnType<typeof useColors>;
}) {
  const s = makeStyles(colors);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>
        <Feather name={icon as any} size={13} color={colors.primary} /> {label}
      </Text>
      <TextInput
        style={[s.input, s.inputText]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize={label === "Username" ? "none" : "words"}
      />
      {error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    scroll: { padding: 24, paddingBottom: 40 },
    hero: { alignItems: "center", marginBottom: 32, marginTop: 16 },
    iconWrap: {
      width: 80, height: 80, borderRadius: 24,
      alignItems: "center", justifyContent: "center", marginBottom: 16,
    },
    appName: {
      fontSize: 32, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6,
    },
    tagline: {
      fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground,
      textAlign: "center", lineHeight: 20,
    },
    card: {
      backgroundColor: colors.card, borderRadius: 20,
      padding: 20, gap: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    },
    fieldWrap: { gap: 6 },
    label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    input: {
      backgroundColor: colors.muted, borderRadius: 10, paddingHorizontal: 14,
      paddingVertical: 12, borderWidth: 1, borderColor: colors.border,
    },
    inputText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground },
    placeholder: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    error: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.destructive },
    dropdown: {
      backgroundColor: colors.card, borderRadius: 10, borderWidth: 1,
      borderColor: colors.border, overflow: "hidden",
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    },
    dropItem: { paddingVertical: 12, paddingHorizontal: 16 },
    dropItemActive: { backgroundColor: colors.primary + "15" },
    dropText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground },
    btn: { borderRadius: 12, overflow: "hidden", marginTop: 4 },
    btnGrad: { paddingVertical: 16, alignItems: "center" },
    btnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  });
}
