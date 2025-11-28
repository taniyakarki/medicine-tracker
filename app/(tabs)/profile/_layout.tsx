import { Stack } from "expo-router";
import { Platform, useColorScheme } from "react-native";
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
        animationEnabled: true,
        animationTypeForReplace: "push",
        // Detach previous screen to prevent flickering
        detachPreviousScreen: Platform.OS === "android",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="emergency-contacts/add"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="emergency-contacts/edit/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
