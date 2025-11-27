# Section 2: Advanced Scheduling - Testing Guide

This guide provides step-by-step instructions to test all the advanced scheduling features implemented in Section 2.

---

## Prerequisites

1. Expo development environment set up
2. Physical device or emulator/simulator running
3. App installed and running
4. Notification permissions granted

---

## Test 1: Multiple Times Per Day (Daily Frequency)

### Objective
Verify that a medicine can be scheduled multiple times per day with daily frequency.

### Steps
1. Open the app and navigate to Medicines tab
2. Tap "Add Medicine" button
3. Fill in basic information:
   - Name: "Vitamin D"
   - Type: "Pill"
   - Dosage: "1000"
   - Unit: "IU"
   - Frequency: "Daily"
4. In the Schedule section:
   - Tap "Add Time" → Select 8:00 AM → Confirm
   - Tap "Add Time" → Select 2:00 PM → Confirm
   - Tap "Add Time" → Select 9:00 PM → Confirm
5. Verify the schedule preview shows: "Daily at 08:00, 14:00, 21:00"
6. Tap "Add Medicine"
7. Navigate to medicine detail view
8. Verify all three time slots are displayed

### Expected Results
- ✅ Three time slots appear in the list
- ✅ Each time slot can be edited or removed
- ✅ Schedule preview updates correctly
- ✅ Medicine detail shows all three scheduled times
- ✅ 21 notifications scheduled (3 per day × 7 days)

---

## Test 2: Specific Days Selection

### Objective
Verify that a medicine can be scheduled only on specific days of the week.

### Steps
1. Navigate to Medicines tab
2. Tap "Add Medicine" button
3. Fill in basic information:
   - Name: "Blood Pressure Med"
   - Type: "Pill"
   - Dosage: "10"
   - Unit: "mg"
   - Frequency: "Specific Days"
4. In the Schedule section:
   - Select days: Mon, Wed, Fri (tap to toggle)
   - Verify selected days are highlighted in primary color
   - Tap "Add Time" → Select 9:00 AM → Confirm
   - Tap "Add Time" → Select 6:00 PM → Confirm
5. Verify schedule preview shows: "Mon, Wed, Fri at 09:00, 18:00"
6. Tap "Add Medicine"
7. Navigate to medicine detail view
8. Verify selected days and times are displayed

### Expected Results
- ✅ Day buttons toggle on/off with visual feedback
- ✅ Selected days show in primary color with white text
- ✅ Unselected days show in secondary color
- ✅ Schedule preview lists selected days
- ✅ Medicine detail shows "Mon, Wed, Fri" and both times
- ✅ 6 notifications per week (2 times × 3 days)

---

## Test 3: Interval-Based Scheduling

### Objective
Verify that a medicine can be scheduled at regular intervals.

### Steps
1. Navigate to Medicines tab
2. Tap "Add Medicine" button
3. Fill in basic information:
   - Name: "Pain Reliever"
   - Type: "Pill"
   - Dosage: "500"
   - Unit: "mg"
   - Frequency: "Interval (Hours)"
4. In the Schedule section:
   - Select interval: 8 hours (tap "8h" button)
   - Verify selected interval is highlighted
   - Tap "Add Time" → Select 9:00 AM → Confirm
5. Verify schedule preview shows: "Every 8 hours starting at 09:00"
6. Tap "Add Medicine"
7. Navigate to medicine detail view
8. Verify "Every 8 hours" is displayed

### Expected Results
- ✅ Interval buttons (2h, 4h, 6h, 8h, 12h, 24h) are displayed
- ✅ Selected interval is highlighted
- ✅ Helper text shows selected interval
- ✅ Schedule preview shows interval information
- ✅ Medicine detail shows "Every 8 hours"
- ✅ Notifications scheduled every 8 hours (9:00 AM, 5:00 PM, 1:00 AM, etc.)

---

## Test 4: Edit Medicine Schedule

### Objective
Verify that editing a medicine's schedule properly updates notifications.

### Steps
1. Navigate to an existing medicine (e.g., "Vitamin D" from Test 1)
2. Tap "Edit Medicine" button
3. Modify the schedule:
   - Remove the 2:00 PM time slot (tap X button)
   - Change 9:00 PM to 8:00 PM (tap time, select new time)
   - Add a new time at 12:00 PM (noon)
4. Verify schedule preview updates in real-time
5. Tap "Save Changes"
6. Navigate back to medicine detail view
7. Verify updated schedule is displayed

### Expected Results
- ✅ Time slots can be removed
- ✅ Time slots can be edited
- ✅ New time slots can be added
- ✅ Schedule preview updates immediately
- ✅ Old notifications are cancelled
- ✅ New notifications are scheduled
- ✅ Medicine detail shows updated schedule

---

## Test 5: Validation

### Objective
Verify that proper validation is enforced for schedules.

### Steps

**Test 5a: No Time Slots**
1. Try to add a medicine without any time slots
2. Verify error message appears

**Test 5b: Specific Days - No Days Selected**
1. Select "Specific Days" frequency
2. Add a time slot but don't select any days
3. Try to save
4. Verify error message appears

**Test 5c: Interval - No Interval Selected**
1. Select "Interval (Hours)" frequency
2. Add a time slot but don't select an interval
3. Try to save
4. Verify error message appears (or default interval is used)

### Expected Results
- ✅ Cannot save without at least one time slot
- ✅ Cannot save specific_days without at least one day selected
- ✅ Interval has a default value or requires selection
- ✅ Clear error messages guide the user

---

## Test 6: App Restart and Rescheduling

### Objective
Verify that notifications are rescheduled when the app restarts.

### Steps
1. Add several medicines with different schedules
2. Check scheduled notifications (can use Expo dev tools or device settings)
3. Force close the app completely
4. Reopen the app
5. Wait for initialization to complete
6. Check scheduled notifications again

