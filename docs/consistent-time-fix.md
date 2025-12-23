# Consistent Time Across App - Fix Documentation

## Problem
The time displayed was different between the medicines list screen and medicine details screen because:
1. **Medicines List**: Used `useRelativeTime` hook with live updates
2. **Medicine Details**: Used static `getCurrentTime()` call that only calculated once
3. **Result**: Time was inconsistent between screens and didn't update in real-time

### Example of the Issue
```
Medicines List Screen:
- Aspirin: "in 2h" (updates every 5 minutes)

Medicine Details Screen:
- Next dose: "in 2h 15m" (calculated once, never updates)
- Different time shown even though it's the same medicine!
```

## Solution
Refactored the medicine details screen to use the same global time hooks with real-time updates.

### Changes Made

#### 1. Added Real-Time Time Hook
```typescript
// Before: No time updates
export default function MedicineDetailScreen() {
  // ... component code
}

// After: Live time updates every 5 minutes
export default function MedicineDetailScreen() {
  const currentTime = useTime(300000); // Updates every 5 minutes
  // ... component code
}
```

#### 2. Converted to useMemo with Live Updates
```typescript
// Before: Static calculation
const getNextScheduledDose = () => {
  const now = getCurrentTime(); // Called once
  // ... calculation logic
  return nextDose;
};
const nextDose = getNextScheduledDose(); // Never recalculates

// After: Dynamic calculation with live updates
const nextDose = useMemo(() => {
  const now = currentTime; // Uses live updating time
  // ... calculation logic
  return nextDoseResult;
}, [schedules, currentTime]); // Recalculates when time changes
```

#### 3. Used Global Time Formatting Functions
```typescript
// Before: Custom formatting logic
const formatNextDoseTime = (nextDose) => {
  const now = getCurrentTime();
  // Manual calculation of hours, minutes
  // Manual date string formatting
  return { dateStr, timeStr, timeUntil };
};

// After: Global time functions
const nextDoseFormatted = useMemo(() => {
  if (!nextDose) return null;
  
  const dateStr = formatDateDisplay(nextDose.date);
  const timeStr = formatTimeWithAMPM(nextDose.time);
  const timeUntil = formatTimeUntil(nextDose.date.toISOString(), currentTime);
  
  return { dateStr, timeStr, timeUntil };
}, [nextDose, currentTime]);
```

## Benefits

### 1. **Consistent Time Display**
✅ Both screens now use the same time reference
✅ No more time discrepancies between screens
✅ Same calculation logic across the app

### 2. **Real-Time Updates**
✅ Medicine details screen now updates every 5 minutes
✅ Time displays stay fresh without manual refresh
✅ "in 2h" → "in 1h 55m" → "in 1h 50m" automatically

### 3. **Maintainability**
✅ Single source of truth for time calculations
✅ Reusable time formatting functions
✅ Easier to test and debug

### 4. **Performance**
✅ Uses useMemo for efficient recalculation
✅ Only recalculates when time or schedules change
✅ No unnecessary re-renders

## How It Works

### Time Flow
```
Global Time Hook (useTime)
    ↓ Updates every 5 minutes
currentTime state
    ↓ Triggers useMemo recalculation
nextDose calculation
    ↓ Formats using global functions
nextDoseFormatted display
    ↓ Shows in UI
User sees consistent, live-updating time
```

### Update Cycle
```
T+0:00  → "in 2h"
T+5:00  → "in 1h 55m" (auto-update)
T+10:00 → "in 1h 50m" (auto-update)
T+15:00 → "in 1h 45m" (auto-update)
...
```

## Code Comparison

### Before (Inconsistent)
```typescript
// Medicines List Screen
const relativeTime = useRelativeTime(medicine.nextDose?.scheduled_time);
// Updates every 5 minutes ✅

// Medicine Details Screen
const nextDose = getNextScheduledDose();
const formatted = formatNextDoseTime(nextDose);
// Never updates ❌
```

### After (Consistent)
```typescript
// Medicines List Screen
const relativeTime = useRelativeTime(medicine.nextDose?.scheduled_time, 300000);
// Updates every 5 minutes ✅

// Medicine Details Screen
const currentTime = useTime(300000);
const nextDose = useMemo(() => { /* calc */ }, [schedules, currentTime]);
const formatted = useMemo(() => { /* format */ }, [nextDose, currentTime]);
// Updates every 5 minutes ✅
```

## Testing

### Verify Consistency
1. Open medicines list screen
2. Note the time shown for a medicine (e.g., "in 2h")
3. Tap to open medicine details
4. Verify the time shown matches (e.g., "in 2h")
5. Wait 5 minutes
6. Both screens should update to new time (e.g., "in 1h 55m")

### Test Real-Time Updates
```typescript
// Add console log to verify updates
useEffect(() => {
  console.log('Medicine details time updated:', currentTime);
}, [currentTime]);

// Should log every 5 minutes:
// T+0:00  → "Medicine details time updated: ..."
// T+5:00  → "Medicine details time updated: ..."
// T+10:00 → "Medicine details time updated: ..."
```

## Files Modified

1. **app/(tabs)/medicines/[id].tsx**
   - Added `useTime` hook for live updates
   - Converted `getNextScheduledDose` to `useMemo`
   - Converted `formatNextDoseTime` to `useMemo`
   - Uses global time formatting functions

2. **lib/utils/date-helpers.ts**
   - Exports `formatDateDisplay` for consistent date formatting
   - Exports `formatTimeUntil` for consistent time-until formatting

3. **components/medicine/MedicineCard.tsx**
   - Already using `useRelativeTime` with 5-minute updates

## Migration Notes

### No Breaking Changes
✅ All existing functionality preserved
✅ Same UI appearance
✅ Better performance with memoization
✅ Automatic time consistency

### Automatic Benefits
- Users will see consistent time across screens
- No code changes needed in other parts of the app
- Time updates automatically every 5 minutes
- Better user experience with live updates

## Best Practices

### 1. Always Use Global Time Functions
```typescript
// ❌ Don't create custom time calculations
const now = new Date();
const diff = targetDate - now;

// ✅ Use global time functions
const now = getCurrentTime();
const relativeTime = getRelativeTime(targetDate);
```

### 2. Use Hooks for Live Updates
```typescript
// ❌ Don't calculate once
const time = getRelativeTime(dateString);

// ✅ Use hook for live updates
const time = useRelativeTime(dateString);
```

### 3. Memoize Expensive Calculations
```typescript
// ❌ Don't recalculate on every render
const nextDose = calculateNextDose(schedules);

// ✅ Memoize with dependencies
const nextDose = useMemo(
  () => calculateNextDose(schedules, currentTime),
  [schedules, currentTime]
);
```

## Results

✅ **Consistent time display** across all screens
✅ **Real-time updates** every 5 minutes
✅ **Better performance** with memoization
✅ **Maintainable code** with shared functions
✅ **No breaking changes** to existing functionality
✅ **Improved UX** with live updates

## Future Enhancements

Potential improvements:
- Add TimeProvider for even better performance
- Adjust update interval based on urgency
- Add visual indicator when time updates
- Sync with system time changes







