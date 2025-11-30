# Medicine Track - LLM Context Documentation

> **Purpose**: This file provides comprehensive context for AI assistants (LLMs) working on the Medicine Track codebase. It documents architecture, patterns, conventions, and best practices to ensure consistent, high-quality code generation.

---

## Project Overview

**Medicine Track** is a comprehensive medicine tracking application built with React Native and Expo SDK 54. It features local-first architecture with smart notifications, dose tracking, and adherence monitoring.

- **Platform**: iOS & Android (React Native 0.81.5)
- **Framework**: Expo SDK 54 with Expo Router (file-based routing)
- **Database**: SQLite (expo-sqlite) - local-first approach
- **Language**: TypeScript
- **State Management**: React Context API + Custom Hooks
- **UI**: Custom component library with dark mode support

---

## Core Architecture Principles

### 1. Local-First Architecture
- All data stored locally in SQLite database
- No network dependency for core functionality
- Designed for future cloud sync (timestamps, sync flags, UUIDs)
- Instant performance with offline support

### 2. Component-Based Architecture
- **Reusable components** in `/components` directory
- **No helper functions inside components** - always extract to `/lib/utils`
- **Consistent UI** - all UI components imported from `/components/ui`
- **Separation of concerns** - business logic in `/lib`, UI in `/components`

### 3. Type Safety
- Strict TypeScript usage throughout
- Type definitions in `/types` directory
- No `any` types unless absolutely necessary
- Proper type exports and imports

---

## Project Structure

```
/app                          # Screens (Expo Router - file-based routing)
  /(tabs)                     # Tab-based navigation
    /medicines                # Medicine management screens
    /profile                  # User profile & settings
    index.tsx                 # Home dashboard
    history.tsx               # Dose history & analytics
    groups.tsx                # Medicine groups
  /onboarding                 # First-time user flow
  notification-screen.tsx     # Full-screen notification UI
  _layout.tsx                 # Root layout

/components                   # Reusable components
  /medicine                   # Medicine-specific components
    MedicineCard.tsx          # Medicine display card
    MedicineTypeIcon.tsx      # Type-specific icons
    SchedulePicker.tsx        # Schedule configuration UI
    DoseHistoryList.tsx       # Dose history display
    ColorPicker.tsx           # Color selection
    ImagePicker.tsx           # Image upload
  /ui                         # Generic UI components
    Button.tsx                # Reusable button with variants
    Card.tsx                  # Card container
    Input.tsx                 # Text input with validation
    Select.tsx                # Dropdown selector
    Modal.tsx                 # Modal/bottom sheet
    ProgressRing.tsx          # Circular progress indicator
    Timeline.tsx              # Timeline component
    Calendar.tsx              # Calendar view
    Charts.tsx                # Chart components
    DatePicker.tsx            # Date selection
    TimePicker.tsx            # Time selection
    EmptyState.tsx            # Empty state displays
    LoadingSpinner.tsx        # Loading indicators
    SearchBar.tsx             # Search input
    FilterChips.tsx           # Filter chips
    ThemeSelector.tsx         # Theme switcher
    BottomDrawerSelect.tsx    # Bottom drawer selector

/lib                          # Business logic & utilities
  /database                   # Database layer
    schema.ts                 # SQL schema definitions
    operations.ts             # Generic CRUD operations
    force-migration.ts        # Database migrations
    /models                   # Data models
      medicine.ts             # Medicine CRUD
      schedule.ts             # Schedule management
      dose.ts                 # Dose tracking
      user.ts                 # User profile
      emergency-contact.ts    # Emergency contacts
      notification-settings.ts # Notification preferences
      groups.ts               # Medicine groups
  /notifications              # Notification system
    setup.ts                  # Initialize notifications
    scheduler.ts              # Schedule notifications
    handlers.ts               # Handle notification actions
    background-tasks.ts       # Background processing
  /hooks                      # Custom React hooks
    useMedicines.ts           # Medicine data hook
    useDoses.ts               # Dose data hook
    useTime.ts                # Time utilities hook
    useThemeColors.ts         # Theme color hooks (NEW)
    index.ts                  # Centralized hook exports (NEW)
    TimeProvider.tsx          # Time context provider
  /utils                      # Utility functions
    date-helpers.ts           # Date/time utilities
    validation.ts             # Input validation
    backup-restore-helpers.ts # Data backup/restore
    export-helpers.ts         # Data export
    navigation-helpers.ts     # Navigation utilities
    profile-photo-helpers.ts  # Photo handling
    medicine-helpers.ts       # Medicine-specific utilities
    style-helpers.ts          # Style and theming utilities
    performance-helpers.ts    # Performance optimization utilities
    error-helpers.ts          # Error handling utilities
  /context                    # React contexts (NEW GLOBAL CONTEXT SYSTEM)
    AppContext.tsx            # Global app context (NEW)
    ThemeContext.tsx          # Theme management (ENHANCED)
    UserContext.tsx           # User data context (NEW)
    AppDataContext.tsx        # App data context (NEW)

/constants                    # Design system & constants
  design.ts                   # Colors, typography, spacing, shadows
  medicine-types.ts           # Medicine type definitions

/types                        # TypeScript type definitions
  database.ts                 # Database types
  medicine.ts                 # Medicine types
  notification.ts             # Notification types

/docs                         # Documentation
  (Various markdown files documenting features and implementation)
```

