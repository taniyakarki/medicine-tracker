# Notification Timing

## How Notifications Work

Notifications in the Medicine Track app are **scheduled to trigger at exact times** matching the medicine schedule. They do NOT trigger randomly or continuously.

### Notification Scheduling

When you add or update a medicine, the app:

1. **Calculates exact times** based on your schedule (daily, specific days, or interval)
2. **Schedules notifications** for each dose time using the device's native notification system
3. **Creates dose records** in the database for tracking

### Trigger Mechanism

Notifications use **date-based triggers**:

```typescript
trigger: {
  date: scheduledTime,  // Exact date and time to trigger
  channelId: "medicine-reminders",
}
```

This means:
- ✅ Notifications **ONLY** fire at the exact scheduled time
- ✅ The system handles the timing automatically
- ✅ Works even when the app is closed or in background
- ❌ Notifications do NOT fire continuously or at random times
- ❌ Notifications do NOT check the current time repeatedly

### Example Schedule

If you set a medicine for **9:00 AM daily**:
- Notification scheduled for tomorrow at 9:00 AM
- Notification scheduled for the day after at 9:00 AM
- And so on for the next 7 days

The notification will **only trigger at 9:00 AM**, not before or after.

### Buffer Time

The app includes a **2-minute buffer** when scheduling:
- Prevents immediate notifications when adding a medicine
- Ensures you don't get notified for a time that just passed

### Notification Types

1. **Main Reminder** - Triggers at the exact scheduled time
2. **Remind Before** (optional) - Triggers X minutes before the scheduled time
3. **Missed Reminder** (optional) - Triggers X minutes after a missed dose

All three types use exact time triggers.

### Do Not Disturb (DND)

If DND is enabled:
- Notifications are **not scheduled** for times within the DND period
- The dose record is still created for tracking
- You can still see and take the dose in the app

### Background Tasks

Background tasks run periodically (every 15 minutes) to:
- Update missed doses (change status from "scheduled" to "missed")
- Send follow-up reminders for missed doses
- Reschedule notifications if needed
- Remove duplicate doses

**Important**: Background tasks do NOT trigger medicine reminders. They only manage the notification schedule and dose status.

### Notification Accuracy

The notification timing is handled by the operating system:
- **iOS**: Highly accurate, typically within seconds
- **Android**: Accurate, may vary by a few seconds based on device optimization

### Troubleshooting

#### Notifications not appearing at the right time?

1. **Check notification permissions** - Must be enabled in device settings
2. **Check battery optimization** - Disable for Medicine Track
3. **Check DND settings** - May be blocking notifications
4. **Check medicine schedule** - Verify the times are correct
5. **Restart the app** - Reinitializes the notification system

#### Getting immediate notifications?

This shouldn't happen due to the 2-minute buffer. If it does:
- The medicine was likely scheduled more than 2 minutes ago
- Check the scheduled time in the medicine details

#### Missing notifications?

1. **Check device notification settings**
2. **Ensure app has notification permissions**
3. **Check if medicine is active**
4. **Verify the schedule times**
5. **Try rescheduling** - Edit and save the medicine

### Technical Details

The notification system uses:
- **expo-notifications** for cross-platform notification scheduling
- **Native notification APIs** (iOS UserNotifications, Android NotificationManager)
- **SQLite database** for dose tracking and status management
- **Background tasks** for maintenance and missed dose detection

All timing is handled by the operating system's native notification scheduler, ensuring accurate and reliable delivery at the scheduled times.

## Summary

**Notifications trigger ONLY at the exact scheduled medicine times.** They are not continuous, not random, and not based on current time checks. The system schedules them in advance, and the operating system delivers them at the precise moment they're due.

