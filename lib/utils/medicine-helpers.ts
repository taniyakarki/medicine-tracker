/**
 * Medicine-related utility functions
 */

/**
 * Formats medicine type for display
 * @param type - Medicine type string
 * @returns Formatted type string
 */
export const formatMedicineType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Gets relative time with natural language
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "in 5m", "Tomorrow", "Overdue")
 */
export const getRelativeTime = (dateString: string): string => {
  try {
    const now = new Date();
    const targetDate = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(targetDate.getTime())) {
      return '';
    }
    
    const diffMs = targetDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    // Calculate if it's today, tomorrow, or another day
    const nowStart = new Date(now);
    nowStart.setHours(0, 0, 0, 0);
    
    const targetStart = new Date(targetDate);
    targetStart.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((targetStart.getTime() - nowStart.getTime()) / 86400000);

    // Overdue
    if (diffMins < 0) return 'Overdue';
    
    // Very soon (less than 1 hour)
    if (diffMins === 0) return 'Now';
    if (diffMins < 60) return `in ${diffMins}m`;
    
    // Today but more than 1 hour away
    if (daysDiff === 0) {
      if (diffHours < 2) return `in ${diffHours}h`;
      return `Today`;
    }
    
    // Tomorrow
    if (daysDiff === 1) return 'Tomorrow';
    
    // Within the next week - show day name
    if (daysDiff > 1 && daysDiff <= 7) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[targetDate.getDay()];
    }
    
    // More than a week away
    if (daysDiff > 7) return `in ${daysDiff}d`;
    
    return '';
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
};

/**
 * Validates medicine data
 * @param name - Medicine name
 * @param dosage - Medicine dosage
 * @param unit - Medicine unit
 * @returns Object with isValid flag and error message
 */
export const validateMedicineData = (
  name: string,
  dosage: string,
  unit: string
): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Medicine name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Medicine name must be at least 2 characters' };
  }

  if (!dosage || dosage.trim().length === 0) {
    return { isValid: false, error: 'Dosage is required' };
  }

  if (!unit || unit.trim().length === 0) {
    return { isValid: false, error: 'Unit is required' };
  }

  return { isValid: true };
};

