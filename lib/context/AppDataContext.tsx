import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  DoseWithMedicine,
  MedicineStats,
  MedicineWithNextDose,
} from "../../types/medicine";
import {
  useMedicineStats,
  useTodayDoses,
  useUpcomingDoses,
} from "../hooks/useDoses";
import { useMedicines } from "../hooks/useMedicines";

/**
 * App Data Context
 *
 * Provides centralized access to app data:
 * - Medicines
 * - Today's doses
 * - Statistics
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface AppDataContextType {
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
  upcomingDoses: {
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

// ============================================================================
// Context Creation
// ============================================================================

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface AppDataProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export const AppDataProvider: React.FC<AppDataProviderProps> = ({
  children,
}) => {
  // Use existing hooks
  const {
    medicines,
    loading: medicinesLoading,
    error: medicinesError,
    refresh: refreshMedicines,
  } = useMedicines();

  const {
    doses,
    loading: dosesLoading,
    error: dosesError,
    refresh: refreshDoses,
  } = useTodayDoses();

  const {
    doses: upcomingDoses,
    loading: upcomingLoading,
    error: upcomingError,
    refresh: refreshUpcoming,
  } = useUpcomingDoses(24);

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useMedicineStats();

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshMedicines(),
      refreshDoses(),
      refreshUpcoming(),
      refreshStats(),
    ]);
  }, [refreshMedicines, refreshDoses, refreshUpcoming, refreshStats]);

  const contextValue = useMemo(
    () => ({
      medicines: {
        data: medicines,
        loading: medicinesLoading,
        error: medicinesError,
        refresh: refreshMedicines,
      },
      todayDoses: {
        data: doses,
        loading: dosesLoading,
        error: dosesError,
        refresh: refreshDoses,
      },
      upcomingDoses: {
        data: upcomingDoses,
        loading: upcomingLoading,
        error: upcomingError,
        refresh: refreshUpcoming,
      },
      stats: {
        data: stats,
        loading: statsLoading,
        error: statsError,
        refresh: refreshStats,
      },
      refreshAll,
    }),
    [
      medicines,
      medicinesLoading,
      medicinesError,
      refreshMedicines,
      doses,
      dosesLoading,
      dosesError,
      refreshDoses,
      upcomingDoses,
      upcomingLoading,
      upcomingError,
      refreshUpcoming,
      stats,
      statsLoading,
      statsError,
      refreshStats,
      refreshAll,
    ]
  );

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};
