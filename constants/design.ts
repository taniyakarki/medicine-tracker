export const Colors = {
  light: {
    primary: '#4F46E5', // Indigo
    primaryDark: '#4338CA',
    primaryLight: '#6366F1',
    secondary: '#06B6D4', // Cyan
    secondaryDark: '#0891B2',
    secondaryLight: '#22D3EE',
    
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    danger: '#EF4444', // Red
    info: '#3B82F6', // Blue
    
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    card: '#FFFFFF',
    cardSecondary: '#F9FAFB',
    
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    error: '#EF4444',
    
    // Medicine type colors
    pill: '#8B5CF6', // Purple
    tablet: '#7C3AED', // Violet
    capsule: '#A78BFA', // Light Purple
    liquid: '#06B6D4', // Cyan
    syrup: '#0891B2', // Dark Cyan
    injection: '#EF4444', // Red
    inhaler: '#10B981', // Green
    drops: '#3B82F6', // Blue
    eye_drops: '#60A5FA', // Light Blue
    ear_drops: '#2563EB', // Dark Blue
    nasal_spray: '#14B8A6', // Teal
    cream: '#F59E0B', // Amber
    ointment: '#D97706', // Dark Amber
    gel: '#FBBF24', // Light Amber
    patch: '#EC4899', // Pink
    suppository: '#8B5CF6', // Purple
    powder: '#E5E7EB', // Light Gray
    lozenge: '#F472B6', // Light Pink
    spray: '#22D3EE', // Light Cyan
    other: '#6B7280', // Gray
    
    // Status colors
    scheduled: '#6B7280',
    taken: '#10B981',
    missed: '#EF4444',
    skipped: '#F59E0B',
    overdue: '#DC2626',
    upcoming: '#F59E0B',
  },
  dark: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    secondary: '#22D3EE',
    secondaryDark: '#06B6D4',
    secondaryLight: '#67E8F9',
    
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#60A5FA',
    
    background: '#111827',
    backgroundSecondary: '#1F2937',
    surface: '#1F2937',
    surfaceSecondary: '#374151',
    card: '#1F2937',
    cardSecondary: '#374151',
    
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    
    border: '#374151',
    borderLight: '#4B5563',
    error: '#F87171',
    
    // Medicine type colors
    pill: '#A78BFA',
    tablet: '#8B5CF6',
    capsule: '#C4B5FD',
    liquid: '#22D3EE',
    syrup: '#06B6D4',
    injection: '#F87171',
    inhaler: '#34D399',
    drops: '#60A5FA',
    eye_drops: '#93C5FD',
    ear_drops: '#3B82F6',
    nasal_spray: '#2DD4BF',
    cream: '#FBBF24',
    ointment: '#F59E0B',
    gel: '#FCD34D',
    patch: '#F472B6',
    suppository: '#A78BFA',
    powder: '#F3F4F6',
    lozenge: '#F9A8D4',
    spray: '#67E8F9',
    other: '#9CA3AF',
    
    // Status colors
    scheduled: '#9CA3AF',
    taken: '#34D399',
    missed: '#F87171',
    skipped: '#FBBF24',
    overdue: '#EF4444',
    upcoming: '#FBBF24',
  },
};

export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const Layout = {
  // Container widths
  containerPadding: Spacing.md,
  maxWidth: 600,
  
  // Common dimensions
  headerHeight: 60,
  tabBarHeight: 60,
  inputHeight: 48,
  buttonHeight: 48,
  iconSize: 24,
  avatarSize: 40,
  
  // Minimum tap target size
  minTapTarget: 44,
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  },
};

// Helper function to get medicine type color
export const getMedicineTypeColor = (type: string, isDark: boolean = false) => {
  const colors = isDark ? Colors.dark : Colors.light;
  switch (type) {
    case 'pill':
      return colors.pill;
    case 'tablet':
      return colors.tablet;
    case 'capsule':
      return colors.capsule;
    case 'liquid':
      return colors.liquid;
    case 'syrup':
      return colors.syrup;
    case 'injection':
      return colors.injection;
    case 'inhaler':
      return colors.inhaler;
    case 'drops':
      return colors.drops;
    case 'eye_drops':
      return colors.eye_drops;
    case 'ear_drops':
      return colors.ear_drops;
    case 'nasal_spray':
      return colors.nasal_spray;
    case 'cream':
      return colors.cream;
    case 'ointment':
      return colors.ointment;
    case 'gel':
      return colors.gel;
    case 'patch':
      return colors.patch;
    case 'suppository':
      return colors.suppository;
    case 'powder':
      return colors.powder;
    case 'lozenge':
      return colors.lozenge;
    case 'spray':
      return colors.spray;
    default:
      return colors.other;
  }
};

// Helper function to get status color
export const getStatusColor = (status: string, isDark: boolean = false) => {
  const colors = isDark ? Colors.dark : Colors.light;
  switch (status) {
    case 'taken':
      return colors.taken;
    case 'missed':
      return colors.missed;
    case 'skipped':
      return colors.skipped;
    case 'scheduled':
      return colors.scheduled;
    case 'overdue':
      return colors.overdue;
    case 'upcoming':
      return colors.upcoming;
    default:
      return colors.scheduled;
  }
};

