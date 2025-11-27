import React from "react";
import { View, ViewStyle, useColorScheme } from "react-native";
import { BorderRadius, Colors, Shadows, Spacing } from "../../constants/design";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  elevated?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = "md",
  elevated = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[padding],
    ...(elevated ? Shadows.md : {}),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
};
