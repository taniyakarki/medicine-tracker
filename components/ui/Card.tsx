import React from "react";
import { View, ViewStyle } from "react-native";
import { BorderRadius, Shadows, Spacing } from "../../constants/design";
import { useTheme } from "../../lib/context/AppContext";

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
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[padding],
    ...(elevated ? Shadows.md : {}),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
};
