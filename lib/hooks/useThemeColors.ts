import { useMemo } from "react";
import { Colors } from "../../constants/design";
import { useTheme } from "../context/AppContext";

/**
 * useThemeColors Hook
 *
 * Provides quick access to theme colors without manual color scheme checking
 *
 * Usage:
 * ```typescript
 * const colors = useThemeColors();
 * <View style={{ backgroundColor: colors.background }} />
 * ```
 */
export const useThemeColors = () => {
  const { colors } = useTheme();
  return colors;
};

/**
 * useIsDarkMode Hook
 *
 * Provides quick access to dark mode status
 *
 * Usage:
 * ```typescript
 * const isDark = useIsDarkMode();
 * const iconColor = isDark ? '#fff' : '#000';
 * ```
 */
export const useIsDarkMode = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

/**
 * useThemedStyle Hook
 *
 * Creates a memoized style object based on theme
 *
 * Usage:
 * ```typescript
 * const styles = useThemedStyle((colors, isDark) => ({
 *   container: {
 *     backgroundColor: colors.background,
 *     borderColor: colors.border,
 *   },
 *   text: {
 *     color: isDark ? colors.textSecondary : colors.text,
 *   },
 * }));
 * ```
 */
export const useThemedStyle = <T extends Record<string, any>>(
  styleFactory: (colors: typeof Colors.light, isDark: boolean) => T
): T => {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => styleFactory(colors, isDark),
    [colors, isDark, styleFactory]
  );
};

/**
 * useThemedValue Hook
 *
 * Returns different values based on theme
 *
 * Usage:
 * ```typescript
 * const iconName = useThemedValue('sun', 'moon');
 * const opacity = useThemedValue(0.8, 0.6);
 * ```
 */
export const useThemedValue = <T>(lightValue: T, darkValue: T): T => {
  const { isDark } = useTheme();
  return isDark ? darkValue : lightValue;
};
