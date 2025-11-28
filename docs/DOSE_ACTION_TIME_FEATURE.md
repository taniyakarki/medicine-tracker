# Dose Action Time Feature

## Overview

Added a time difference indicator to dose history cards that shows how early or late a dose was taken compared to its scheduled time. This provides valuable adherence insights at a glance.

## Feature Description

### What It Shows

When a dose is marked as taken, the card now displays:
- **Taken time**: The actual time the dose was taken
- **Time difference badge**: How early/late it was taken

### Time Difference Display

The badge shows:
- **"on time"** - Taken within the same minute as scheduled
- **"Xm early"** - Taken X minutes before scheduled time
- **"Xh Ym early"** - Taken hours and minutes before scheduled time
- **"Xm late"** - Taken X minutes after scheduled time
- **"Xh Ym late"** - Taken hours and minutes after scheduled time

## Visual Design

### Card Layout

```
┌─────────────────────────────────────────────┐
│  [Icon]  100 mg • Today        [STATUS]     │
│          🕐 Scheduled: 9:00 AM              │
│          ✓ Taken: 9:15 AM      [15m late]   │
└─────────────────────────────────────────────┘
```

### Badge Styling

- **Background**: Light green with 10% opacity
- **Border**: Green with 30% opacity
- **Text**: Green, semibold, small size
- **Shape**: Rounded rectangle (8px radius)
- **Position**: Right side of taken time row

## Implementation Details

### Time Calculation Function

```typescript
const getTimeDifference = (scheduledTime: string, takenTime: string) => {
  const scheduled = new Date(scheduledTime);
  const taken = new Date(takenTime);
  const diffMs = taken.getTime() - scheduled.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (diffMins === 0) {
    return "on time";
  } else if (diffMins > 0) {
    // Late
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m late`;
    }
    return `${diffMins}m late`;
  } else {
    // Early
    const absMins = Math.abs(diffMins);
    const hours = Math.floor(absMins / 60);
    const mins = absMins % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m early`;
    }
    return `${absMins}m early`;
  }
};
```

### Logic

1. **Calculate difference**: Subtract scheduled time from taken time
2. **Convert to minutes**: Round to nearest minute
3. **Format output**:
   - If difference is 0: "on time"
   - If positive (late): Show minutes or hours+minutes with "late"
   - If negative (early): Show minutes or hours+minutes with "early"

## Use Cases

### Adherence Tracking

**Example 1**: On-time dose
```
Scheduled: 9:00 AM
Taken: 9:00 AM
Badge: "on time"
```

**Example 2**: Slightly late
```
Scheduled: 9:00 AM
Taken: 9:15 AM
Badge: "15m late"
```

**Example 3**: Very late
```
Scheduled: 9:00 AM
Taken: 11:30 AM
Badge: "2h 30m late"
```

**Example 4**: Early dose
```
Scheduled: 9:00 AM
Taken: 8:45 AM
Badge: "15m early"
```

### Benefits

1. **Quick Insights**: See adherence patterns at a glance
2. **Accountability**: Visual reminder of timing accuracy
3. **Pattern Recognition**: Identify consistent early/late patterns
4. **Medical Compliance**: Important for time-sensitive medications
5. **Behavior Tracking**: Understand personal medication habits

## Visual Examples

### On Time
```
✓ Taken: 9:00 AM  [on time]
```

### Early
```
✓ Taken: 8:45 AM  [15m early]
```

### Late
```
✓ Taken: 9:30 AM  [30m late]
```

### Very Late
```
✓ Taken: 11:00 AM  [2h 0m late]
```

## Styling Details

### Badge Styles

```typescript
timeDiffBadge: {
  paddingHorizontal: Spacing.sm,
  paddingVertical: 4,
  borderRadius: 8,
  borderWidth: 1,
  backgroundColor: `${colors.success}10`,  // 10% opacity
  borderColor: `${colors.success}30`,      // 30% opacity
}

timeDiffText: {
  fontSize: Typography.fontSize.xs,
  fontWeight: Typography.fontWeight.semibold,
  color: colors.success,
}
```

### Layout

```typescript
takenTimeRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: Spacing.sm,
}
```

## Future Enhancements

Potential improvements:

1. **Color Coding**:
   - Green: On time or early
   - Yellow: 15-30 minutes late
   - Red: More than 30 minutes late

2. **Statistics**:
   - Average time difference
   - Most common delay pattern
   - Adherence score based on timing

3. **Notifications**:
   - Alert if consistently late
   - Suggest schedule adjustments

4. **Insights**:
   - "You usually take this 15m late"
   - "Best adherence: Morning doses"

5. **Filters**:
   - Show only late doses
   - Show only early doses
   - Filter by time range

## Testing Checklist

- [x] Badge appears when dose is taken
- [x] Badge shows correct time difference
- [x] "on time" displays for same-minute doses
- [x] Early doses show negative difference
- [x] Late doses show positive difference
- [x] Hours and minutes format correctly
- [x] Badge styling matches design
- [x] Badge aligns properly on right side
- [x] Works with different time zones
- [x] Works with doses taken days later

## Related Files

- `components/medicine/DoseHistoryList.tsx` - Main component
- `app/(tabs)/medicines/[id].tsx` - Medicine details page
- `app/(tabs)/history.tsx` - History page
- `types/medicine.ts` - Type definitions

## User Feedback

This feature helps users:
- ✅ Understand their adherence patterns
- ✅ Identify problematic times of day
- ✅ Improve medication timing
- ✅ Provide accurate info to healthcare providers
- ✅ Build better medication habits

