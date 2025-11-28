# Dose Deduplication - Single Source of Truth

## Issue
Duplicate doses were appearing in multiple sections:
1. History section (medicine details page)
2. Pending section (home page)
3. Today's progress stats
4. Upcoming doses section

This was caused by creating multiple dose records with the same `medicine_id` and `scheduled_time` but different `id` values.

## Root Cause
When implementing interval scheduling with past doses, the system could create duplicate doses:
- One dose with status "scheduled"
- Another dose with status "missed" for the same time
- Both having the same medicine and scheduled time

## Solution - Single Source of Truth
Applied a consistent deduplication strategy across ALL dose query functions using the same logic:

```sql
GROUP BY d.medicine_id, d.scheduled_time
HAVING d.id = MIN(d.id)
```

This ensures that for any given medicine and scheduled time, only ONE dose (the first created) is returned.

## Changes Made

**File**: `lib/database/models/dose.ts`

### Updated Functions:

#### 1. `getDosesByMedicineId` - History Section
```typescript
// Used by: Medicine details page history
SELECT d.*
FROM doses d
WHERE d.medicine_id = ?
GROUP BY d.medicine_id, d.scheduled_time
HAVING d.id = MIN(d.id)
ORDER BY d.scheduled_time DESC
```

#### 2. `getUpcomingDoses` - Upcoming Section
```typescript
// Used by: Home page upcoming doses
SELECT d.*, medicine info
FROM doses d
JOIN medicines m ON d.medicine_id = m.id
WHERE m.user_id = ? 
  AND d.scheduled_time > ? 
  AND d.scheduled_time <= ?
  AND d.status = 'scheduled'
  AND m.is_active = 1
GROUP BY d.medicine_id, d.scheduled_time
HAVING d.id = MIN(d.id)
ORDER BY d.scheduled_time ASC
```

#### 3. `getTodayDoses` - Today's Doses
```typescript
// Used by: Today's doses view
SELECT d.*, medicine info
FROM doses d
JOIN medicines m ON d.medicine_id = m.id
WHERE m.user_id = ? 
  AND d.scheduled_time >= ? 
  AND d.scheduled_time <= ?
  AND m.is_active = 1
GROUP BY d.medicine_id, d.scheduled_time
HAVING d.id = MIN(d.id)
ORDER BY d.scheduled_time ASC
```

#### 4. `getDosesInDateRange` - Date Range Queries
```typescript
// Used by: Custom date range queries
SELECT d.*, medicine info
FROM doses d
JOIN medicines m ON d.medicine_id = m.id
WHERE m.user_id = ? 
  AND d.scheduled_time >= ? 
  AND d.scheduled_time <= ?
GROUP BY d.medicine_id, d.scheduled_time
HAVING d.id = MIN(d.id)
```

#### 5. `getPastPendingDoses` - Pending Section
```typescript
// Used by: Home page pending section
SELECT d.*, medicine info
FROM doses d
JOIN medicines m ON d.medicine_id = m.id
WHERE m.user_id = ? 
  AND d.scheduled_time >= ? 
  AND d.scheduled_time < ?
  AND (d.status = 'scheduled' OR d.status = 'missed')
  AND m.is_active = 1
GROUP BY d.medicine_id, d.scheduled_time
HAVING d.id = MIN(d.id)
ORDER BY d.scheduled_time DESC
```

#### 6. `getDoseStats` - Statistics
```typescript
// Used by: Today's progress card
SELECT COUNT(*) as total, ...
FROM (
  SELECT d.status, d.medicine_id, d.scheduled_time
  FROM doses d
  JOIN medicines m ON d.medicine_id = m.id
  WHERE ...
  GROUP BY d.medicine_id, d.scheduled_time
  HAVING d.id = MIN(d.id)
) as unique_doses
```

## Prevention at Source

**File**: `lib/notifications/scheduler.ts`

Added duplicate checking before creating past doses:

```typescript
// Check if a dose already exists for this time
const existingDose = await executeQuery(
  `SELECT id FROM doses 
   WHERE medicine_id = ? 
     AND schedule_id = ? 
     AND scheduled_time = ?
   LIMIT 1`,
  [medicine.id, schedule.id, pastOccurrence.toISOString()]
);

// Only create if it doesn't exist
if (existingDose.length === 0) {
  await createDose({ ... });
}
```

## Benefits

### 1. **Consistency**
All dose queries use the same deduplication logic - single source of truth

### 2. **Accuracy**
- ✅ Correct counts in all sections
- ✅ Accurate progress percentages
- ✅ No duplicate displays

### 3. **Performance**
- Deduplication happens at database level (efficient)
- Uses GROUP BY with MIN(id) (optimal)
- Prevents duplicate creation at source

### 4. **Maintainability**
- Same pattern across all queries
- Easy to understand and maintain
- Future queries can follow the same pattern

## Testing

### Test 1: History Section
1. Go to medicine details page
2. Check dose history
3. Verify: No duplicate doses for the same time

### Test 2: Pending Section
1. Go to home page
2. Check pending section
3. Verify: Each dose appears only once

### Test 3: Today's Progress
1. Go to home page
2. Check today's progress card
3. Verify: Correct total, taken, and missed counts

### Test 4: Upcoming Doses
1. Go to home page
2. Check upcoming section
3. Verify: No duplicate doses

## Pattern for Future Queries

When creating new dose queries, always use this pattern:

```sql
SELECT d.*, [other fields]
FROM doses d
[JOIN clauses]
WHERE [conditions]
GROUP BY d.medicine_id, d.scheduled_time
HAVING d.id = MIN(d.id)
[ORDER BY clause]
```

This ensures consistency and prevents duplicates across the entire application.

## Related Files
- `lib/database/models/dose.ts` - All dose query functions
- `lib/notifications/scheduler.ts` - Duplicate prevention at creation
- `app/(tabs)/index.tsx` - Home page using deduplicated queries
- `app/(tabs)/medicines/[id].tsx` - Medicine details using deduplicated queries

