/**
 * Style-related utility functions for consistent styling
 */

import { ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/design';

/**
 * Gets status color based on dose status
 * @param status - Dose status
 * @param colors - Color scheme object
 * @returns Color string
 */
export const getStatusColor = (
  status: 'scheduled' | 'taken' | 'missed' | 'skipped' | 'overdue' | 'upcoming',
  colors: typeof Colors.light | typeof Colors.dark
): string => {
  switch (status) {
    case 'taken':
      return colors.success;
    case 'missed':
      return colors.danger;
    case 'skipped':
      return colors.warning;
    case 'overdue':
      return colors.danger;
    case 'upcoming':
      return colors.warning;
    case 'scheduled':
    default:
      return colors.textSecondary;
  }
};

/**
 * Gets status background color with opacity
 * @param status - Dose status
 * @param colors - Color scheme object
 * @returns Color string with opacity
 */
export const getStatusBackgroundColor = (
  status: 'scheduled' | 'taken' | 'missed' | 'skipped' | 'overdue' | 'upcoming',
  colors: typeof Colors.light | typeof Colors.dark
): string => {
  return `${getStatusColor(status, colors)}20`;
};

/**
 * Gets status icon name
 * @param status - Dose status
 * @returns Ionicons icon name
 */
export const getStatusIconName = (
  status: 'scheduled' | 'taken' | 'missed' | 'skipped' | 'overdue' | 'upcoming'
): string => {
  switch (status) {
    case 'taken':
      return 'checkmark-circle';
    case 'missed':
    case 'overdue':
      return 'close-circle';
    case 'skipped':
      return 'remove-circle';
    case 'upcoming':
      return 'time';
    case 'scheduled':
    default:
      return 'calendar';
  }
};

/**
 * Creates a shadow style object based on elevation
 * @param elevation - Elevation level (0-24)
 * @param color - Shadow color (default: black)
 * @returns Shadow style object
 */
export const createShadow = (
  elevation: number,
  color: string = '#000000'
): ViewStyle => {
  return {
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height: elevation / 2,
    },
    shadowOpacity: 0.1 + (elevation / 100),
    shadowRadius: elevation / 2,
    elevation: elevation,
  };
};

/**
 * Combines multiple style objects safely
 * @param styles - Array of style objects or falsy values
 * @returns Combined style object
 */
export const combineStyles = <T extends ViewStyle | TextStyle>(
  ...styles: (T | undefined | null | false)[]
): T => {
  return styles.filter((style): style is T => Boolean(style)).reduce((acc, style) => ({ ...acc, ...style }), {} as T);
};

/**
 * Gets opacity value based on disabled state
 * @param disabled - Whether element is disabled
 * @returns Opacity value
 */
export const getDisabledOpacity = (disabled: boolean): number => {
  return disabled ? 0.5 : 1;
};

/**
 * Creates a gradient color array based on theme
 * @param isDark - Whether dark mode is active
 * @param type - Gradient type
 * @returns Array of gradient colors
 */
export const getGradientColors = (
  isDark: boolean,
  type: 'progress' | 'streak' | 'adherence' | 'active'
): string[] => {
  const gradients = {
    progress: isDark
      ? ['#7C3AED', '#3B82F6', '#06B6D4', '#14B8A6']
      : ['#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4'],
    streak: isDark
      ? ['#F59E0B', '#FBBF24']
      : ['#F59E0B', '#FBBF24'],
    adherence: isDark
      ? ['#10B981', '#34D399']
      : ['#10B981', '#34D399'],
    active: isDark
      ? ['#6366F1', '#8B5CF6']
      : ['#4F46E5', '#7C3AED'],
  };

  return gradients[type];
};

