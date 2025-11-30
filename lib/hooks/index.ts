/**
 * Centralized Hooks Export
 *
 * Export all hooks from a single location for easier imports
 */

// Theme hooks
export {
  useIsDarkMode,
  useThemeColors,
  useThemedStyle,
  useThemedValue,
} from "./useThemeColors";

// Context hooks
export { useApp, useColors, useIsDark } from "../context/AppContext";
export { useAppData } from "../context/AppDataContext";
export { useTheme } from "../context/ThemeContext";
export { useUser } from "../context/UserContext";

// Data hooks
export { useMedicine, useMedicines } from "./useMedicines";

export {
  useCalendarData,
  useDoseActions,
  useMedicineStats,
  useRecentActivity,
  useTodayDoses,
  useUpcomingDoses,
} from "./useDoses";

// Time hooks
export { useTime } from "./useTime";
