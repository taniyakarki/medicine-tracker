# Interval Scheduling Fix

## Issue

When adding or editing a medicine with interval frequency:

1. Doses were not being scheduled correctly from the selected start time
2. They weren't visible on the home page
3. Past doses (when start time was before current time) weren't showing in recent activity

## Root Cause

The interval scheduling logic had two main issues:

1. It was starting from "now" instead of considering the medicine's `start_date`
2. It wasn't creating past doses when the start time was before the current time
3. Past doses weren't marked as "missed" so they didn't appear in recent activity

This caused issues when:

1. Adding a medicine with a start date in the future
2. Adding a medicine with a start time earlier than the current time
3. The selected time slot wasn't being properly used as the reference point
4. Doses weren't being created for the correct intervals

## Solution

Updated the interval scheduling logic to:

1. Use the medicine's `start_date` as the reference point
2. Create past doses as "missed" for the last 24 hours if start time was in the past
3. Calculate intervals from the selected time slot
4. Properly schedule all future doses within the time window
5. Show past missed doses in recent activity

## Changes Made

**File**: `lib/notifications/scheduler.ts`

### Updated Interval Scheduling Logic

```typescript
// Before:
let nextOccurrence = new Date(now);
nextOccurrence.setHours(hours, minutes, 0, 0);

// After:
// Start from the medicine's start date
const startDate = new Date(medicine.start_date);
let firstOccurrence = new Date(startDate);
firstOccurrence.setHours(hours, minutes, 0, 0);

// Create past doses as "missed" if the start time was in the past
if (firstOccurrence < now) {
  let pastOccurrence = new Date(firstOccurrence);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  while (pastOccurrence < now) {
    if (pastOccurrence >= oneDayAgo && pastOccurrence < bufferTime) {
      // Create missed dose for past occurrences
      await createDose({
        medicine_id: medicine.id,
        schedule_id: schedule.id,
        scheduled_time: pastOccurrence.toISOString(),
        status: "missed",
      });
    }
    pastOccurrence = new Date(pastOccurrence.getTime() + intervalMillis);
  }
}
```

### Improved Interval Calculation

The logic now:

1. Takes the medicine's `start_date` into account
2. Sets the time to the selected time slot (hours:minutes)
3. Creates past doses as "missed" for the last 24 hours
4. Calculates the next occurrence based on the interval
5. Schedules all future occurrences within the 7-day window
6. Past missed doses appear in recent activity

## How It Works Now

### Example 1: Adding Medicine with Interval Today

- **Current time**: 2:00 PM
- **Start date**: Today
- **Time slot**: 9:00 AM
- **Interval**: Every 6 hours

**Result**:

- First dose: Today at 3:00 PM (next interval after 2:00 PM)
- Second dose: Today at 9:00 PM
- Third dose: Tomorrow at 3:00 AM
- Fourth dose: Tomorrow at 9:00 AM
- And so on...

### Example 2: Adding Medicine with Future Start Date

- **Current time**: Monday 2:00 PM
- **Start date**: Wednesday
- **Time slot**: 10:00 AM
- **Interval**: Every 8 hours

**Result**:

- First dose: Wednesday at 10:00 AM
- Second dose: Wednesday at 6:00 PM
- Third dose: Thursday at 2:00 AM
- Fourth dose: Thursday at 10:00 AM
- And so on...

### Example 3: Adding Medicine with Past Time Today

- **Current time**: 3:00 PM
- **Start date**: Today
- **Time slot**: 1:00 PM
- **Interval**: Every 4 hours

**Result**:

- **Past dose (missed)**: Today at 1:00 PM - Created as "missed", shows in recent activity
- First scheduled dose: Today at 5:00 PM (next interval: 1PM + 4hrs)
- Second dose: Today at 9:00 PM
- Third dose: Tomorrow at 1:00 AM
- Fourth dose: Tomorrow at 5:00 AM
- And so on...

### Example 4: Adding Medicine with Start Time 12 Hours Ago

- **Current time**: 6:00 PM
- **Start date**: Today
- **Time slot**: 6:00 AM
- **Interval**: Every 6 hours

**Result**:

- **Past dose (missed)**: Today at 6:00 AM - Created as "missed"
- **Past dose (missed)**: Today at 12:00 PM - Created as "missed"
- First scheduled dose: Today at 6:00 PM (happening now, but with 1-min buffer)
- Second dose: Tomorrow at 12:00 AM
- Third dose: Tomorrow at 6:00 AM
- And so on...

## Visibility on Home Page and Recent Activity

### Upcoming Doses

Doses will now appear on the home page because:

1. ✅ Doses are created in the database when medicine is added
2. ✅ The `getUpcomingDoses` query fetches scheduled doses
3. ✅ Interval-based doses are scheduled correctly from the start time
4. ✅ All doses within the next 24 hours are displayed

### Recent Activity

Past doses will now appear in recent activity because:

1. ✅ Past doses (within last 24 hours) are created as "missed"
2. ✅ The `getRecentDoseActivity` query fetches non-scheduled doses
3. ✅ Missed doses from interval scheduling appear in the activity feed
4. ✅ Users can see what they missed and take action

## Testing

To verify the fix:

### Test 1: Add Medicine with Current Time

1. Add a medicine with interval frequency
2. Set time slot to current hour
3. Set interval to 6 hours
4. Save medicine
5. Check home page - should see next dose in ~6 hours

### Test 2: Add Medicine with Past Time

1. Add a medicine with interval frequency
2. Set time slot to 2 hours ago
3. Set interval to 4 hours
4. Save medicine
5. Check home page - should see next dose in ~2 hours

### Test 3: Add Medicine with Future Start Date

1. Add a medicine with interval frequency
2. Set start date to tomorrow
3. Set time slot to 9:00 AM
4. Set interval to 8 hours
5. Save medicine
6. Check home page - should see first dose tomorrow at 9:00 AM

## Related Files

- `lib/notifications/scheduler.ts` - Main scheduling logic
- `lib/database/models/dose.ts` - Dose queries
- `lib/hooks/useDoses.ts` - React hooks for fetching doses
- `app/(tabs)/index.tsx` - Home page displaying upcoming doses
- `app/(tabs)/medicines/add.tsx` - Add medicine screen
- `app/(tabs)/medicines/edit/[id].tsx` - Edit medicine screen

## Notes

- The 1-minute buffer is still applied to prevent immediate notifications
- Doses are scheduled for the next 7 days by default
- The home page shows doses for the next 24 hours
- Background tasks will reschedule doses as needed
