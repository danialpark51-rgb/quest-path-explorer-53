import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UserProvider } from "@/context/UserContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="goals" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="skill/[id]"
        options={{
          headerShown: true,
          headerTitle: "Skill",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#f5f6f9" },
          headerTintColor: "#10b981",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="quiz/[id]"
        options={{
          headerShown: true,
          headerTitle: "Quiz",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#f5f6f9" },
          headerTintColor: "#10b981",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="news/[id]"
        options={{
          headerShown: true,
          headerTitle: "News",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#f5f6f9" },
          headerTintColor: "#10b981",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <UserProvider>
              <RootLayoutNav />
            </UserProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
