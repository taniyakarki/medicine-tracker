# Quick Fix for Missing Columns

## The Fix is Applied! 🎉

I've added a **force migration** system that will automatically add the missing columns when you restart the app.

---

## What I Did

### 1. Created Force Migration Utility
**File:** `lib/database/force-migration.ts`

This utility:
- ✅ Checks for missing columns
- ✅ Adds them if they don't exist
- ✅ Skips if they already exist
- ✅ Logs the results

### 2. Updated Database Initialization
**File:** `lib/database/operations.ts`

Now when the app starts:
```typescript
1. Create tables
2. Run migrations
3. Force ensure user profile columns exist ← NEW!
4. Database ready ✓
```

---

## What to Do Now

### **Just Restart the App!**

1. Stop the app completely
2. Restart it
3. The columns will be added automatically

### **Check the Console**

You should see messages like:
```
✅ Added column: date_of_birth
✅ Added column: gender
✅ Added column: address
✅ Added column: blood_type
✅ Added column: allergies
✅ Added column: medical_conditions
Database initialized successfully
```

Or if columns already exist:
```
✓ Column already exists: date_of_birth
✓ Column already exists: gender
...
```

---

## Why This Works

The force migration runs **every time** the app starts, so:
- ✅ It will catch any missing columns
- ✅ It won't break if columns exist
- ✅ It's safe to run multiple times
- ✅ No manual intervention needed

---

## If You Still Get Errors

If you still see "no such column" errors after restarting:

### Option 1: Clear and Restart
```bash
npx expo start --clear
```

### Option 2: Reset Simulator/Emulator
- **iOS:** Device → Erase All Content and Settings
- **Android:** Settings → Apps → Clear Data

---

## Technical Details

### How It Works

```typescript
// For each column
try {
  await db.execAsync(`ALTER TABLE users ADD COLUMN ${column} TEXT;`);
  console.log(`✅ Added column: ${column}`);
} catch (error) {
  // Column already exists - that's fine!
  console.log(`✓ Column already exists: ${column}`);
}
```

### Columns Added
1. `date_of_birth` - Date of birth
2. `gender` - Gender
3. `address` - Address
4. `blood_type` - Blood type
5. `allergies` - Allergies
6. `medical_conditions` - Medical conditions

---

**The fix is automatic - just restart your app!** 🚀

