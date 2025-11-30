import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { removeDuplicateDoses } from "../lib/database/models/dose";
import { initDatabase } from "../lib/database/operations";
import { registerBackgroundFetchAsync } from "../lib/notifications/background-tasks";
import { setupNotificationListeners } from "../lib/notifications/handlers";
import { initializeNotifications } from "../lib/notifications/setup";
import { AppProvider } from "../lib/context/AppContext";
import { useThemeColors } from "../lib/hooks/useThemeColors";

const ONBOARDING_KEY = "@medicine_tracker_onboarding_complete";

function RootLayoutContent() {
  const colors = useThemeColors();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initDatabase();

      // Remove duplicate doses on app start
      const duplicatesRemoved = await removeDuplicateDoses();
      if (duplicatesRemoved > 0) {
        console.log(
          `Cleaned up ${duplicatesRemoved} duplicate doses on app start`
        );
      }

      // Initialize notifications
      await initializeNotifications();

      // Setup notification listeners
      const cleanup = setupNotificationListeners();

      // Register background tasks
      await registerBackgroundFetchAsync();

      // Check if onboarding is complete
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);

      setIsReady(true);

      // Navigate to onboarding if not complete
      if (!onboardingComplete && segments[0] !== "onboarding") {
        router.replace("/onboarding");
      }

      return cleanup;
    } catch (error) {
      console.error("Error initializing app:", error);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return null; // Or a splash screen component
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
          flex: 1,
        },
        // Prevent flickering during navigation
        animation: "default",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="notification-screen"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootLayoutContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
