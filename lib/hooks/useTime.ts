import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import * as React from 'react';

// Import TimeContext from TimeProvider
let TimeContext: React.Context<{ currentTime: Date } | undefined> | undefined;
try {
  const TimeProviderModule = require('./TimeProvider');
  // Access the context through a getter function to avoid circular dependency
  if (TimeProviderModule && typeof TimeProviderModule.getTimeContext === 'function') {
    TimeContext = TimeProviderModule.getTimeContext();
  }
} catch (e) {
  // TimeProvider not available, will use fallback
}

/**
 * Global time hook that provides consistent time handling across the app
 * If wrapped in TimeProvider, uses shared time. Otherwise creates own timer.
 * Updates every 5 minutes by default to keep relative times fresh
 */
export const useTime = (updateInterval: number = 300000) => {
  // Try to use shared time from TimeProvider if available
  const sharedTimeContext = TimeContext ? useContext(TimeContext) : undefined;
  
  // Fallback: create own timer if not in TimeProvider
  const [fallbackTime, setFallbackTime] = useState<Date>(() => new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!sharedTimeContext) {
      // Only set up fallback timer if not using shared time
      setFallbackTime(new Date());

      intervalRef.current = setInterval(() => {
        setFallbackTime(new Date());
      }, updateInterval) as any;

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [updateInterval, sharedTimeContext]);

  // Use shared time if available, otherwise use fallback
  return sharedTimeContext?.currentTime ?? fallbackTime;
};

/**
 * Get the current time (singleton pattern to ensure consistency)
 */
let cachedTime = new Date();
let lastUpdate = Date.now();
const CACHE_DURATION = 1000; // 1 second cache

export const getCurrentTime = (): Date => {
  const now = Date.now();
  if (now - lastUpdate > CACHE_DURATION) {
    cachedTime = new Date();
    lastUpdate = now;
  }
  return cachedTime;
};

/**
 * Format time to 12-hour format with AM/PM
 */
export const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch {
    return timeString;
  }
};

/**
 * Format date to ISO string for the current date with given time
 */
export const formatTimeToISO = (timeString: string, date: Date = getCurrentTime()): string => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate.toISOString();
  } catch {
    return date.toISOString();
  }
};

/**
 * Get relative time string (e.g., "in 2h", "5m ago", "Overdue")
 */
export const getRelativeTime = (dateString: string, referenceTime?: Date): string => {
  try {
    const now = referenceTime || getCurrentTime();
    const targetDate = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(targetDate.getTime())) {
      return '';
    }
    
    const diffMs = targetDate.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    // Past times
    if (diffMins < 0) {
      const absMins = Math.abs(diffMins);
      const absHours = Math.abs(diffHours);
      const absDays = Math.abs(diffDays);
      
      if (absMins < 1) return 'Just now';
      if (absMins < 60) return `${absMins}m ago`;
      if (absHours < 24) return `${absHours}h ago`;
      if (absDays === 1) return 'Yesterday';
      if (absDays < 7) return `${absDays}d ago`;
      return 'Overdue';
    }
    
    // Future times
    if (diffMins === 0) return 'Now';
    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `in ${diffDays}d`;
    
    return '';
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
};

/**
 * Get detailed relative time with date string
 */
export const getDetailedRelativeTime = (
  dateString: string,
  referenceTime?: Date
): { relative: string; absolute: string; isOverdue: boolean } | null => {
  try {
    const now = referenceTime || getCurrentTime();
    const targetDate = new Date(dateString);
    
    if (isNaN(targetDate.getTime())) {
      return null;
    }
    
    const diffMs = targetDate.getTime() - now.getTime();
    const isOverdue = diffMs < 0;
    
    const relative = getRelativeTime(dateString, now);
    const absolute = formatDateTime(targetDate);
    
    return { relative, absolute, isOverdue };
  } catch {
    return null;
  }
};

/**
 * Format date and time together
 */
export const formatDateTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const now = getCurrentTime();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = dateObj.toDateString() === 
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    const isYesterday = dateObj.toDateString() === 
      new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    let dateStr = '';
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else if (isYesterday) {
      dateStr = 'Yesterday';
    } else {
      dateStr = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const timeStr = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    return `${dateStr} at ${timeStr}`;
  } catch {
    return '';
  }
};

/**
 * Format date only (no time)
 */
export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Format date for display (Today, Tomorrow, or date)
 */
export const formatDateDisplay = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const now = getCurrentTime();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = dateObj.toDateString() === 
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    const isYesterday = dateObj.toDateString() === 
      new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    if (isYesterday) return 'Yesterday';
    
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Check if a date/time is in the past
 */
export const isPast = (dateString: string, referenceTime?: Date): boolean => {
  try {
    const now = referenceTime || getCurrentTime();
    const targetDate = new Date(dateString);
    
    if (isNaN(targetDate.getTime())) {
      return false;
    }
    
    return targetDate < now;
  } catch {
    return false;
  }
};

/**
 * Check if a date/time is today
 */
export const isToday = (dateString: string, referenceTime?: Date): boolean => {
  try {
    const now = referenceTime || getCurrentTime();
    const targetDate = new Date(dateString);
    
    if (isNaN(targetDate.getTime())) {
      return false;
    }
    
    return targetDate.toDateString() === now.toDateString();
  } catch {
    return false;
  }
};

/**
 * Get time until a specific date/time
 */
export const getTimeUntil = (
  dateString: string,
  referenceTime?: Date
): { hours: number; minutes: number; seconds: number; total: number } | null => {
  try {
    const now = referenceTime || getCurrentTime();
    const targetDate = new Date(dateString);
    
    if (isNaN(targetDate.getTime())) {
      return null;
    }
    
    const diffMs = targetDate.getTime() - now.getTime();
    
    if (diffMs < 0) {
      return { hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, total: diffMs };
  } catch {
    return null;
  }
};

/**
 * Format time until string (e.g., "2h 30m")
 */
export const formatTimeUntil = (dateString: string, referenceTime?: Date): string => {
  const timeUntil = getTimeUntil(dateString, referenceTime);
  
  if (!timeUntil) return '';
  
  const { hours, minutes } = timeUntil;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'Less than a minute';
  }
};

/**
 * Hook to get live relative time that updates automatically
 * Note: For better performance, wrap your app in TimeProvider to share a single timer
 */
export const useRelativeTime = (dateString: string | undefined, updateInterval: number = 300000) => {
  const currentTime = useTime(updateInterval);
  
  // Use useMemo to avoid recalculation on every render
  const relativeTimeValue = React.useMemo(() => {
    if (!dateString) return '';
    return getRelativeTime(dateString, currentTime);
  }, [dateString, currentTime]);
  
  return relativeTimeValue;
};

/**
 * Hook to get live detailed relative time that updates automatically
 * Note: For better performance, wrap your app in TimeProvider to share a single timer
 */
export const useDetailedRelativeTime = (
  dateString: string | undefined,
  updateInterval: number = 300000
) => {
  const currentTime = useTime(updateInterval);
  
  // Use useMemo to avoid recalculation on every render
  const detailedTimeValue = React.useMemo(() => {
    if (!dateString) return null;
    return getDetailedRelativeTime(dateString, currentTime);
  }, [dateString, currentTime]);
  
  return detailedTimeValue;
};

