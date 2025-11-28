# Notification Timing Fix

## Issue
Notifications were potentially triggering immediately when a medicine was added, instead of only showing up when the system time matches the scheduled medicine time.

## Root Cause
When scheduling notifications, if the current time was very close to a scheduled time (within seconds), the notification could be scheduled for immediate delivery or near-immediate delivery, causing it to appear right after adding the medicine.

## Solution
Added a 1-minute buffer to the notification scheduling logic to ensure that:
1. Notifications are only scheduled for times that are at least 1 minute in the future
2. This prevents any immediate notifications when adding a medicine
3. Notifications will only trigger when the actual scheduled time arrives

## Changes Made

**File**: `lib/notifications/scheduler.ts`

### Added Buffer Time
```typescript
const now = new Date();
// Add a 1-minute buffer to prevent immediate notifications
const bufferTime = new Date(now.getTime() + 60 * 1000);
const endDate = addDays(now, daysAhead);
```

### Updated All Scheduling Checks

#### 1. Daily Frequency
```typescript
// Before: if (scheduledTime > now && scheduledTime <= endDate)
// After:  if (scheduledTime > bufferTime && scheduledTime <= endDate)
```

#### 2. Specific Days Frequency
```typescript
// Before: if (scheduledTime > now && scheduledTime <= endDate)
// After:  if (scheduledTime > bufferTime && scheduledTime <= endDate)
```

#### 3. Interval Frequency
```typescript
// Before: if (nextOccurrence <= now)
// After:  if (nextOccurrence <= bufferTime)

// Before: if (nextOccurrence > now)
// After:  if (nextOccurrence > bufferTime)
```

## Behavior After Fix

### When Adding a Medicine:
- ❌ **No immediate notification** - Even if you add a medicine with a time close to now
- ✅ **Scheduled for future** - Notifications are scheduled for at least 1 minute in the future
- ✅ **Proper timing** - Notifications will trigger when the scheduled time actually arrives

### Example Scenarios:

**Scenario 1: Adding medicine at 9:00 AM with 9:01 AM schedule**
- Before: Notification might trigger immediately
- After: Notification scheduled for 9:01 AM (1 minute away)

**Scenario 2: Adding medicine at 9:00 AM with 9:00 AM schedule**
- Before: Notification might trigger immediately
- After: No notification today, scheduled for tomorrow at 9:00 AM

**Scenario 3: Adding medicine at 9:00 AM with 2:00 PM schedule**
- Before: Scheduled for 2:00 PM (correct)
- After: Scheduled for 2:00 PM (correct, no change)

## Testing

To verify the fix:

1. **Test immediate time**: Add a medicine with a time 1-2 minutes from now
   - Expected: No immediate notification
   - Expected: Notification appears at the scheduled time

2. **Test past time**: Add a medicine with a time that already passed today
   - Expected: No immediate notification
   - Expected: Notification scheduled for tomorrow at that time

3. **Test future time**: Add a medicine with a time several hours away
   - Expected: No immediate notification
   - Expected: Notification appears at the scheduled time

## Additional Notes

- The 1-minute buffer is a safety margin to account for processing time
- This doesn't affect the actual dose schedule - doses are still recorded at the correct times
- The buffer only affects when notifications are scheduled, not when they're displayed
- Users will not notice the 1-minute buffer in normal usage

## Related Files
- `lib/notifications/scheduler.ts` - Main notification scheduling logic
- `lib/notifications/setup.ts` - Notification configuration
- `app/(tabs)/medicines/add.tsx` - Calls scheduler when medicine is added
- `app/(tabs)/medicines/edit/[id].tsx` - Calls scheduler when medicine is edited

