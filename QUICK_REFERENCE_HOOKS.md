# Quick Reference: Global Context & Hooks

## 🎨 Theme Hooks (Most Common)

### Get Theme Colors
```typescript
import { useThemeColors } from '../../lib/hooks/useThemeColors';

const colors = useThemeColors();
// Returns: Colors.light or Colors.dark

// Usage:
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Hello</Text>
</View>
```

### Check Dark Mode
```typescript
import { useIsDarkMode } from '../../lib/hooks/useThemeColors';

const isDark = useIsDarkMode();
// Returns: true or false

// Usage:
const iconName = isDark ? 'moon' : 'sun';
```

### Themed Styles (Memoized)
```typescript
import { useThemedStyle } from '../../lib/hooks/useThemeColors';

const styles = useThemedStyle((colors, isDark) => ({
  container: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  text: {
    color: isDark ? colors.textSecondary : colors.text,
  },
}));
```

### Themed Values
```typescript
import { useThemedValue } from '../../lib/hooks/useThemeColors';

const opacity = useThemedValue(0.8, 0.6); // light, dark
const iconName = useThemedValue('sun', 'moon');
```

---

## 👤 User Context

```typescript
import { useUser } from '../../lib/hooks';

const { user, isLoading, error, updateUser, refresh } = useUser();

// Update user
await updateUser({ name: 'New Name' });

// Refresh user data
await refresh();
```

---

## 📊 App Data Context

```typescript
import { useAppData } from '../../lib/hooks';

const { medicines, todayDoses, stats, refreshAll } = useAppData();

// Access medicines
const { 
  data: medicineList, 
  loading, 
  error, 
  refresh 
} = medicines;

// Access today's doses
const { data: doses } = todayDoses;

// Access statistics
const { data: statistics } = stats;

// Refresh all data
await refreshAll();
```

---

## 🎯 Full Theme Context (Less Common)

```typescript
import { useTheme } from '../../lib/hooks';

const { 
  themeMode,      // 'light' | 'dark' | 'auto'
  activeTheme,    // 'light' | 'dark'
  isDark,         // boolean
  colors,         // Colors.light | Colors.dark
  setThemeMode,   // (mode) => Promise<void>
  isLoading       // boolean
} = useTheme();

// Change theme
await setThemeMode('dark');
```

---

## 🌍 Complete App Context

```typescript
import { useApp } from '../../lib/hooks';

const { theme, user, appData } = useApp();

// Access everything
const colors = theme.colors;
const currentUser = user.user;
const medicines = appData.medicines.data;
```

---

## 📦 Centralized Imports

All hooks available from single import:

```typescript
import {
  // Theme hooks
  useThemeColors,
  useIsDarkMode,
  useThemedStyle,
  useThemedValue,
  useTheme,
  
  // Context hooks
  useUser,
  useAppData,
  useApp,
  
  // Data hooks
  useMedicines,
  useMedicine,
  useTodayDoses,
  useUpcomingDoses,
  useRecentActivity,
  useMedicineStats,
  useDoseActions,
  useCalendarData,
  
  // Time hooks
  useTime,
} from '../../lib/hooks';
```

---

## 🔄 Migration Pattern

### Before ❌
```typescript
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/design';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
const colors = isDark ? Colors.dark : Colors.light;
```

### After ✅
```typescript
import { useThemeColors } from '../../lib/hooks/useThemeColors';

const colors = useThemeColors();
```

---

## 📝 Common Patterns

### Component with Theme
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../lib/hooks/useThemeColors';
import { Spacing, Typography } from '../../constants/design';

export const MyComponent = () => {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Hello World
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  text: {
    fontSize: Typography.fontSize.base,
  },
});
```

### Screen with Data
```typescript
import React from 'react';
import { View, FlatList } from 'react-native';
import { useThemeColors } from '../../lib/hooks/useThemeColors';
import { useAppData } from '../../lib/hooks';
import { LoadingSpinner, EmptyState } from '../../components/ui';

export default function MedicinesScreen() {
  const colors = useThemeColors();
  const { medicines } = useAppData();
  const { data, loading, error, refresh } = medicines;
  
  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <EmptyState title="Error" description={error} />;
  if (data.length === 0) return <EmptyState title="No medicines" />;
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={data}
        renderItem={({ item }) => <MedicineCard medicine={item} />}
        onRefresh={refresh}
        refreshing={loading}
      />
    </View>
  );
}
```

### Form with User Update
```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import { useUser } from '../../lib/hooks';
import { Input, Button } from '../../components/ui';

export default function EditProfileScreen() {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user?.name || '');
  
  const handleSave = async () => {
    await updateUser({ name });
  };
  
  return (
    <View>
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}
```

---

## 🎨 Available Colors

```typescript
const colors = useThemeColors();

// Backgrounds
colors.background
colors.backgroundSecondary
colors.surface
colors.surfaceSecondary
colors.card
colors.cardSecondary

// Text
colors.text
colors.textSecondary
colors.textTertiary

// Brand
colors.primary
colors.primaryDark
colors.primaryLight
colors.secondary
colors.secondaryDark
colors.secondaryLight

// Status
colors.success
colors.warning
colors.danger
colors.info
colors.error

// Borders
colors.border
colors.borderLight

// Medicine Types
colors.pill
colors.tablet
colors.capsule
colors.liquid
colors.syrup
colors.injection
colors.inhaler
colors.drops
// ... and more

// Dose Status
colors.scheduled
colors.taken
colors.missed
colors.skipped
colors.overdue
colors.upcoming
```

---

## 💡 Tips

1. **Use `useThemeColors()` by default** - It's the most common use case
2. **Import from centralized location** - `import { useThemeColors } from '../../lib/hooks/useThemeColors'`
3. **Avoid manual color scheme checking** - Let the hooks handle it
4. **Use memoization** - `useThemedStyle` for complex style calculations
5. **Access app data through context** - Avoid prop drilling
6. **Refresh data when needed** - Use `refresh()` or `refreshAll()`

---

## 📚 Documentation

- **Full Guide**: `/llms.txt` (Section: "Global Context System")
- **Refactoring Summary**: `/REFACTORING_SUMMARY.md`
- **Cursor Rules**: `/.cursorrules`

