import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../constants/design";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const themes: {
    mode: ThemeMode;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      mode: "light",
      label: "Light",
      description: "Always use light theme",
      icon: "sunny",
    },
    {
      mode: "dark",
      label: "Dark",
      description: "Always use dark theme",
      icon: "moon",
    },
    {
      mode: "auto",
      label: "Auto",
      description: "Follow system settings",
      icon: "phone-portrait",
    },
  ];

  return (
    <View style={styles.container}>
      {themes.map((theme) => (
        <TouchableOpacity
          key={theme.mode}
          style={[
            styles.themeOption,
            {
              backgroundColor:
                currentTheme === theme.mode
                  ? `${colors.primary}20`
                  : colors.surfaceSecondary,
              borderColor:
                currentTheme === theme.mode ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onSelectTheme(theme.mode)}
          activeOpacity={0.7}
        >
          <View style={styles.themeOptionLeft}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    currentTheme === theme.mode
                      ? `${colors.primary}30`
                      : `${colors.textSecondary}15`,
                },
              ]}
            >
              <Ionicons
                name={theme.icon}
                size={24}
                color={
                  currentTheme === theme.mode
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>
            <View style={styles.themeInfo}>
              <Text
                style={[
                  styles.themeLabel,
                  {
                    color:
                      currentTheme === theme.mode
                        ? colors.primary
                        : colors.text,
                  },
                ]}
              >
                {theme.label}
              </Text>
              <Text
                style={[
                  styles.themeDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {theme.description}
              </Text>
            </View>
          </View>
          {currentTheme === theme.mode && (
            <View
              style={[
                styles.checkmark,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  themeOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  themeDescription: {
    fontSize: Typography.fontSize.sm,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

