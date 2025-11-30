import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { User } from "../../types/database";
import {
  ensureUserExists,
  updateUser as updateUserDB,
} from "../database/models/user";
import { formatErrorMessage, logError } from "../utils/error-helpers";

/**
 * User Context
 * 
 * Provides centralized access to user data and operations
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================================
// Context Creation
// ============================================================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface UserProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await ensureUserExists();
      setUser(userData);
      setError(null);
    } catch (err) {
      const message = formatErrorMessage(err, "Failed to load user");
      setError(message);
      logError("UserContext.loadUser", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      if (!user) {
        throw new Error("No user to update");
      }

      try {
        await updateUserDB(user.id, userData);
        await loadUser();
      } catch (err) {
        logError("UserContext.updateUser", err, { userData });
        throw new Error(formatErrorMessage(err, "Failed to update user"));
      }
    },
    [user, loadUser]
  );

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      error,
      updateUser,
      refresh: loadUser,
    }),
    [user, isLoading, error, updateUser, loadUser]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

