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
