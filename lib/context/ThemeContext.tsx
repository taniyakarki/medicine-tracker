import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { Colors } from "../../constants/design";
import { ensureUserExists } from "../database/models/user";
import { updateUser } from "../database/models/user";

type ThemeMode = "light" | "dark" | "auto";
type ActiveTheme = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  isDark: boolean;
  colors: typeof Colors.light;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [isLoading, setIsLoading] = useState(true);

  // Calculate active theme based on mode and system preference
  const activeTheme: ActiveTheme =
    themeMode === "auto"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const isValidThemeMode = (value: string): boolean => {
    return ["light", "dark", "auto"].includes(value);
  };

  const loadThemePreference = async () => {
    try {
      const user = await ensureUserExists();
      const savedTheme = user.theme_preference || "auto";
      if (isValidThemeMode(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      const user = await ensureUserExists();
      await updateUser(user.id, { theme_preference: mode });
    } catch (error) {
      console.error("Error saving theme preference:", error);
      throw new Error("Failed to save theme preference");
    }
  }, []);

  // Memoize computed values
  const isDark = useMemo(() => activeTheme === "dark", [activeTheme]);
  const colors = useMemo(() => isDark ? Colors.dark : Colors.light, [isDark]);

  const contextValue = useMemo(
    () => ({
      themeMode,
      activeTheme,
      isDark,
      colors,
      setThemeMode,
      isLoading,
    }),
    [themeMode, activeTheme, isDark, colors, setThemeMode, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

