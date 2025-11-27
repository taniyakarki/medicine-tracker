# Navigation Structure - Medicine Tracker App

## Overview
The app uses Expo Router with a tab-based navigation structure. Each main tab can have its own nested stack navigation.

## Tab Structure

```
app/(tabs)/
├── _layout.tsx          # Main tab navigator
├── index.tsx            # Home/Dashboard tab
├── medicines/           # Medicines tab (with stack)
│   ├── _layout.tsx      # Medicines stack navigator
│   ├── index.tsx        # Medicine list
│   ├── [id].tsx         # Medicine detail
│   ├── add.tsx          # Add medicine
│   └── edit/
│       └── [id].tsx     # Edit medicine
├── history.tsx          # History tab
├── groups.tsx           # Groups tab
└── profile/             # Profile tab (with stack)
    ├── _layout.tsx      # Profile stack navigator
    ├── index.tsx        # Profile main screen
    ├── edit.tsx         # Edit profile
    └── emergency-contacts/
        ├── add.tsx      # Add emergency contact
        └── edit/
            └── [id].tsx # Edit emergency contact
```

## Navigation Patterns

### 1. Tab Navigation (Bottom Bar)
- **Home**: Dashboard with today's doses and statistics
- **Medicines**: Medicine management
- **History**: Calendar view and statistics
- **Groups**: Medicine groups (future feature)
- **Profile**: User profile and settings

### 2. Stack Navigation within Tabs

#### Medicines Stack
```
Medicines List (index)
  ├─→ Medicine Detail ([id])
  ├─→ Add Medicine (add)
  └─→ Edit Medicine (edit/[id])
```

#### Profile Stack
```
Profile Main (index)
  ├─→ Edit Profile (edit)
  ├─→ Add Emergency Contact (emergency-contacts/add)
  └─→ Edit Emergency Contact (emergency-contacts/edit/[id])
```

## Navigation Methods

### Using Relative Paths (Recommended within same stack)
```typescript
// From profile/index.tsx
router.push("/profile/edit");
router.push("/profile/emergency-contacts/add");
router.push(`/profile/emergency-contacts/edit/${id}`);
```

### Using Absolute Paths (Cross-tab navigation)
```typescript
// From any screen
router.push("/(tabs)/medicines/add");
router.push("/(tabs)/profile/edit");
```

### Going Back
```typescript
router.back();
```

## Screen Options

### Hide Tab Bar on Sub-screens
Sub-screens automatically hide the tab bar when navigated to from within a stack.

### Hide Header
```typescript
// In _layout.tsx
<Stack.Screen
  name="screen-name"
  options={{
    headerShown: false,
  }}
/>
```

### Custom Headers
Each screen can implement its own custom header in the component.

## Benefits of This Structure

### 1. **Clean Tab Bar**
- Only main screens show in the tab bar
- Sub-screens are properly nested and don't clutter the bottom navigation
- Tab bar automatically hides when navigating to sub-screens

### 2. **Proper Back Navigation**
- Each stack maintains its own navigation history
- Back button works correctly within each tab
- Users can't accidentally navigate to wrong sections

### 3. **Scalability**
- Easy to add more sub-screens without affecting tab bar
- Each tab can have complex nested navigation
- Clear separation of concerns

### 4. **Better UX**
- Users understand where they are in the app
- Consistent navigation patterns
- Proper screen transitions

## Example Navigation Flows

### Edit Profile Flow
```
1. User taps "Profile" tab → Profile Main Screen
2. User taps "Edit Profile" → Edit Profile Screen (tab bar hidden)
3. User saves changes → Navigates back to Profile Main (tab bar visible)
```

### Add Emergency Contact Flow
```
1. User is on Profile Main Screen
2. User taps "+" icon → Add Emergency Contact Screen (tab bar hidden)
3. User saves contact → Navigates back to Profile Main (tab bar visible)
4. Profile Main reloads data using useFocusEffect
```

### Edit Emergency Contact Flow
```
1. User is on Profile Main Screen
2. User taps on a contact → Edit Emergency Contact Screen (tab bar hidden)
3. User saves changes → Navigates back to Profile Main (tab bar visible)
4. Profile Main reloads data using useFocusEffect
```

## Data Refresh Pattern

### Using useFocusEffect
```typescript
import { useFocusEffect } from "expo-router";

useFocusEffect(
  useCallback(() => {
    loadData(); // Reload data when screen comes into focus
  }, [loadData])
);
```

This ensures that when users navigate back from sub-screens, the main screen automatically refreshes to show updated data.

## File Naming Conventions

- `index.tsx` - Main screen for a route
- `[id].tsx` - Dynamic route with parameter
- `_layout.tsx` - Layout/navigator for nested routes
- `add.tsx` - Screen for adding new items
- `edit/[id].tsx` - Screen for editing existing items

## Common Issues and Solutions

### Issue: Tab bar shows on sub-screens
**Solution**: Add `headerShown: false` to the tab screen in `(tabs)/_layout.tsx`

### Issue: Navigation doesn't work
**Solution**: Check that the path matches the file structure exactly

### Issue: Data doesn't refresh after editing
**Solution**: Use `useFocusEffect` to reload data when screen comes into focus

### Issue: Back button goes to wrong screen
**Solution**: Ensure proper stack structure with `_layout.tsx` files

## Testing Navigation

To test the navigation structure:

1. **Tab Navigation**: Tap each tab and verify it goes to the correct screen
2. **Stack Navigation**: Navigate to sub-screens and verify back button works
3. **Tab Bar Visibility**: Verify tab bar hides on sub-screens
4. **Data Refresh**: Edit data and go back, verify main screen updates
5. **Deep Links**: Test direct navigation to nested screens

---

**Last Updated**: November 27, 2024
**Status**: ✅ Properly structured with nested stacks

