# Global Time Hook Documentation

## Overview
The `useTime` hook provides a centralized, consistent time management system across the entire app. This ensures that all time-related calculations use the same reference time, eliminating time gaps and inconsistencies.

## Problem Solved
Previously, different parts of the app would call `new Date()` independently, which could lead to:
- Small time gaps between calculations
- Inconsistent relative time displays
- Race conditions in time-sensitive operations
- Different components showing slightly different times

## Solution
The global time hook provides:
1. **Singleton time reference** - All components use the same cached time
2. **Automatic updates** - Time refreshes every minute to keep displays current
3. **Consistent calculations** - All relative time calculations use the same reference
4. **Performance optimization** - Time is cached for 1 second to avoid excessive Date object creation

## Core Functions

### `getCurrentTime()`
Returns the current time with 1-second caching for consistency.

```typescript
import { getCurrentTime } from '@/lib/utils/date-helpers';

const now = getCurrentTime();
// All calls within 1 second return the same Date object
```

### `useTime(updateInterval?: number)`
React hook that provides live time updates.

```typescript
import { useTime } from '@/lib/utils/date-helpers';

function MyComponent() {
  const currentTime = useTime(60000); // Updates every minute
  // Component re-renders when time updates
}
```

## Time Formatting Functions

### `formatTime(timeString: string)`
Converts 24-hour time to 12-hour format with AM/PM.

```typescript
formatTime("14:30") // "2:30 PM"
formatTime("09:00") // "9:00 AM"
```

### `formatDate(date: Date | string)`
Formats date in long format.

```typescript
formatDate(new Date()) // "November 29, 2024"
```

### `formatDateTime(date: Date | string)`
Combines date and time formatting.

```typescript
formatDateTime(new Date()) // "Today at 2:30 PM"
formatDateTime("2024-11-28") // "Yesterday at 10:00 AM"
```

### `formatDateDisplay(date: Date | string)`
Shows relative date (Today, Tomorrow, Yesterday) or formatted date.

```typescript
formatDateDisplay(new Date()) // "Today"
formatDateDisplay(tomorrow) // "Tomorrow"
formatDateDisplay(lastWeek) // "Fri, Nov 22"
```

## Relative Time Functions

### `getRelativeTime(dateString: string, referenceTime?: Date)`
Returns human-readable relative time string.

```typescript
getRelativeTime(futureDate) // "in 2h"
getRelativeTime(pastDate) // "5m ago"
getRelativeTime(overdueDate) // "Overdue"
```

**Formats:**
- Future: "Now", "in 5m", "in 2h", "Tomorrow", "in 3d"
- Past: "Just now", "5m ago", "2h ago", "Yesterday", "3d ago", "Overdue"

### `getDetailedRelativeTime(dateString: string, referenceTime?: Date)`
Returns detailed time information.

```typescript
const details = getDetailedRelativeTime(dateString);
// {
//   relative: "in 2h",
//   absolute: "Today at 2:30 PM",
//   isOverdue: false
// }
```

### `useRelativeTime(dateString?: string, updateInterval?: number)`
React hook for live relative time that auto-updates.

```typescript
function MedicineCard({ medicine }) {
  const relativeTime = useRelativeTime(medicine.nextDose?.scheduled_time);
  // Automatically updates every minute
  return <Text>{relativeTime}</Text>; // "in 2h" → "in 1h" → "in 59m"
}
```

### `useDetailedRelativeTime(dateString?: string, updateInterval?: number)`
React hook for detailed live relative time.

```typescript
function DoseCard({ dose }) {
  const details = useDetailedRelativeTime(dose.scheduled_time);
  return (
    <View>
      <Text>{details?.relative}</Text>
      <Text>{details?.absolute}</Text>
    </View>
  );
}
```

## Time Calculation Functions

### `getTimeUntil(dateString: string, referenceTime?: Date)`
Returns time breakdown until a specific date.

```typescript
const timeUntil = getTimeUntil(futureDate);
// {
//   hours: 2,
//   minutes: 30,
//   seconds: 45,
//   total: 9045000 // milliseconds
// }
```

### `formatTimeUntil(dateString: string, referenceTime?: Date)`
Returns formatted time until string.

```typescript
formatTimeUntil(futureDate) // "2h 30m"
formatTimeUntil(soonDate) // "45m"
formatTimeUntil(veryClose) // "Less than a minute"
```

