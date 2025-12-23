# Notification Schedule Fix

**Date:** November 30, 2024  
**Issue:** Notification scheduling not properly handling medicine start times and seconds normalization

---

## Problem Statement

When a medicine was added, the notification scheduling had several issues:

1. **Seconds not normalized**: Scheduled times could have non-zero seconds (e.g., 09:00:37 instead of 09:00:00)
2. **Start time ignored**: First schedule didn't always start from the medicine's `start_date`
3. **Past notifications**: Notifications could be scheduled for times that had already passed

---

## Root Cause

The `scheduleMedicineNotifications()` function in `/lib/notifications/scheduler.ts` had the following issues:

1. **No seconds normalization**: When creating scheduled times, seconds were not explicitly set to 0
2. **Starting from "now"**: Daily and specific days schedules started from current time instead of medicine start date
3. **Insufficient future check**: The `scheduleNotification()` function didn't verify if the time was actually in the future before scheduling

---

## Solution Implemented

### 1. Normalize Seconds in `scheduleNotification()`

**File**: `/lib/notifications/scheduler.ts`

```typescript
export const scheduleNotification = async (
  params: ScheduleNotificationParams,
  userId?: string
): Promise<string> => {
  const { medicineId, medicineName, dosage, unit, scheduledTime, scheduleId } = params;

  // ✅ NEW: Ensure seconds are always 0
  const normalizedScheduledTime = new Date(scheduledTime);
  normalizedScheduledTime.setSeconds(0, 0);

  // ✅ NEW: Only schedule if the time is in the future
  const now = new Date();
  if (normalizedScheduledTime <= now) {
    console.log(`Skipping notification for ${medicineName} - scheduled time is not in the future`);
    return "";
  }

  // ... rest of the function uses normalizedScheduledTime
};
```

**Changes:**
- Added `normalizedScheduledTime` to ensure seconds and milliseconds are always 0
- Added future time check before scheduling
- All subsequent code uses `normalizedScheduledTime` instead of `scheduledTime`

### 2. Start from Medicine Start Date

**File**: `/lib/notifications/scheduler.ts`

```typescript
export const scheduleMedicineNotifications = async (
  medicineId: string,
  daysAhead: number = 7
): Promise<void> => {
  // ... get medicine and schedules ...

  // ✅ NEW: Get medicine start date
  const medicineStartDate = new Date(medicine.start_date);

  for (const schedule of schedules) {
    if (medicine.frequency === "daily") {
      const [hours, minutes] = schedule.time.split(":").map(Number);
      
      // ✅ NEW: Start from medicine start date or today, whichever is later
      let currentDate = new Date(Math.max(medicineStartDate.getTime(), now.getTime()));
      currentDate.setHours(0, 0, 0, 0); // Reset to start of day

      while (currentDate <= endDate) {
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(hours, minutes, 0, 0); // ✅ Always set seconds to 0

        // Only schedule if it's in the future (with buffer)
        if (scheduledTime > bufferTime && scheduledTime <= endDate) {
          await scheduleNotification({ ... });
        }

        currentDate = addDays(currentDate, 1);
      }
    }
    // ... similar changes for specific_days and interval frequencies ...
  }
};
```

**Changes:**
- Added `medicineStartDate` from `medicine.start_date`
- For daily/specific days: Start from `Math.max(medicineStartDate, now)` to respect medicine start date
- Always set seconds to 0 when creating scheduled times: `setHours(hours, minutes, 0, 0)`
- Interval-based schedules already started from medicine start date (no change needed)

---

## Behavior After Fix

### When Adding a New Medicine

**Scenario 1: Medicine starts today**
- Medicine start date: `2024-11-30`
- Schedule time: `09:00`
- Current time: `2024-11-30 08:00:00`

**Result:**
- ✅ First notification scheduled for `2024-11-30 09:00:00` (today at 9 AM, seconds = 0)
- ✅ Subsequent notifications for following days at 09:00:00

**Scenario 2: Medicine starts in the future**
- Medicine start date: `2024-12-01`
- Schedule time: `09:00`
- Current time: `2024-11-30 08:00:00`

