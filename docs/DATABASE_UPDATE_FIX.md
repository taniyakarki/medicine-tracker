# Database Update Fix - updated_at Column Issue

## 🐛 Problem

### Error Message:
```
Failed to mark dose as taken
Call to function native database prepare async has been rejected
No such column: updated_at
```

### Root Cause:
The generic `update()` function in `lib/database/operations.ts` was automatically adding an `updated_at` column to ALL table updates, but not all tables in the schema have this column.

### Affected Tables:
Tables **WITHOUT** `updated_at` column:
- ❌ `doses` - Main issue causing the error
- ❌ `medicine_groups`
- ❌ `medicine_group_members`
- ❌ `emergency_contacts`
- ❌ `shared_users`

Tables **WITH** `updated_at` column:
- ✅ `users`
- ✅ `medicines`
- ✅ `schedules`
- ✅ `notification_settings`

## ✅ Solution

### Before (Broken):
```typescript
export const update = async <T extends Record<string, any>>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  const updated_at = getCurrentTimestamp();
  const fullData = { ...data, updated_at };  // ❌ Always adds updated_at

  const columns = Object.keys(fullData);
  const setClause = columns.map((col) => `${col} = ?`).join(", ");
  const values = [...columns.map((col) => fullData[col]), id];

  const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

  await executeUpdate(query, values);
};
```

**Problem:** This tries to update `updated_at` on the `doses` table, which doesn't have that column.

### After (Fixed):
```typescript
export const update = async <T extends Record<string, any>>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  // Only add updated_at for tables that have this column
  const tablesWithUpdatedAt = ['users', 'medicines', 'schedules', 'notification_settings'];
  const shouldAddUpdatedAt = tablesWithUpdatedAt.includes(table);
  
  const fullData = shouldAddUpdatedAt 
    ? { ...data, updated_at: getCurrentTimestamp() }  // ✅ Conditionally add
    : { ...data };

  const columns = Object.keys(fullData);
  const setClause = columns.map((col) => `${col} = ?`).join(", ");
  const values = [...columns.map((col) => fullData[col]), id];

  const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

  await executeUpdate(query, values);
};
```

**Solution:** Only adds `updated_at` to tables that actually have this column.

## 📊 Database Schema Reference

### Doses Table (No updated_at):
```sql
CREATE TABLE IF NOT EXISTS doses (
  id TEXT PRIMARY KEY NOT NULL,
  medicine_id TEXT NOT NULL,
  schedule_id TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  taken_time TEXT,
  status TEXT NOT NULL CHECK(status IN ('scheduled', 'taken', 'missed', 'skipped')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- ❌ NO updated_at column
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
);
```

### Medicines Table (Has updated_at):
```sql
CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  -- ... other columns ...
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),  -- ✅ Has updated_at
  -- ... constraints ...
);
```

## 🔧 How It Works

### Update Flow:

1. **Check Table Name**
   ```typescript
   const tablesWithUpdatedAt = ['users', 'medicines', 'schedules', 'notification_settings'];
   const shouldAddUpdatedAt = tablesWithUpdatedAt.includes(table);
   ```

2. **Conditionally Add updated_at**
   ```typescript
   const fullData = shouldAddUpdatedAt 
     ? { ...data, updated_at: getCurrentTimestamp() }
     : { ...data };
   ```

3. **Generate SQL**
   ```typescript
   const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
   ```

### Example Queries:

#### Updating Doses (No updated_at):
```sql
UPDATE doses SET status = ?, taken_time = ?, notes = ? WHERE id = ?
-- ✅ No updated_at column
```

#### Updating Medicines (With updated_at):
```sql
UPDATE medicines SET name = ?, dosage = ?, updated_at = ? WHERE id = ?
-- ✅ Includes updated_at column
```

## 🎯 Impact

### Fixed Operations:
- ✅ `markDoseAsTaken()` - Now works correctly
- ✅ `markDoseAsSkipped()` - Now works correctly
- ✅ `markDoseAsMissed()` - Now works correctly
- ✅ Any other dose updates

### Still Working:
- ✅ Medicine updates (has updated_at)
- ✅ User updates (has updated_at)
- ✅ Schedule updates (has updated_at)
- ✅ Notification settings updates (has updated_at)