---

## Key Dependencies

### Core Framework
- `expo`: ~54.0.25 - Expo SDK
- `react`: 19.1.0 - React library
- `react-native`: 0.81.5 - React Native framework
- `expo-router`: ~6.0.15 - File-based routing

### Database & Storage
- `expo-sqlite`: ~16.0.9 - SQLite database
- `@react-native-async-storage/async-storage`: 2.2.0 - AsyncStorage

### Notifications & Background
- `expo-notifications`: ~0.32.13 - Push notifications
- `expo-background-fetch`: ~14.0.8 - Background tasks
- `expo-task-manager`: ~14.0.8 - Task management

### UI & Interactions
- `react-native-reanimated`: ~4.1.1 - Animations
- `react-native-gesture-handler`: ~2.28.0 - Gesture handling
- `expo-haptics`: ~15.0.7 - Haptic feedback
- `expo-linear-gradient`: ~15.0.7 - Gradient backgrounds
- `react-native-svg`: 15.12.1 - SVG support

### Media & Files
- `expo-image`: ~3.0.10 - Optimized images
- `expo-image-picker`: ~17.0.8 - Image selection
- `expo-image-manipulator`: ~14.0.7 - Image editing
- `expo-file-system`: ^19.0.19 - File system access
- `expo-document-picker`: ~14.0.7 - Document selection
- `expo-sharing`: ~14.0.7 - Share functionality

### Navigation
- `@react-navigation/native`: ^7.1.8 - Navigation library
- `@react-navigation/bottom-tabs`: ^7.4.0 - Tab navigation
- `@react-navigation/elements`: ^2.6.3 - Navigation elements

### Other
- `@react-native-community/datetimepicker`: 8.4.4 - Date/time picker
- `expo-constants`: ~18.0.10 - App constants
- `expo-device`: ~8.0.9 - Device information

---

## Design System