### Expected Results
- ✅ All notifications are cancelled on restart
- ✅ All notifications are rescheduled on restart
- ✅ Notification count matches expected (7 days worth)
- ✅ Console logs show "Rescheduling all notifications..."
- ✅ Console logs show "Successfully rescheduled all notifications"

---

## Test 7: Medicine Detail Display

### Objective
Verify that all schedule information is properly displayed in the detail view.

### Steps
1. Create medicines with each frequency type:
   - Daily with 2 times
   - Specific Days (Mon, Wed, Fri) with 1 time
   - Interval (6 hours) with 1 time
2. Navigate to each medicine's detail view
3. Check the Schedule section

### Expected Results

**Daily Medicine:**
- ✅ Shows time icon and both times (e.g., "09:00", "18:00")
- ✅ No day or interval information shown

**Specific Days Medicine:**
- ✅ Shows time icon and time (e.g., "09:00")
- ✅ Shows calendar icon and days (e.g., "Mon, Wed, Fri")

**Interval Medicine:**
- ✅ Shows time icon and starting time (e.g., "09:00")
- ✅ Shows repeat icon and interval (e.g., "Every 6 hours")

---

## Test 8: Platform-Specific Time Pickers

### Objective
Verify that time pickers work correctly on both iOS and Android.

### Steps

**iOS:**
1. Tap "Add Time" button
2. Verify iOS spinner-style picker appears
3. Scroll to select time
4. Tap "Done" button
5. Verify time is added to list

**Android:**
1. Tap "Add Time" button
2. Verify Android dialog-style picker appears
3. Select time using clock interface
4. Tap "OK" button
5. Verify time is added to list

### Expected Results
- ✅ iOS shows spinner picker with "Done" button
- ✅ Android shows dialog picker with "OK"/"Cancel" buttons
- ✅ Both platforms correctly add the selected time
- ✅ Time format is consistent (24-hour HH:mm)

---

## Test 9: Schedule Preview

### Objective
Verify that the schedule preview accurately reflects the selected options.

### Steps
1. Create a new medicine
2. Select "Daily" frequency
3. Add time 09:00
4. Verify preview: "Daily at 09:00"
5. Add time 18:00
6. Verify preview: "Daily at 09:00, 18:00"
7. Change to "Specific Days"
8. Select Mon, Wed
9. Verify preview: "Mon, Wed at 09:00, 18:00"
10. Change to "Interval"
11. Select 12 hours
12. Verify preview: "Every 12 hours starting at 09:00"

### Expected Results
- ✅ Preview updates in real-time
- ✅ Preview shows correct frequency type
- ✅ Preview lists all times for daily/specific_days
- ✅ Preview shows interval and start time for interval
- ✅ Preview shows selected days for specific_days

---

## Test 10: Dark Mode Support

### Objective
Verify that the schedule picker works correctly in dark mode.

### Steps
1. Enable dark mode on device
2. Open the app
3. Navigate to Add Medicine screen
4. Interact with SchedulePicker component
5. Verify all elements are visible and properly styled

### Expected Results
- ✅ Text is readable (light text on dark background)
- ✅ Buttons have appropriate contrast
- ✅ Selected states are clearly visible
- ✅ Time picker adapts to dark mode
- ✅ No white backgrounds on dark mode

---

## Debugging Tips

### Check Scheduled Notifications
```typescript
// Add this to a button or useEffect
import * as Notifications from 'expo-notifications';

const checkNotifications = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', scheduled.length);
  scheduled.forEach(notif => {
    console.log('- ', notif.content.title, 'at', new Date(notif.trigger.value));
  });
};
```

### Check Database Schedules
```typescript
// Add this to check what's in the database
import { getSchedulesByMedicineId } from './lib/database/models/schedule';

const checkSchedules = async (medicineId: string) => {
  const schedules = await getSchedulesByMedicineId(medicineId);
  console.log('Schedules in DB:', schedules);
};
```

### Console Logs to Monitor
- "Rescheduling notifications for X active medicines..."
- "Successfully rescheduled all notifications"
- "Error scheduling notifications:" (should not appear)
- "Scheduling medicine notifications:" (when adding/editing)

---

## Common Issues and Solutions

### Issue: Notifications not appearing
**Solution:** 
- Check notification permissions
- Verify app is on a physical device (not simulator)
- Check scheduled notifications count
- Verify medicine is active

### Issue: Schedule preview not updating
**Solution:**
- Check that onChange is being called
- Verify state is updating correctly
- Check for console errors

### Issue: Time picker not showing
**Solution:**
- Verify DateTimePicker is installed
- Check platform-specific rendering
- Look for JavaScript errors

### Issue: Notifications scheduled but not firing
**Solution:**
- Check device notification settings
- Verify notification channel (Android)
- Check that trigger date is in the future
- Verify app has background permissions

---

## Success Criteria

All tests pass with the following results:
- ✅ Multiple time slots work for all frequency types
- ✅ Specific days selection works correctly
- ✅ Interval-based scheduling calculates correctly
- ✅ Editing schedules updates notifications
- ✅ Validation prevents invalid schedules
- ✅ App restart reschedules all notifications
- ✅ Medicine detail displays all schedule information
- ✅ Platform-specific pickers work correctly
- ✅ Schedule preview is accurate
- ✅ Dark mode is fully supported

---

## Performance Benchmarks

Expected performance metrics:
- Adding medicine with schedule: < 1 second
- Editing medicine schedule: < 1 second
- Rescheduling all notifications: < 5 seconds (for 10 medicines)
- App startup with rescheduling: < 3 seconds additional time

---

**Testing Status:** Ready for testing  
**Last Updated:** November 27, 2024

