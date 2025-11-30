import { Stack } from "expo-router";
import { useTheme } from "../../../lib/context/AppContext";

export default function ProfileLayout() {
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
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="emergency-contacts/add" />
      <Stack.Screen name="emergency-contacts/edit/[id]" />
      <Stack.Screen name="report-bug" />
    </Stack>
  );
}
