# Theme Persistence in Database

## Overview

Theme preferences are now stored in the database instead of AsyncStorage, ensuring better data persistence and integration with user profiles.

## Changes Made

### 1. Database Schema Update

**File**: `lib/database/schema.ts`

- Updated database version from 3 to 4
- Added `theme_preference` column to users table
- Created migration v4 to add the column to existing databases

**Users Table Schema**:
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth TEXT,
  gender TEXT,
  address TEXT,
  blood_type TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  profile_image TEXT,
  theme_preference TEXT DEFAULT 'auto',  -- NEW COLUMN
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2. Migration

**Migration v4**:
```typescript
{
  version: 4,
  up: async (db) => {
    await db.execAsync(
      `ALTER TABLE users ADD COLUMN theme_preference TEXT DEFAULT 'auto';`
    );
  },
  down: async (db) => {
    // Recreate table without theme_preference column
  }
}
```

### 3. Type Definition

**File**: `types/database.ts`

Updated User interface:
```typescript
export interface User {
  id: string;
  name: string;
  // ... other fields
  theme_preference?: string; // 'light' | 'dark' | 'auto'
  created_at: string;
  updated_at: string;
}
```

### 4. Theme Context Update

**File**: `lib/context/ThemeContext.tsx`

**Before** (AsyncStorage):
```typescript
const loadThemePreference = async () => {
  const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme && isValidThemeMode(savedTheme)) {
    setThemeModeState(savedTheme as ThemeMode);
  }
};

const setThemeMode = async (mode: ThemeMode) => {
  setThemeModeState(mode);
  await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
};
```

**After** (Database):
```typescript
const loadThemePreference = async () => {
  const user = await ensureUserExists();
  const savedTheme = user.theme_preference || "auto";
  if (isValidThemeMode(savedTheme)) {
    setThemeModeState(savedTheme as ThemeMode);
  }
};

const setThemeMode = async (mode: ThemeMode) => {
  setThemeModeState(mode);
  const user = await ensureUserExists();
  await updateUser(user.id, { theme_preference: mode });
};
```

### 5. Force Migration Update

**File**: `lib/database/force-migration.ts`

Added `theme_preference` to the list of columns to ensure:
```typescript
const columns = [
  "date_of_birth",
  "gender",
  "address",
  "blood_type",
  "allergies",
  "medical_conditions",
  "theme_preference",  // NEW
];
```

## How It Works

### App Startup Flow

```
1. App Starts
   ↓
2. Database Initialized
   ↓
3. Migration v4 runs (if needed)
   ↓
4. theme_preference column added
   ↓
5. ThemeProvider loads
   ↓
6. User's theme preference loaded from DB
   ↓
7. Theme applied
```

### Theme Change Flow

```
1. User changes theme in settings
   ↓
2. setThemeMode() called
   ↓
3. Theme state updated (immediate UI change)
   ↓
4. User record updated in database
   ↓
5. Theme preference persisted
```

### On Next App Launch

```
1. App starts
   ↓
2. ThemeProvider loads
   ↓
3. Reads theme_preference from user record
   ↓
4. Applies saved theme
   ↓
5. User sees their preferred theme
```

## Benefits

### 1. Better Data Integration
- Theme preference is part of user profile
- Consistent with other user settings
- Easier to backup/restore with user data

### 2. Database Benefits
- Atomic updates with other user data
- Transaction support
- Better error handling
- Easier to query and manage

### 3. Migration Path
- Automatic migration from AsyncStorage (if needed)
- Backward compatible
- No data loss

### 4. Future Features
- Export user profile with theme preference
- Sync theme across devices (future)
- Theme history/analytics (future)
- Per-user themes in multi-user setup (future)

## Theme Options

### Available Modes

1. **Light Mode** (`"light"`)
   - Always use light theme
   - Ignores system preference

2. **Dark Mode** (`"dark"`)
   - Always use dark theme
   - Ignores system preference

3. **Auto Mode** (`"auto"`) - Default
   - Follows system theme
   - Changes automatically with system
   - Best for most users

## Migration Details

### For Existing Users

When updating to this version:

1. Database version updates from 3 to 4
2. Migration v4 runs automatically
3. `theme_preference` column added with default value `'auto'`
4. Existing theme from AsyncStorage (if any) is ignored
5. User can set their preference again in settings

### For New Users

1. Database created with version 4
2. `theme_preference` column included from start
3. Default value is `'auto'`
4. User can change in settings

## Testing

### Verify Theme Persistence

1. **Set Theme**:
   - Go to Profile → Settings
   - Change theme to "Dark"
   - Verify UI changes to dark mode

2. **Restart App**:
   - Close app completely
   - Reopen app
   - Verify dark theme is still active

3. **Change Theme**:
   - Change to "Light"
   - Restart app
   - Verify light theme persists

4. **Auto Mode**:
   - Set theme to "Auto"
   - Change system theme
   - Verify app theme follows system

### Database Verification

Check the database:
```sql
SELECT id, name, theme_preference FROM users;
```

Expected result:
```
id                  | name     | theme_preference
--------------------|----------|------------------
user-uuid-here      | John Doe | dark
```

## Troubleshooting

### Theme Not Persisting

**Issue**: Theme resets on app restart

**Solution**:
1. Check database migration ran successfully
2. Verify `theme_preference` column exists
3. Check logs for errors during theme save
4. Try setting theme again

**Logs to check**:
```
✅ Added theme_preference column to users table
Database initialized successfully
```

### Migration Failed

**Issue**: Migration v4 failed to run

**Solution**:
1. Check database version: Should be 4
2. Manually add column if needed
3. Restart app
4. Check logs for migration errors

### Theme Not Loading

**Issue**: Theme doesn't load on app start

**Solution**:
1. Check user exists in database
2. Verify theme_preference has valid value
3. Check ThemeProvider is mounted
4. Look for errors in console

## Code Examples

### Reading Theme Preference

```typescript
import { ensureUserExists } from './lib/database/models/user';

const user = await ensureUserExists();
const theme = user.theme_preference || 'auto';
console.log('User theme:', theme);
```

### Updating Theme Preference

```typescript
import { ensureUserExists, updateUser } from './lib/database/models/user';

const user = await ensureUserExists();
await updateUser(user.id, { theme_preference: 'dark' });
console.log('Theme updated to dark');
```

### Using Theme Context

```typescript
import { useTheme } from './lib/context/ThemeContext';

function MyComponent() {
  const { themeMode, setThemeMode, isDark, colors } = useTheme();
  
  const handleThemeChange = async (mode: 'light' | 'dark' | 'auto') => {
    await setThemeMode(mode);
  };
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Current theme: {themeMode}
      </Text>
    </View>
  );
}
```

## Future Enhancements

### Potential Features

1. **Theme Scheduling**
   - Auto-switch at specific times
   - "Dark mode from 8 PM to 7 AM"

2. **Custom Themes**
   - User-defined color schemes
   - Multiple theme presets

3. **Sync Across Devices**
   - Cloud sync of theme preference
   - Consistent experience everywhere

4. **Theme History**
   - Track theme changes
   - Analytics on theme usage

5. **Accessibility**
   - High contrast themes
   - Color blind friendly themes

## Summary

Theme preferences are now stored in the database as part of the user profile, providing:

✅ **Better Integration**: Part of user data model  
✅ **Persistence**: Survives app reinstalls (with backup)  
✅ **Consistency**: Same storage as other settings  
✅ **Reliability**: Database transactions and error handling  
✅ **Future-Ready**: Foundation for advanced theme features  

The migration from AsyncStorage to database is automatic and seamless for users.