### Colors
Defined in `/constants/design.ts`:
- **Primary**: Indigo (#4F46E5 light, #6366F1 dark)
- **Secondary**: Cyan (#06B6D4 light, #22D3EE dark)
- **Success**: Green (#10B981 light, #34D399 dark)
- **Warning**: Amber (#F59E0B light, #FBBF24 dark)
- **Danger**: Red (#EF4444 light, #F87171 dark)
- **Info**: Blue (#3B82F6 light, #60A5FA dark)

### Medicine Type Colors
Each medicine type has a unique color (pill, tablet, capsule, liquid, syrup, injection, inhaler, drops, eye_drops, ear_drops, nasal_spray, cream, ointment, gel, patch, suppository, powder, lozenge, spray, other)

### Status Colors
- **Scheduled**: Gray
- **Taken**: Green
- **Missed**: Red
- **Skipped**: Amber
- **Overdue**: Dark Red
- **Upcoming**: Amber

### Typography
- **Font Sizes**: xs(12), sm(14), base(16), lg(18), xl(20), 2xl(24), 3xl(30), 4xl(36), 5xl(48)
- **Font Weights**: normal(400), medium(500), semibold(600), bold(700)
- **Line Heights**: tight(1.2), normal(1.5), relaxed(1.75)

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

### Border Radius
- **sm**: 4px
- **md**: 8px
- **lg**: 12px
- **xl**: 16px
- **2xl**: 24px
- **full**: 9999px

### Shadows
Four levels: sm, md, lg, xl with appropriate shadow properties for iOS and Android

### Layout Constants
- **Container Padding**: 16px
- **Max Width**: 600px
- **Header Height**: 60px
- **Tab Bar Height**: 60px
- **Input Height**: 48px
- **Button Height**: 48px
- **Icon Size**: 24px
- **Avatar Size**: 40px
- **Min Tap Target**: 44px

### Gradients
Defined for both light and dark modes:
- **Progress**: Multicolor gradient (Purple → Blue → Cyan → Teal)
- **Streak**: Amber gradient
- **Adherence**: Green gradient
- **Active**: Indigo gradient

---

## Coding Patterns & Best Practices

### 1. Component Structure

#### Functional Components with TypeScript (NEW PATTERN - USE THIS)
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Spacing } from '../../constants/design';
import { useThemeColors } from '../../lib/hooks/useThemeColors';

interface ComponentProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onPress, 
  disabled = false 
}) => {
  // ✅ NEW: Use useThemeColors hook instead of manual color scheme checking
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});
```

#### Key Points:
- ✅ **NEW**: Use `useThemeColors()` hook for theme colors (replaces manual useColorScheme)
- ✅ **NEW**: Import from centralized hooks: `import { useThemeColors } from '../../lib/hooks/useThemeColors'`
- Always use functional components with hooks
- Define TypeScript interfaces for props
- Import design tokens from `/constants/design.ts`
- StyleSheet for static styles, inline for dynamic
- Export named components (not default)

#### ❌ OLD PATTERN (Don't use anymore):
```typescript
// ❌ DON'T DO THIS ANYMORE
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
const colors = isDark ? Colors.dark : Colors.light;

// ✅ DO THIS INSTEAD
const colors = useThemeColors();
```

### 2. Global Context System (NEW)

**Location**: `/lib/context/`

The app uses a centralized context system that provides access to:
- **Theme**: Colors, dark mode status, theme preferences
- **User**: User profile data and operations
- **App Data**: Medicines, doses, and statistics

#### AppContext Structure

```typescript
// Global context provides three main areas:
context = {
  theme: {
    themeMode: 'light' | 'dark' | 'auto',
    activeTheme: 'light' | 'dark',
    isDark: boolean,
    colors: Colors.light | Colors.dark,
    setThemeMode: (mode) => Promise<void>,
    isLoading: boolean,
  },
  user: {
    user: User | null,
    isLoading: boolean,
    error: string | null,
    updateUser: (userData) => Promise<void>,
    refresh: () => Promise<void>,
  },
  appData: {
    medicines: { data, loading, error, refresh },
    todayDoses: { data, loading, error, refresh },
    stats: { data, loading, error, refresh },
    refreshAll: () => Promise<void>,
  },
}
```

#### Usage: Theme Hooks (Most Common)

**✅ RECOMMENDED: Use specialized theme hooks**

```typescript
import { useThemeColors, useIsDarkMode } from '../../lib/hooks/useThemeColors';

// Quick access to colors (most common use case)
const colors = useThemeColors();
// Returns: Colors.light or Colors.dark based on current theme

// Quick access to dark mode status
const isDark = useIsDarkMode();
// Returns: true or false

// Example in component:
export const MyComponent = () => {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
};
```

#### Available Theme Hooks

```typescript
// 1. useThemeColors - Get current theme colors
import { useThemeColors } from '../../lib/hooks/useThemeColors';
const colors = useThemeColors();

// 2. useIsDarkMode - Get dark mode status
import { useIsDarkMode } from '../../lib/hooks/useThemeColors';
const isDark = useIsDarkMode();

// 3. useThemedStyle - Create memoized themed styles
import { useThemedStyle } from '../../lib/hooks/useThemeColors';
const styles = useThemedStyle((colors, isDark) => ({
  container: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
}));

// 4. useThemedValue - Get different values based on theme
import { useThemedValue } from '../../lib/hooks/useThemeColors';
const iconName = useThemedValue('sun', 'moon');
const opacity = useThemedValue(0.8, 0.6);

// 5. useTheme - Full theme context (less common, use when you need setThemeMode)
import { useTheme } from '../../lib/hooks';
const { colors, isDark, themeMode, setThemeMode } = useTheme();
```

#### Usage: User Context

```typescript
import { useUser } from '../../lib/hooks';

export const ProfileScreen = () => {
  const { user, isLoading, error, updateUser, refresh } = useUser();

  const handleUpdate = async () => {
    await updateUser({ name: 'New Name' });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <View>{/* Use user data */}</View>;
};
```

#### Usage: App Data Context

```typescript
import { useAppData } from '../../lib/hooks';

export const DashboardScreen = () => {
  const { medicines, todayDoses, stats, refreshAll } = useAppData();

  // Access medicines
  const { data: medicineList, loading, error, refresh } = medicines;

  // Access today's doses
  const { data: doses } = todayDoses;

  // Access statistics
  const { data: statistics } = stats;

  // Refresh all data at once
  const handleRefreshAll = async () => {
    await refreshAll();
  };

  return <View>{/* Use app data */}</View>;
};
```

#### Usage: Complete App Context

```typescript
import { useApp } from '../../lib/hooks';

export const ComplexScreen = () => {
  const { theme, user, appData } = useApp();

  // Access everything
  const colors = theme.colors;
  const currentUser = user.user;
  const medicines = appData.medicines.data;

  return <View>{/* Use all context data */}</View>;
};
```

#### Context Providers Setup

The app is wrapped with providers in `/app/_layout.tsx`:

```typescript
import { AppProvider } from '../lib/context/AppContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        {/* App content */}
      </AppProvider>
    </SafeAreaProvider>
  );
}
```

#### Key Benefits

1. **No Manual Theme Checking**: Use `useThemeColors()` instead of `useColorScheme()`
2. **Centralized State**: All app data accessible from one place
3. **Automatic Caching**: Data hooks include built-in caching
4. **Type Safety**: Full TypeScript support with proper types
5. **Performance**: Memoized values prevent unnecessary re-renders
6. **Reusability**: Same hooks work everywhere in the app

#### Migration from Old Pattern

```typescript
// ❌ OLD PATTERN
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/design';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
const colors = isDark ? Colors.dark : Colors.light;

// ✅ NEW PATTERN
import { useThemeColors } from '../../lib/hooks/useThemeColors';

const colors = useThemeColors();
```

---

### 3. Custom Hooks

#### Pattern for Data Hooks
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_DURATION = 30000; // 30 seconds

export const useData = (params: Params) => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: DataType[], timestamp: number } | null>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setData(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await fetchData(params);
      cacheRef.current = { data: result, timestamp: now };
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: () => loadData(true),
  };
};
```

#### Key Points:
- Implement caching for performance
- Return loading, error, and refresh states
- Use `useCallback` for memoization
- Proper error handling with user-friendly messages
- Force refresh capability

### 3. Utility Functions

#### Always Extract Helper Functions
```typescript
// ❌ BAD - Helper function inside component
export const Component = () => {
  const formatDate = (date: string) => {
    // formatting logic
  };
  
  return <Text>{formatDate(date)}</Text>;
};

// ✅ GOOD - Helper function in utils
// In /lib/utils/date-helpers.ts
export const formatDate = (date: string): string => {
  // formatting logic
};

// In component
import { formatDate } from '../../lib/utils/date-helpers';

export const Component = () => {
  return <Text>{formatDate(date)}</Text>;
};
```

#### Utility Categories

**Date Helpers** (`/lib/utils/date-helpers.ts`):
- `formatTime()`, `formatDate()`, `formatDateTime()`
- `getStartOfDay()`, `getEndOfDay()`, `getStartOfWeek()`, `getEndOfWeek()`
- `getTimeUntil()`, `getTimeAgo()`, `isOverdue()`

**Medicine Helpers** (`/lib/utils/medicine-helpers.ts`):
- `formatMedicineType()` - Formats medicine type for display
- `getRelativeTime()` - Gets natural language relative time
- `validateMedicineData()` - Validates medicine input

**Style Helpers** (`/lib/utils/style-helpers.ts`):
- `getStatusColor()` - Gets color based on status
- `getStatusIconName()` - Gets icon name for status
- `createShadow()` - Creates platform-specific shadow
- `combineStyles()` - Safely combines style objects

**Performance Helpers** (`/lib/utils/performance-helpers.ts`):
- `debounce()` - Debounces function calls
- `throttle()` - Throttles function calls
- `memoize()` - Memoizes expensive computations
- `isCacheValid()` - Checks cache validity
- `retryWithBackoff()` - Retries operations with exponential backoff

**Error Helpers** (`/lib/utils/error-helpers.ts`):
- `formatErrorMessage()` - Formats errors for users
- `logError()` - Logs errors with context
- `withErrorHandling()` - Wraps functions with error handling
- `safeJsonParse()` - Safely parses JSON
- `withTimeout()` - Adds timeout to async operations

#### Key Points:
- **NEVER** put helper functions inside components
- Extract all utilities to `/lib/utils`
- Make utilities pure functions when possible
- Properly type inputs and outputs
- Add JSDoc comments for complex functions
- Use appropriate utility category for organization

### 4. Database Operations

#### Model Pattern
```typescript
// In /lib/database/models/entity.ts
import { db } from '../operations';

export interface Entity {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const getAllEntities = async (): Promise<Entity[]> => {
  return db.getAllAsync<Entity>('SELECT * FROM entities ORDER BY created_at DESC');
};

export const getEntityById = async (id: string): Promise<Entity | null> => {
  const result = await db.getFirstAsync<Entity>(
    'SELECT * FROM entities WHERE id = ?',
    [id]
  );
  return result || null;
};

export const createEntity = async (data: Omit<Entity, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  await db.runAsync(
    'INSERT INTO entities (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
    [id, data.name, now, now]
  );
};

export const updateEntity = async (id: string, data: Partial<Entity>): Promise<void> => {
  const now = new Date().toISOString();
  const updates: string[] = [];
  const values: any[] = [];
  
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at') {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  updates.push('updated_at = ?');
  values.push(now, id);
  
  await db.runAsync(
    `UPDATE entities SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteEntity = async (id: string): Promise<void> => {
  await db.runAsync('DELETE FROM entities WHERE id = ?', [id]);
};
```

#### Key Points:
- One model file per database table
- Export TypeScript interface matching schema
- CRUD operations: getAll, getById, create, update, delete
- Use prepared statements (parameterized queries)
- Handle timestamps automatically
- Proper error propagation

### 5. Screen/Page Structure

#### Expo Router Screen Pattern
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors, Spacing, Typography } from '../../../constants/design';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useData } from '../../../lib/hooks/useData';

export default function Screen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const { data, loading, error, refresh } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Screen Title',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {data.length === 0 ? (
          <EmptyState
            title="No Data"
            message="Get started by adding your first item"
          />
        ) : (
          data.map((item) => (
            <View key={item.id}>
              {/* Render items */}
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
  },
});
```

#### Key Points:
- Default export for Expo Router screens
- Use `Stack.Screen` for header configuration
- Implement pull-to-refresh
- Show loading, error, and empty states
- Theme-aware styling
- Use custom hooks for data fetching

### 6. Error Handling

```typescript
// ✅ GOOD - Proper error handling
try {
  await operation();
} catch (err) {
  const message = err instanceof Error ? err.message : 'Operation failed';
  console.error('Operation error:', err);
  setError(message);
  // Optionally show user-friendly alert
}

// ❌ BAD - Generic catch
try {
  await operation();
} catch (err) {
  console.log(err);
}
```

### 7. Async Operations

```typescript
// ✅ GOOD - Proper async/await
const handleSubmit = async () => {
  try {
    setLoading(true);
    await saveData(data);
    await refresh();
    router.back();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Save failed');
  } finally {
    setLoading(false);
  }
};

// ❌ BAD - Unhandled promises
const handleSubmit = () => {
  saveData(data);
  router.back();
};
```

---

## React Native Patterns (React 19 & React Native 0.81)

### 1. Use Modern React Features
- **Hooks**: useState, useEffect, useCallback, useMemo, useRef
- **Context**: For global state (theme, user)
- **Suspense**: For lazy loading (when appropriate)
- **Error Boundaries**: For error handling

### 2. Performance Optimization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handlePress = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = React.memo(Component);
```

### 3. Proper useEffect Usage
```typescript
// ✅ GOOD - Proper dependencies
useEffect(() => {
  loadData();
}, [loadData]);

// ✅ GOOD - Cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);

// ❌ BAD - Missing dependencies
useEffect(() => {
  loadData(id);
}, []); // Missing 'id' dependency
```

### 4. Accessibility
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Submit form"
  accessibilityRole="button"
  accessibilityHint="Submits the form data"
>
  <Text>Submit</Text>
</TouchableOpacity>
```

---

## Database Schema

### Tables

#### users
- id (TEXT PRIMARY KEY)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- date_of_birth (TEXT)
- blood_type (TEXT)
- allergies (TEXT)
- medical_conditions (TEXT)
- address (TEXT)
- profile_image (TEXT)
- created_at (TEXT)
- updated_at (TEXT)

#### medicines
- id (TEXT PRIMARY KEY)
- user_id (TEXT, FK → users.id)
- name (TEXT)
- type (TEXT)
- dosage (TEXT)
- unit (TEXT)
- notes (TEXT)
- image (TEXT)
- color (TEXT)
- is_active (INTEGER, 0/1)
- created_at (TEXT)
- updated_at (TEXT)
- sync_flag (INTEGER, 0/1)

#### schedules
- id (TEXT PRIMARY KEY)
- medicine_id (TEXT, FK → medicines.id)
- time (TEXT, HH:mm format)
- days_of_week (TEXT, JSON array)
- interval_hours (INTEGER, nullable)
- start_date (TEXT)
- end_date (TEXT, nullable)
- is_active (INTEGER, 0/1)
- created_at (TEXT)
- updated_at (TEXT)

#### doses
- id (TEXT PRIMARY KEY)
- medicine_id (TEXT, FK → medicines.id)
- schedule_id (TEXT, FK → schedules.id)
- scheduled_time (TEXT, ISO 8601)
- taken_time (TEXT, ISO 8601, nullable)
- status (TEXT: 'scheduled', 'taken', 'missed', 'skipped')
- notes (TEXT, nullable)
- created_at (TEXT)

#### emergency_contacts
- id (TEXT PRIMARY KEY)
- user_id (TEXT, FK → users.id)
- name (TEXT)
- relationship (TEXT)
- phone (TEXT)
- email (TEXT, nullable)
- priority (INTEGER)
- created_at (TEXT)
- updated_at (TEXT)

#### notification_settings
- id (TEXT PRIMARY KEY)
- user_id (TEXT, FK → users.id)
- enabled (INTEGER, 0/1)
- sound (TEXT)
- vibration (INTEGER, 0/1)
- full_screen_enabled (INTEGER, 0/1)
- remind_before_minutes (INTEGER)
- remind_after_missed_minutes (INTEGER)
- dnd_enabled (INTEGER, 0/1)
- dnd_start_time (TEXT, HH:mm)
- dnd_end_time (TEXT, HH:mm)
- created_at (TEXT)
- updated_at (TEXT)

#### medicine_groups (prepared for future)
- id (TEXT PRIMARY KEY)
- user_id (TEXT, FK → users.id)
- name (TEXT)
- description (TEXT, nullable)
- created_at (TEXT)
- updated_at (TEXT)

#### medicine_group_members (prepared for future)
- id (TEXT PRIMARY KEY)
- group_id (TEXT, FK → medicine_groups.id)
- medicine_id (TEXT, FK → medicines.id)
- created_at (TEXT)

---

## Common Tasks & Solutions

### Adding a New Screen
1. Create file in `/app` with appropriate path
2. Use default export
3. Follow screen structure pattern
4. Add navigation in `_layout.tsx` if needed
5. Import UI components from `/components/ui`
6. Extract any logic to hooks or utils

### Adding a New Component
1. Create in `/components/ui` (generic) or `/components/medicine` (specific)
2. Use named export
3. Define TypeScript interface for props
4. Support dark mode with `useColorScheme()`
5. Use design tokens from `/constants/design.ts`
6. Add proper TypeScript types

### Adding a New Utility Function
1. Create or add to appropriate file in `/lib/utils`
2. Use pure functions when possible
3. Add TypeScript types for parameters and return
4. Add JSDoc comment if complex
5. Export as named export
6. Write unit tests if critical

### Adding a New Hook
1. Create in `/lib/hooks`
2. Prefix with `use`
3. Follow data hook pattern (loading, error, data, refresh)
4. Implement caching if appropriate
5. Use `useCallback` for functions
6. Proper TypeScript types

### Adding a Database Table
1. Add schema in `/lib/database/schema.ts`
2. Create model in `/lib/database/models/`
3. Define TypeScript interface in `/types/database.ts`
4. Implement CRUD operations
5. Add foreign key constraints
6. Create custom hook if needed

---

## Testing Checklist

When implementing features, manually test:
- [ ] Light and dark mode
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Pull-to-refresh
- [ ] Navigation flow
- [ ] Form validation
- [ ] Database operations
- [ ] Notifications (if applicable)
- [ ] Background behavior (if applicable)
- [ ] iOS and Android differences

---

## Common Mistakes to Avoid

### ❌ Don't Do This
1. Helper functions inside components
2. Direct database queries in components
3. Hardcoded colors/spacing (use design tokens)
4. Missing TypeScript types
5. Unhandled promises
6. Missing error handling
7. No loading states
8. Ignoring dark mode
9. Default exports for components (except screens)
10. Inline styles for static values

### ✅ Do This
1. Extract helpers to `/lib/utils`
2. Use database models and hooks
3. Import from `/constants/design.ts`
4. Proper TypeScript interfaces
5. async/await with try/catch
6. Comprehensive error handling
7. Loading, error, empty states
8. `useColorScheme()` for theming
9. Named exports for components
10. StyleSheet for static styles

---

## Performance Best Practices

1. **Memoization**: Use `useMemo` and `useCallback` appropriately
   - Use `React.memo` for components that render frequently with same props
   - Memoize expensive calculations with `useMemo`
   - Memoize callbacks passed as props with `useCallback`
   
2. **Caching**: Implement caching in hooks (30-second default)
   - Use `isCacheValid()` helper to check cache freshness
   - Invalidate cache on mutations (create, update, delete)
   - Use `useRef` to store cache data without triggering re-renders
   
3. **Lazy Loading**: Load data as needed, not all at once
   
4. **Virtualization**: Use FlatList for long lists
   
5. **Image Optimization**: Use `expo-image` for images with caching
   
6. **Database Indexes**: Add indexes for frequently queried columns
   
7. **Debouncing**: Use `debounce()` helper for search inputs and rapid events
   
8. **Throttling**: Use `throttle()` helper for scroll and resize events
   
9. **Animations**: Use `react-native-reanimated` for smooth animations
   
10. **Error Handling**: Use centralized error handling with `formatErrorMessage()` and `logError()`

---

## Accessibility Guidelines

1. Add `accessible={true}` to interactive elements
2. Provide `accessibilityLabel` for buttons/touchables
3. Use `accessibilityRole` appropriately
4. Add `accessibilityHint` for context
5. Ensure minimum tap target size (44x44)
6. Proper color contrast ratios
7. Support screen readers
8. Keyboard navigation (web)

---

## Future Considerations

### Prepared Infrastructure
- Sync flags in database for cloud sync
- Shared users table for family sharing
- Medicine groups for organization
- Timestamps for conflict resolution

### When Adding Backend
1. Add `/lib/api` directory for API client
2. Implement sync functions in `/lib/database/sync.ts`
3. Add authentication flow in `/app/(auth)`
4. Update models to handle sync conflicts
5. Add real-time listeners
6. Implement push notifications for shared users

---

## Quick Reference

### Import Paths
```typescript
// Design tokens
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '../../constants/design';

// UI Components
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

// Hooks
import { useMedicines } from '../../lib/hooks/useMedicines';
import { useDoses } from '../../lib/hooks/useDoses';

// Date Utils
import { formatDate, formatTime } from '../../lib/utils/date-helpers';

// Medicine Utils
import { formatMedicineType, getRelativeTime, validateMedicineData } from '../../lib/utils/medicine-helpers';

// Style Utils
import { getStatusColor, getStatusIconName, createShadow, combineStyles } from '../../lib/utils/style-helpers';

// Performance Utils
import { debounce, throttle, memoize, isCacheValid } from '../../lib/utils/performance-helpers';

// Error Utils
import { formatErrorMessage, logError, withErrorHandling } from '../../lib/utils/error-helpers';

// Validation
import { validateEmail } from '../../lib/utils/validation';

// Database
import { getMedicineById } from '../../lib/database/models/medicine';

// Types
import { Medicine } from '../../types/medicine';
import { Dose } from '../../types/database';
```

### Common Patterns
```typescript
// Theme-aware component
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
const colors = isDark ? Colors.dark : Colors.light;

// Data fetching
const { data, loading, error, refresh } = useData();

// Navigation
import { router } from 'expo-router';
router.push('/path');
router.back();

// Haptic feedback
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

---

## Version Information

- **App Version**: 1.0.0
- **Expo SDK**: 54.0.25
- **React**: 19.1.0
- **React Native**: 0.81.5
- **TypeScript**: 5.9.2
- **Node**: >=18.0.0 <23.0.0

---

## Additional Resources

- Main documentation: `/docs/README.md`
- Features guide: `/FEATURES.md`
- Implementation plan: `/Plan.md`
- Known warnings: `/docs/KNOWN_WARNINGS.md`

---

**Last Updated**: November 30, 2025

---

## Recent Improvements (November 30, 2025)

### Performance Optimizations
1. **Enhanced Caching**: All hooks now use `isCacheValid()` helper for consistent cache checking
2. **Memoization**: Button component optimized with `useMemo` for style calculations
3. **Component Optimization**: MedicineCard uses `React.memo` with custom comparison
4. **Cache Invalidation**: Proper cache invalidation on mutations (create, update, delete)

### Code Organization
1. **New Utility Files**:
   - `medicine-helpers.ts` - Medicine-specific utilities (formatMedicineType, getRelativeTime, etc.)
   - `style-helpers.ts` - Style and theming utilities (getStatusColor, createShadow, etc.)
   - `performance-helpers.ts` - Performance utilities (debounce, throttle, memoize, etc.)
   - `error-helpers.ts` - Error handling utilities (formatErrorMessage, logError, etc.)

2. **Extracted Helper Functions**: All inline helper functions moved to appropriate utility files
3. **Centralized Error Handling**: Consistent error formatting and logging across all hooks
4. **Type Safety**: All utilities properly typed with TypeScript

### Best Practices Applied
- No helper functions inside components
- Consistent error handling with `formatErrorMessage()` and `logError()`
- Performance utilities for debouncing, throttling, and memoization
- Reusable style helpers for consistent theming
- Proper cache management with validation helpers

**Last Updated**: November 30, 2025

---

## Notes for AI Assistants

When working on this codebase:
1. **Always** follow the patterns documented here
2. **Never** put helper functions inside components
3. **Always** use TypeScript with proper types
4. **Always** support dark mode
5. **Always** use design tokens from `/constants/design.ts`
6. **Always** extract utilities to `/lib/utils`
7. **Always** use custom hooks for data fetching
8. **Always** handle loading, error, and empty states
9. **Always** follow the component structure patterns
10. **Always** maintain consistency with existing code

If you need to add new patterns or conventions, update this file to maintain consistency across the codebase.