## Utility Functions

### `isPast(dateString: string, referenceTime?: Date)`
Checks if a date/time is in the past.

```typescript
if (isPast(dose.scheduled_time)) {
  // Dose is overdue
}
```

### `isToday(dateString: string, referenceTime?: Date)`
Checks if a date is today.

```typescript
if (isToday(dose.scheduled_time)) {
  // Dose is scheduled for today
}
```

## Usage Examples

### Medicine Card with Live Updates
```typescript
import { useRelativeTime, formatTime } from '@/lib/utils/date-helpers';

function MedicineCard({ medicine }) {
  const relativeTime = useRelativeTime(medicine.nextDose?.scheduled_time);
  
  return (
    <View>
      <Text>{medicine.name}</Text>
      <Text>Next: {formatTime(medicine.nextDose.time)}</Text>
      {relativeTime && <Badge>{relativeTime}</Badge>}
    </View>
  );
}
```

### Dose History with Consistent Time
```typescript
import { getCurrentTime, formatDateTime } from '@/lib/utils/date-helpers';

function DoseHistory({ doses }) {
  const now = getCurrentTime(); // Consistent reference time
  
  return doses.map(dose => {
    const isPastDue = new Date(dose.scheduled_time) < now;
    return (
      <View key={dose.id}>
        <Text>{formatDateTime(dose.scheduled_time)}</Text>
        {isPastDue && <Badge>Overdue</Badge>}
      </View>
    );
  });
}
```

### Next Dose Calculation
```typescript
import { getCurrentTime, getDetailedRelativeTime } from '@/lib/utils/date-helpers';

function calculateNextDose(schedules) {
  const now = getCurrentTime(); // Use global time
  
  // ... calculation logic using 'now' ...
  
  return {
    schedule_id: schedule.id,
    scheduled_time: nextDate.toISOString(),
    time: schedule.time,
  };
}
```

## Migration Guide

### Before (Inconsistent)
```typescript
// Different components creating different Date objects
const now1 = new Date(); // Component A
const now2 = new Date(); // Component B (slightly different time!)

// Manual relative time calculation
const diff = targetDate.getTime() - new Date().getTime();
const hours = Math.floor(diff / 3600000);
```

### After (Consistent)
```typescript
// All components use the same time reference
import { getCurrentTime, useRelativeTime } from '@/lib/utils/date-helpers';

const now = getCurrentTime(); // Same time across all components

// Use built-in relative time hook
const relativeTime = useRelativeTime(targetDate);
```

## Performance Considerations

1. **Caching**: Time is cached for 1 second to reduce Date object creation
2. **Update Interval**: Default 60-second updates balance freshness with performance
3. **Memoization**: Hooks use useMemo/useCallback for optimal re-renders
4. **Singleton Pattern**: Single time reference reduces memory usage

## Best Practices

1. **Always use `getCurrentTime()`** instead of `new Date()` for consistency
2. **Use hooks for live updates** in React components
3. **Pass referenceTime** when testing or need specific time reference
4. **Adjust update interval** based on component needs (default 60s is good for most cases)

## Testing

```typescript
import { getRelativeTime, getCurrentTime } from '@/lib/utils/date-helpers';

// Test with specific reference time
const testTime = new Date('2024-11-29T14:00:00');
const futureTime = new Date('2024-11-29T16:30:00');

const relative = getRelativeTime(futureTime.toISOString(), testTime);
expect(relative).toBe('in 2h');
```

## Files Updated

The following files now use the global time hook:
- `lib/hooks/useTime.ts` - Core hook implementation
- `lib/utils/date-helpers.ts` - Re-exports and legacy functions
- `components/medicine/MedicineCard.tsx` - Uses `useRelativeTime`
- `lib/database/models/medicine.ts` - Uses `getCurrentTime`
- `app/(tabs)/medicines/[id].tsx` - Uses `getCurrentTime`

## Benefits

✅ **Consistency** - All time displays show the same reference time
✅ **Accuracy** - No more small time gaps between calculations
✅ **Performance** - Cached time reduces Date object creation
✅ **Maintainability** - Single source of truth for time handling
✅ **Live Updates** - Automatic refresh keeps displays current
✅ **Testing** - Easy to test with custom reference times







