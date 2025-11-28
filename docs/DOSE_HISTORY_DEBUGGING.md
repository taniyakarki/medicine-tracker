# Dose History Debugging Guide

## Current Implementation Status

The dose history feature has been fully implemented in the medicine details page. If you're not seeing dose data, this guide will help you troubleshoot.

## How Dose History Works

### 1. Dose Creation Flow

```
Medicine Created → Schedules Added → Notifications Scheduled → Doses Created
```

1. **User creates a medicine** with schedules (e.g., "Take at 9:00 AM daily")
2. **App schedules notifications** for the next 7 days
3. **Doses are created** in the database for each scheduled notification
4. **Medicine details page** loads and displays these doses

### 2. Database Query

The `getDosesByMedicineId` function queries:

```sql
SELECT d.*
FROM doses d
WHERE d.medicine_id = ?
ORDER BY d.scheduled_time DESC
LIMIT 100
```

### 3. Filtering

The medicine details page filters doses to show only:

- Past doses (scheduled_time < now)
- Today's doses (scheduled_time is today)

## Checking if Doses Exist

### Method 1: Check Console Logs

When you open a medicine details page, you should see:

```
Loaded X doses for medicine [medicine-id]
Filtered to Y doses (past and today)
```

If you see `Loaded 0 doses`, it means no doses exist in the database.

### Method 2: Check Terminal Output

Look for these messages in the terminal:

```
Rescheduling notifications for X active medicines...
Successfully rescheduled all notifications
```

### Method 3: Verify Medicine Has Schedules

1. Open the medicine details page
2. Check the "Schedule" section
3. Verify at least one schedule time is shown
4. If "No schedule set" appears, doses won't be created

## Common Issues and Solutions

### Issue 1: "No dose history yet" Message

**Cause**: No doses exist in the database for this medicine

**Solutions**:

1. Ensure the medicine has at least one schedule
2. Wait for the app to reschedule notifications (happens on app start)
3. Try editing the medicine and saving it (triggers rescheduling)
4. Check that the medicine is active (`is_active = 1`)

### Issue 2: Doses Exist But Don't Show

**Cause**: Doses might be scheduled for future dates only

**Check**:

- Look at the console log: "Filtered to X doses"
- If filtered count is 0, all doses are in the future
- The page only shows past and today's doses

**Solution**:

- Wait until the scheduled time arrives
- Or manually update a dose's `scheduled_time` in the database to test

### Issue 3: Statistics Section Not Showing

**Cause**: The statistics section only appears when `doses.length > 0`

**Solution**:

- This is expected behavior
- Statistics will appear once doses exist

## Testing the Feature

### Quick Test Steps

1. **Create a test medicine**:

   - Name: "Test Medicine"
   - Add a schedule for a past time (e.g., yesterday at 9:00 AM)

2. **Wait for rescheduling**:

   - Close and reopen the app
   - Check terminal for "Successfully rescheduled"

3. **Open medicine details**:
   - Navigate to the medicine
   - Check console logs for dose count
   - Verify dose history appears

### Manual Database Check

If you have database access, run:

```sql
-- Check if doses exist
SELECT COUNT(*) FROM doses WHERE medicine_id = 'your-medicine-id';

-- View all doses for a medicine
SELECT * FROM doses
WHERE medicine_id = 'your-medicine-id'
ORDER BY scheduled_time DESC;

-- Check dose statuses
SELECT status, COUNT(*)
FROM doses
WHERE medicine_id = 'your-medicine-id'
GROUP BY status;
```

## Expected Behavior

### When Doses Exist

- **Statistics card** shows total, taken, missed, skipped counts
- **Adherence rate** displays if any doses are taken
- **Dose history** section shows filterable list
- **Toggle button** allows hiding/showing history

### When No Doses Exist

- **Statistics card** is hidden
- **Dose history** shows empty state with:
  - Calendar icon
  - "No dose history yet" message
  - Helpful explanation text

## Code References

### Key Files

- `app/(tabs)/medicines/[id].tsx` - Medicine details page
- `lib/database/models/dose.ts` - Dose database operations
- `lib/notifications/scheduler.ts` - Dose creation logic
- `components/medicine/DoseHistoryList.tsx` - History display component

### Key Functions

- `getDosesByMedicineId()` - Fetches doses from database
- `scheduleMedicineNotifications()` - Creates doses when scheduling
- `loadSchedulesAndDoses()` - Loads data in medicine details page

## Next Steps

If doses still don't appear after checking the above:

1. **Check the terminal output** when opening medicine details
2. **Verify the console logs** show dose count
3. **Ensure medicine has schedules** configured
4. **Try creating a new medicine** with a schedule
5. **Restart the app** to trigger rescheduling

## Debug Console Logs

The following logs have been added to help debug:

```javascript
console.log(`Loaded ${dosesData.length} doses for medicine ${id}`);
console.log(`Filtered to ${dosesWithMedicine.length} doses (past and today)`);
```

Check your terminal/console for these messages when opening a medicine details page.