**Result:**
- ✅ First notification scheduled for `2024-12-01 09:00:00` (tomorrow at 9 AM, seconds = 0)
- ✅ No notification for today (respects start date)

**Scenario 3: Medicine starts today but time has passed**
- Medicine start date: `2024-11-30`
- Schedule time: `09:00`
- Current time: `2024-11-30 10:00:00`

**Result:**
- ❌ No notification for today (time has passed)
- ✅ First notification scheduled for `2024-12-01 09:00:00` (tomorrow at 9 AM, seconds = 0)

### Interval-Based Schedules

**Scenario: Every 8 hours starting from medicine start date**
- Medicine start date: `2024-11-30`
- Schedule time: `09:00`
- Interval: `8 hours`
- Current time: `2024-11-30 08:00:00`

**Result:**
- ✅ First notification: `2024-11-30 09:00:00` (today at 9 AM, seconds = 0)
- ✅ Second notification: `2024-11-30 17:00:00` (today at 5 PM, seconds = 0)
- ✅ Third notification: `2024-12-01 01:00:00` (tomorrow at 1 AM, seconds = 0)
- And so on...

---

## Key Rules Enforced

1. **Seconds Always 0**: All scheduled times have seconds and milliseconds set to 0
2. **Respect Start Date**: First schedule always starts from medicine start date (or later if start date is in the past)
3. **Only Future Times**: Notifications are only scheduled if the time is in the future (with 2-minute buffer)
4. **Consistent Timing**: All notifications trigger at exact times (e.g., 09:00:00, not 09:00:37)

---

## Files Modified

1. `/lib/notifications/scheduler.ts`
   - Modified `scheduleNotification()` to normalize seconds and check future time
   - Modified `scheduleMedicineNotifications()` to start from medicine start date
   - Added seconds normalization in all frequency types (daily, specific_days, interval)

2. `/llms.txt`
   - Added new section: "Notification Scheduling Rules"
   - Documented the critical rules and patterns
   - Added code examples for proper notification scheduling

3. `/docs/NOTIFICATION_SCHEDULE_FIX.md` (this file)
   - Complete documentation of the fix

---

## Testing Recommendations

### Manual Testing

1. **Test Daily Schedule with Future Start Date**
   - Create medicine with start date tomorrow
   - Verify first notification is scheduled for tomorrow, not today

2. **Test Daily Schedule with Past Time Today**
   - Create medicine with start date today
   - Set schedule time that has already passed
   - Verify first notification is tomorrow

3. **Test Interval Schedule**
   - Create medicine with interval (e.g., every 8 hours)
   - Verify first notification is at medicine start date + schedule time
   - Verify subsequent notifications are exactly 8 hours apart

4. **Test Seconds Normalization**
   - Check scheduled notifications in device settings
   - Verify all times end with :00 seconds (not :37 or other values)

### Automated Testing (Future)

```typescript
describe('scheduleNotification', () => {
  it('should normalize seconds to 0', async () => {
    const scheduledTime = new Date('2024-11-30T09:00:37.123Z');
    // ... call scheduleNotification ...
    // Verify scheduled time is 2024-11-30T09:00:00.000Z
  });

  it('should not schedule past times', async () => {
    const pastTime = new Date(Date.now() - 60000); // 1 minute ago
    // ... call scheduleNotification ...
    // Verify no notification was scheduled
  });
});

describe('scheduleMedicineNotifications', () => {
  it('should start from medicine start date', async () => {
    const medicine = { start_date: '2024-12-01', ... };
    // ... call scheduleMedicineNotifications ...
    // Verify first notification is on 2024-12-01
  });
});
```

---

## Related Documentation

- `/docs/NOTIFICATION_TIMING.md` - How notifications work
- `/docs/NOTIFICATION_TIMING_FIX.md` - Previous notification timing fix (buffer time)
- `/llms.txt` - Section: "Notification Scheduling Rules"
- `/lib/notifications/scheduler.ts` - Implementation

---

## Last Updated

November 30, 2024

