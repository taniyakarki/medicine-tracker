import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import {
  BorderRadius,
  Layout,
  Spacing,
  Typography,
} from "../../constants/design";
import { useThemeColors, useIsDarkMode } from "../../lib/hooks/useThemeColors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const ButtonComponent: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  const buttonStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };

    // Size
    switch (size) {
      case "sm":
        baseStyle.height = 36;
        baseStyle.paddingHorizontal = Spacing.md;
        break;
      case "lg":
        baseStyle.height = 56;
        baseStyle.paddingHorizontal = Spacing.xl;
        break;
      default:
        baseStyle.height = Layout.buttonHeight;
        baseStyle.paddingHorizontal = Spacing.lg;
    }

    // Variant
    switch (variant) {
      case "secondary":
        baseStyle.backgroundColor = colors.secondary;
        break;
      case "ghost":
        baseStyle.backgroundColor = "transparent";
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border;
        break;
      case "danger":
        baseStyle.backgroundColor = colors.danger;
        break;
      default:
        baseStyle.backgroundColor = colors.primary;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    if (fullWidth) {
      baseStyle.width = "100%";
    }

    return baseStyle;
  }, [size, variant, disabled, fullWidth, colors]);

  const textStyleComputed = useMemo((): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: Typography.fontWeight.semibold,
    };

    switch (size) {
      case "sm":
        baseStyle.fontSize = Typography.fontSize.sm;
        break;
      case "lg":
        baseStyle.fontSize = Typography.fontSize.lg;
        break;
      default:
        baseStyle.fontSize = Typography.fontSize.base;
    }

    if (variant === "ghost") {
      baseStyle.color = colors.primary;
    } else {
      baseStyle.color = "#FFFFFF";
    }

    return baseStyle;
  }, [size, variant, colors]);

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "ghost" ? colors.primary : "#FFFFFF"}
        />
      ) : (
        <Text style={[textStyleComputed, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

ButtonComponent.displayName = 'Button';

export const Button = React.memo(ButtonComponent);
