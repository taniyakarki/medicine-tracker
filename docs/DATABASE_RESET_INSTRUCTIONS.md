# Database Reset Instructions

## If You're Getting "No Column Found" Errors

The migration should run automatically, but if you're still getting errors about missing columns (like `date_of_birth`), you can force a fresh database:

---

## Option 1: Clear App Data (Recommended)

### On iOS Simulator
1. Stop the app
2. Reset the simulator: `Device` → `Erase All Content and Settings`
3. Restart the app

### On Android Emulator
1. Stop the app
2. Go to Settings → Apps → Medicine Tracker
3. Tap "Storage" → "Clear Data"
4. Restart the app

### On Physical Device (iOS)
1. Delete the app
2. Reinstall from Xcode/TestFlight
3. Fresh database will be created

### On Physical Device (Android)
1. Go to Settings → Apps → Medicine Tracker
2. Tap "Storage" → "Clear Data"
3. Restart the app

---

## Option 2: Delete Database File Manually

### Using Expo CLI

```bash
# Stop the app first
npx expo start --clear

# Or clear cache
npx expo start -c
```

---

## Option 3: Force Migration in Code (Temporary)

Add this to your app temporarily to force re-run migrations:

**File:** `app/_layout.tsx`

```typescript
// Add this import at the top
import { getDatabase } from "../lib/database/operations";

// Add this in initializeApp function, before initDatabase()
const forceResetDB = async () => {
  try {
    const db = await getDatabase();
    // Force version to 0 to re-run all migrations
    await db.execAsync('PRAGMA user_version = 0');
    console.log('Database version reset to 0');
  } catch (e) {
    console.log('Could not reset version:', e);
  }
};

// Call it before initDatabase
await forceResetDB();
await initDatabase();
```

**Remember to remove this code after the migration runs!**

---

## What the Migration Does

When the app starts, it will:

1. Check current database version
2. See that version is < 3
3. Run migration v3
4. Add these columns to users table:
   - `date_of_birth`
   - `gender`
   - `address`
   - `blood_type`
   - `allergies`
   - `medical_conditions`
5. Update version to 3

---

## Verify Migration Ran

Check the console logs when the app starts. You should see:

```
Current database version: 2
Running migration to version 3
Final database version: 3
Database initialized successfully
```

---

## If Nothing Works

As a last resort, you can manually add the columns:

**Create file:** `scripts/manual-migration.sql`

```sql
-- Run these SQL commands manually if needed
ALTER TABLE users ADD COLUMN date_of_birth TEXT;
ALTER TABLE users ADD COLUMN gender TEXT;
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN blood_type TEXT;
ALTER TABLE users ADD COLUMN allergies TEXT;
ALTER TABLE users ADD COLUMN medical_conditions TEXT;
```

Then use a SQLite browser tool to run these commands on your database file.

---

## Database Location

### iOS Simulator
```
~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Library/LocalDatabase/medicine_tracker.db
```

### Android Emulator
```
/data/data/[PACKAGE_NAME]/databases/medicine_tracker.db
```

---

## Prevention

The migration system is now more robust and will:
- ✅ Log current and final versions
- ✅ Handle columns that already exist
- ✅ Set version correctly
- ✅ Run automatically on app start

Future updates should work seamlessly!

---

**Need Help?**

Check the console logs for migration messages. If you see errors, they will help diagnose the issue.