### Also Fixed:
- ✅ Emergency contact updates
- ✅ Medicine group updates
- ✅ Medicine group member updates
- ✅ Shared user updates

## 🧪 Testing

### Test Cases:

#### 1. Mark Dose as Taken ✅
```typescript
await markDoseAsTaken(doseId);
// SQL: UPDATE doses SET status = 'taken', taken_time = '...' WHERE id = ?
// ✅ No updated_at - Works!
```

#### 2. Mark Dose as Skipped ✅
```typescript
await markDoseAsSkipped(doseId);
// SQL: UPDATE doses SET status = 'skipped', notes = '...' WHERE id = ?
// ✅ No updated_at - Works!
```

#### 3. Update Medicine ✅
```typescript
await updateMedicine(medicineId, { name: 'New Name' });
// SQL: UPDATE medicines SET name = 'New Name', updated_at = '...' WHERE id = ?
// ✅ Includes updated_at - Works!
```

#### 4. Update Emergency Contact ✅
```typescript
await updateEmergencyContact(contactId, { phone: '123-456-7890' });
// SQL: UPDATE emergency_contacts SET phone = '123-456-7890' WHERE id = ?
// ✅ No updated_at - Works!
```

## 📋 Tables Summary

| Table | Has updated_at | Update Works |
|-------|---------------|--------------|
| users | ✅ Yes | ✅ Yes |
| medicines | ✅ Yes | ✅ Yes |
| schedules | ✅ Yes | ✅ Yes |
| notification_settings | ✅ Yes | ✅ Yes |
| doses | ❌ No | ✅ Yes (Fixed) |
| medicine_groups | ❌ No | ✅ Yes (Fixed) |
| medicine_group_members | ❌ No | ✅ Yes (Fixed) |
| emergency_contacts | ❌ No | ✅ Yes (Fixed) |
| shared_users | ❌ No | ✅ Yes (Fixed) |

## 🚀 Alternative Solutions Considered

### Option 1: Add updated_at to All Tables (Not Chosen)
```sql
ALTER TABLE doses ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'));
```
**Pros:** Consistent schema
**Cons:** Requires migration, not needed for all tables

### Option 2: Conditional Logic in Update Function (✅ Chosen)
```typescript
const shouldAddUpdatedAt = tablesWithUpdatedAt.includes(table);
```
**Pros:** No schema changes, works immediately, flexible
**Cons:** Need to maintain list of tables

### Option 3: Remove updated_at from All Tables (Not Chosen)
**Pros:** Simplified schema
**Cons:** Lose tracking capability for important tables

## 💡 Best Practices

### When to Use updated_at:

✅ **Use for:**
- User data (profile changes)
- Medicine configurations
- Settings and preferences
- Data that changes frequently

❌ **Don't use for:**
- Immutable records (doses, logs)
- Join tables
- Simple reference data
- Time-series data (already has timestamps)

### Reasoning:
- **Doses** are historical records - they shouldn't be "updated" after creation
- **Medicines** are configurations - tracking updates is useful
- **Emergency Contacts** are simple data - created_at is sufficient

## 🔍 Debugging Tips

### If you see "No such column" errors:

1. **Check the table schema:**
   ```sql
   PRAGMA table_info(doses);
   ```

2. **Verify the update query:**
   ```typescript
   console.log('Update query:', query);
   console.log('Values:', values);
   ```

3. **Check if table has updated_at:**
   ```typescript
   const tablesWithUpdatedAt = ['users', 'medicines', 'schedules', 'notification_settings'];
   console.log('Has updated_at:', tablesWithUpdatedAt.includes(tableName));
   ```

## ✅ Summary

**Problem:** Generic update function tried to set `updated_at` on all tables, but `doses` table doesn't have this column.

**Solution:** Added conditional logic to only include `updated_at` for tables that have this column.

**Result:** 
- ✅ Dose updates now work correctly
- ✅ Take/Skip actions work properly
- ✅ History status changes work
- ✅ All other updates still work
- ✅ No schema changes needed

The medicine tracking app now works perfectly! 🎉

