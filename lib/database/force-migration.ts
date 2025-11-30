import * as SQLite from "expo-sqlite";

/**
 * Force add user profile columns if they don't exist
 * This is a safety measure to ensure columns are present
 * Only runs when needed (version < 3)
 */
export const ensureUserProfileColumns = async (
  db: SQLite.SQLiteDatabase
): Promise<void> => {
  const columns = [
    "date_of_birth",
    "gender",
    "address",
    "blood_type",
    "allergies",
    "medical_conditions",
    "theme_preference",
  ];

  let addedCount = 0;
  let existingCount = 0;

  for (const column of columns) {
    try {
      // Try to add the column
      await db.execAsync(`ALTER TABLE users ADD COLUMN ${column} TEXT;`);
      console.log(`✅ Added column: ${column}`);
      addedCount++;
    } catch (error) {
      // Column likely already exists, which is fine
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("duplicate column")) {
        existingCount++;
      } else {
        console.log(`⚠️ Could not add column ${column}:`, errorMessage);
      }
    }
  }

  if (addedCount > 0) {
    console.log(`✅ Added ${addedCount} new column(s) to users table`);
  }
  if (existingCount === columns.length) {
    console.log(`✓ All user profile columns already exist`);
  }
};

/**
 * Check if a column exists in a table
 */
export const columnExists = async (
  db: SQLite.SQLiteDatabase,
  tableName: string,
  columnName: string
): Promise<boolean> => {
  try {
    const allColumns = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${tableName})`
    );

    return allColumns.some((col) => col.name === columnName);
  } catch (error) {
    console.error(`Error checking column ${columnName}:`, error);
    return false;
  }
};
