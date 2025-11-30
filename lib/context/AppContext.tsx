import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '../../types/database';
import { MedicineWithNextDose, DoseWithMedicine, MedicineStats } from '../../types/medicine';

/**
 * Global App Context Structure
 * 
 * Provides centralized access to:
 * - User data
 * - Theme configuration
 * - App data (medicines, doses, stats)
 */

// ============================================================================
// Type Definitions
// ============================================================================

type ThemeMode = 'light' | 'dark' | 'auto';
type ActiveTheme = 'light' | 'dark';

interface ThemeContextValue {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  isDark: boolean;
  colors: typeof import('../../constants/design').Colors.light;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isLoading: boolean;
}

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refresh: () => Promise<void>;
}

interface AppDataContextValue {
  medicines: {
    data: MedicineWithNextDose[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
  };
  todayDoses: {
    data: DoseWithMedicine[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
  };
  stats: {
    data: MedicineStats;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
  };
  refreshAll: () => Promise<void>;
}

interface AppContextValue {
  theme: ThemeContextValue;
  user: UserContextValue;
  appData: AppDataContextValue;
}

// ============================================================================
// Context Creation
// ============================================================================

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Import and use existing providers
  const { ThemeProvider } = require('./ThemeContext');
  const { UserProvider } = require('./UserContext');
  const { AppDataProvider } = require('./AppDataContext');

  return (
    <ThemeProvider>
      <UserProvider>
        <AppDataProvider>
          {children}
        </AppDataProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

// ============================================================================
// Hook: useApp (Access entire context)
// ============================================================================

export const useApp = (): AppContextValue => {
  const theme = useTheme();
  const user = useUser();
  const appData = useAppData();

  return {
    theme,
    user,
    appData,
  };
};

// ============================================================================
// Hook: useTheme (Access theme only)
// ============================================================================

export const useTheme = (): ThemeContextValue => {
  const { useTheme: useThemeOriginal } = require('./ThemeContext');
  return useThemeOriginal();
};

// ============================================================================
// Hook: useUser (Access user only)
// ============================================================================

export const useUser = (): UserContextValue => {
  const { useUser: useUserOriginal } = require('./UserContext');
  return useUserOriginal();
};

// ============================================================================
// Hook: useAppData (Access app data only)
// ============================================================================

export const useAppData = (): AppDataContextValue => {
  const { useAppData: useAppDataOriginal } = require('./AppDataContext');
  return useAppDataOriginal();
};

// ============================================================================
// Hook: useColors (Quick access to colors based on theme)
// ============================================================================

export const useColors = () => {
  const { colors } = useTheme();
  return colors;
};

// ============================================================================
// Hook: useIsDark (Quick access to dark mode status)
// ============================================================================

export const useIsDark = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

