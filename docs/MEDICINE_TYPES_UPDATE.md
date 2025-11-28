# Medicine Types Update - Database Migration

## Problem
The database had a CHECK constraint that only allowed 6 medicine types: `pill`, `liquid`, `injection`, `inhaler`, `drops`, `other`. When trying to add new medicine types, the database would reject them.

## Solution
Created a database migration (version 2) that updates the CHECK constraint to support 20 medicine types.

## Changes Made

### 1. Updated Medicine Types (app/(tabs)/medicines/add.tsx)
Added 14 new medicine types:
- **tablet** - More specific than pill
- **capsule** - Distinct from tablet
- **syrup** - Distinct from general liquid
- **eye_drops** - More specific than drops
- **ear_drops** - More specific than drops
- **nasal_spray** - For nasal medications
- **cream** - Topical application
- **ointment** - Topical application
- **gel** - Topical application
- **patch** - Transdermal medications
- **suppository** - Rectal/vaginal medications
- **powder** - For reconstitution or topical use
- **lozenge** - Throat medications
- **spray** - General spray medications

### 2. Added Icons (components/medicine/MedicineTypeIcon.tsx)
Mapped all 20 medicine types to appropriate Ionicons:
- pill → `medical`
- tablet → `tablet-portrait`
- capsule → `ellipse`
- liquid → `water`
- syrup → `flask`
- injection → `fitness`
- inhaler → `cloud`
- drops → `water-outline`
- eye_drops → `eye`
- ear_drops → `ear`
- nasal_spray → `nose`
- cream/ointment/gel → `hand-left`
- patch → `bandage`
- suppository → `medical-outline`
- powder → `snow`
- lozenge → `ellipse-outline`
- spray → `water-sharp`
- other → `medical-outline`

### 3. Database Schema Update (lib/database/schema.ts)
- Updated `DATABASE_VERSION` from 1 to 2
- Modified the medicines table CHECK constraint to include all 20 types
- Created migration v2 that:
  - Creates a new medicines table with updated constraint
  - Copies all existing data
  - Drops the old table
  - Renames the new table
  - Recreates indexes

## How It Works

The migration runs automatically when the app starts:
1. `initDatabase()` is called (in lib/database/operations.ts)
2. `runMigrations()` checks the current database version
3. If version < 2, it runs the migration
4. The migration recreates the medicines table with the new constraint
5. All existing medicine data is preserved
6. Database version is updated to 2

## Testing

To test the fix:
1. **Restart the app** - This will trigger the migration
2. Try adding a medicine with one of the new types (e.g., "tablet", "capsule", "syrup")
3. The medicine should save successfully
4. The appropriate icon should display

## Notes

- **SQLite limitation**: SQLite doesn't support ALTER TABLE to modify CHECK constraints, so we had to recreate the table
- **Data safety**: The migration copies all existing data before dropping the old table
- **Backward compatibility**: Existing medicines with old types (pill, liquid, etc.) continue to work
- **One-time operation**: The migration only runs once per database

