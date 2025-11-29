import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface TimeContextValue {
  currentTime: Date;
}

const TimeContext = createContext<TimeContextValue | undefined>(undefined);

/**
 * Export context getter to avoid circular dependency with useTime
 */
export const getTimeContext = () => TimeContext;

interface TimeProviderProps {
  children: ReactNode;
  updateInterval?: number;
}

/**
 * TimeProvider - Provides a shared time reference to all child components
 * This prevents multiple timers from being created and reduces re-renders
 */
export const TimeProvider: React.FC<TimeProviderProps> = ({ 
  children, 
  updateInterval = 300000 // Default: 5 minutes
}) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Update time immediately
    setCurrentTime(new Date());

    // Set up interval to update time
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval]);

  return (
    <TimeContext.Provider value={{ currentTime }}>
      {children}
    </TimeContext.Provider>
  );
};

/**
 * Hook to access the shared time from TimeProvider
 * Falls back to creating its own timer if not wrapped in TimeProvider
 */
export const useSharedTime = (): Date => {
  const context = useContext(TimeContext);
  
  // Fallback: create own timer if not in provider
  const [fallbackTime, setFallbackTime] = useState(() => new Date());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!context) {
      // Only set up fallback timer if not in provider
      setFallbackTime(new Date());
      
      intervalRef.current = setInterval(() => {
        setFallbackTime(new Date());
      }, 300000); // 5 minutes

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [context]);

  return context?.currentTime ?? fallbackTime;
};

