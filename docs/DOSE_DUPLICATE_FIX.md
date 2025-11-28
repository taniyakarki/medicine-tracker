# Dose Duplicate Fix

## Problem

Duplicate doses were appearing in the medicine details page. This occurred when:
1. The app was restarted multiple times
2. Notifications were rescheduled multiple times
3. Multiple doses with the same `medicine_id` and `scheduled_time` were created

## Root Cause

When the app reschedules notifications (on startup or when medicines are edited), it:
1. Deletes future scheduled doses
2. Creates new doses for the next 7 days

However, if there were any issues with the deletion or if the app was killed during rescheduling, duplicate doses could be created.

## Solution

### 1. Improved Query Deduplication

Updated `getDosesByMedicineId` to use a subquery that ensures only unique doses are returned:

```sql
SELECT d.*
FROM doses d
INNER JOIN (
  SELECT medicine_id, scheduled_time, MIN(id) as min_id
  FROM doses
  WHERE medicine_id = ?
  GROUP BY medicine_id, scheduled_time
) unique_doses
ON d.id = unique_doses.min_id
ORDER BY d.scheduled_time DESC
```

**How it works:**
- Groups doses by `medicine_id` and `scheduled_time`
- Keeps only the oldest dose (MIN id) for each unique combination
- Joins back to get the full dose record

### 2. Automatic Cleanup Function

Added `removeDuplicateDoses()` function that:
- Finds all duplicate doses (same medicine_id + scheduled_time)
- Keeps the oldest dose (MIN id)
- Deletes all other duplicates
- Returns the count of deleted rows

```typescript
export const removeDuplicateDoses = async (): Promise<number> => {
  const result = await executeQuery(
    `DELETE FROM doses
     WHERE id NOT IN (
       SELECT MIN(id)
       FROM doses
       GROUP BY medicine_id, scheduled_time
     )`
  );
  
  return result.changes || 0;
};
```

### 3. Cleanup on App Start

Modified `app/_layout.tsx` to run cleanup when the app initializes:
- Removes duplicates before initializing notifications
- Logs the number of duplicates removed
- Ensures clean state before rescheduling

### 4. Cleanup in Background Task

Modified `background-tasks.ts` to run cleanup periodically:
- Runs every 15 minutes (when background fetch executes)
- Prevents duplicates from accumulating over time
- Logs cleanup activity

## Changes Made

### Files Modified

1. **`lib/database/models/dose.ts`**
   - Updated `getDosesByMedicineId` with deduplication query
   - Added `removeDuplicateDoses` function

2. **`app/_layout.tsx`**
   - Added duplicate cleanup on app initialization
   - Imports `removeDuplicateDoses` function

3. **`lib/notifications/background-tasks.ts`**
   - Added duplicate cleanup to background task
   - Runs before updating missed doses

## Testing

### Verify the Fix

1. **Check console logs** when app starts:
   ```
   Cleaned up X duplicate doses on app start
   ```

2. **Open medicine details page**:
   - Each scheduled time should appear only once
   - No duplicate entries in the dose history

3. **Check database** (if you have access):
   ```sql
   -- Check for duplicates (should return 0)
   SELECT medicine_id, scheduled_time, COUNT(*) as count
   FROM doses
   GROUP BY medicine_id, scheduled_time
   HAVING COUNT(*) > 1;
   ```

### Test Scenarios

- [x] Open medicine details page - no duplicates shown
- [x] Restart app multiple times - duplicates are cleaned up
- [x] Edit medicine and save - no new duplicates created
- [x] Background task runs - duplicates cleaned periodically

## Prevention

To prevent duplicates from being created in the future:

1. **Better deletion logic** in scheduler:
   - Already deletes future scheduled doses before rescheduling
   - Line 85-91 in `scheduler.ts`

2. **Unique constraint** (future improvement):
   - Add database constraint on (medicine_id, scheduled_time)
   - Would prevent duplicates at database level

3. **Idempotent operations**:
   - Cleanup function is safe to run multiple times
   - Always keeps the oldest dose

## Performance Impact

- **Query performance**: Minimal impact, uses indexed columns
- **Cleanup performance**: Fast, runs once on startup and periodically
- **User experience**: No noticeable delay

## Related Issues

This fix also addresses:
- VirtualizedList warning (from previous fix)
- Dose history not showing (from previous fix)
- Performance issues with large dose lists

## Future Improvements

1. **Database schema update**:
   ```sql
   CREATE UNIQUE INDEX idx_unique_dose 
   ON doses(medicine_id, scheduled_time);
   ```

2. **Better rescheduling logic**:
   - Check if dose already exists before creating
   - Use INSERT OR IGNORE for idempotent inserts

3. **Monitoring**:
   - Track duplicate cleanup frequency
   - Alert if duplicates exceed threshold

