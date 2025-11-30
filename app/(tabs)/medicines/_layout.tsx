import { Stack } from "expo-router";
import { useTheme } from "../../../lib/context/AppContext";

export default function MedicinesLayout() {
  const { colors } = useTheme();

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
      <Stack.Screen
        name="index"
        options={{
          title: "Medicines",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Medicine Details",
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Medicine",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: "Edit Medicine",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
