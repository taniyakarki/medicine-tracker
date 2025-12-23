import React from "react";
import { View, ViewStyle, Text, StyleProp } from "react-native";
import { BorderRadius, Shadows, Spacing } from "../../constants/design";
import { useTheme } from "../../lib/context/AppContext";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
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

  // Process children to wrap text strings in Text component
  const processedChildren = React.Children.map(children, (child) => {
    // Skip null, undefined, false, empty strings
    if (child === null || child === undefined || child === false || child === "") {
      return null;
    }

    // If child is a string or number, wrap it in a Text component
    if (typeof child === "string" || typeof child === "number") {
      return <Text style={{ color: colors.text }}>{child}</Text>;
    }

    // Return React elements as-is
    return child;
  });

  return <View style={[cardStyle, style]}>{processedChildren}</View>;
};
