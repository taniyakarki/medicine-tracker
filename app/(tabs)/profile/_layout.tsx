import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../../constants/design";

export default function ProfileLayout() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

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
