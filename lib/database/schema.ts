import * as SQLite from "expo-sqlite";

export const DATABASE_NAME = "medicine_tracker.db";
export const DATABASE_VERSION = 3;

export const createTables = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      address TEXT,
      blood_type TEXT,
      allergies TEXT,
      medical_conditions TEXT,
      profile_image TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Medicines table
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('pill', 'tablet', 'capsule', 'liquid', 'syrup', 'injection', 'inhaler', 'drops', 'eye_drops', 'ear_drops', 'nasal_spray', 'cream', 'ointment', 'gel', 'patch', 'suppository', 'powder', 'lozenge', 'spray', 'other')),
      dosage TEXT NOT NULL,
      unit TEXT NOT NULL,
      frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'specific_days', 'interval')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      notes TEXT,
      image TEXT,
      color TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_flag INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Schedules table
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY NOT NULL,
      medicine_id TEXT NOT NULL,
      time TEXT NOT NULL,
      days_of_week TEXT,
      interval_hours INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
    );

    -- Doses table
    CREATE TABLE IF NOT EXISTS doses (
      id TEXT PRIMARY KEY NOT NULL,
      medicine_id TEXT NOT NULL,
      schedule_id TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      taken_time TEXT,
      status TEXT NOT NULL CHECK(status IN ('scheduled', 'taken', 'missed', 'skipped')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
      FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
    );

    -- Medicine groups table
    CREATE TABLE IF NOT EXISTS medicine_groups (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Medicine group members table
    CREATE TABLE IF NOT EXISTS medicine_group_members (
      id TEXT PRIMARY KEY NOT NULL,
      group_id TEXT NOT NULL,
      medicine_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES medicine_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
      UNIQUE(group_id, medicine_id)
    );

    -- Emergency contacts table
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Shared users table (for future sharing feature)
    CREATE TABLE IF NOT EXISTS shared_users (
      id TEXT PRIMARY KEY NOT NULL,
      medicine_id TEXT NOT NULL,
      shared_with_user TEXT NOT NULL,
      permissions TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
    );

    -- Notification settings table
    CREATE TABLE IF NOT EXISTS notification_settings (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      sound TEXT NOT NULL DEFAULT 'default',
      vibration INTEGER NOT NULL DEFAULT 1,
      full_screen_enabled INTEGER NOT NULL DEFAULT 1,
      remind_before_minutes INTEGER NOT NULL DEFAULT 0,
      remind_after_missed_minutes INTEGER NOT NULL DEFAULT 15,
      snooze_duration_minutes INTEGER NOT NULL DEFAULT 10,
      dnd_enabled INTEGER NOT NULL DEFAULT 0,
      dnd_start_time TEXT,
      dnd_end_time TEXT,
      dnd_allow_critical INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
    CREATE INDEX IF NOT EXISTS idx_medicines_is_active ON medicines(is_active);
    CREATE INDEX IF NOT EXISTS idx_schedules_medicine_id ON schedules(medicine_id);
    CREATE INDEX IF NOT EXISTS idx_doses_medicine_id ON doses(medicine_id);
    CREATE INDEX IF NOT EXISTS idx_doses_scheduled_time ON doses(scheduled_time);
    CREATE INDEX IF NOT EXISTS idx_doses_status ON doses(status);
    CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
  `);
};

export const dropTables = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    DROP TABLE IF EXISTS notification_settings;
    DROP TABLE IF EXISTS shared_users;
    DROP TABLE IF EXISTS emergency_contacts;
    DROP TABLE IF EXISTS medicine_group_members;
    DROP TABLE IF EXISTS medicine_groups;
    DROP TABLE IF EXISTS doses;
    DROP TABLE IF EXISTS schedules;
    DROP TABLE IF EXISTS medicines;
    DROP TABLE IF EXISTS users;
  `);
};

// Migration system for future updates
export interface Migration {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 2,
    up: async (db) => {
      // SQLite doesn't support modifying CHECK constraints directly
      // We need to recreate the table with the new constraint
      await db.execAsync(`
        -- Create new medicines table with updated type constraint
        CREATE TABLE IF NOT EXISTS medicines_new (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('pill', 'tablet', 'capsule', 'liquid', 'syrup', 'injection', 'inhaler', 'drops', 'eye_drops', 'ear_drops', 'nasal_spray', 'cream', 'ointment', 'gel', 'patch', 'suppository', 'powder', 'lozenge', 'spray', 'other')),
          dosage TEXT NOT NULL,
          unit TEXT NOT NULL,
          frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'specific_days', 'interval')),
          start_date TEXT NOT NULL,
          end_date TEXT,
          notes TEXT,
          image TEXT,
          color TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          sync_flag INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Copy data from old table to new table
        INSERT INTO medicines_new SELECT * FROM medicines;

        -- Drop old table
        DROP TABLE medicines;

        -- Rename new table to original name
        ALTER TABLE medicines_new RENAME TO medicines;

        -- Recreate indexes
        CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
        CREATE INDEX IF NOT EXISTS idx_medicines_is_active ON medicines(is_active);
      `);
    },
    down: async (db) => {
      // Rollback to original constraint
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS medicines_new (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('pill', 'liquid', 'injection', 'inhaler', 'drops', 'other')),
          dosage TEXT NOT NULL,
          unit TEXT NOT NULL,
          frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'specific_days', 'interval')),
          start_date TEXT NOT NULL,
          end_date TEXT,
          notes TEXT,
          image TEXT,
          color TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          sync_flag INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        INSERT INTO medicines_new SELECT * FROM medicines;
        DROP TABLE medicines;
        ALTER TABLE medicines_new RENAME TO medicines;

        CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
        CREATE INDEX IF NOT EXISTS idx_medicines_is_active ON medicines(is_active);
      `);
    },
  },
  {
    version: 3,
    up: async (db) => {
      // Add new profile fields to users table
      // Use separate statements to handle if some columns already exist
      try {
        await db.execAsync(`ALTER TABLE users ADD COLUMN date_of_birth TEXT;`);
      } catch (e) {
        console.log("date_of_birth column may already exist");
      }

      try {
        await db.execAsync(`ALTER TABLE users ADD COLUMN gender TEXT;`);
      } catch (e) {
        console.log("gender column may already exist");
      }

      try {
        await db.execAsync(`ALTER TABLE users ADD COLUMN address TEXT;`);
      } catch (e) {
        console.log("address column may already exist");
      }

      try {
        await db.execAsync(`ALTER TABLE users ADD COLUMN blood_type TEXT;`);
      } catch (e) {
        console.log("blood_type column may already exist");
      }

      try {
        await db.execAsync(`ALTER TABLE users ADD COLUMN allergies TEXT;`);
      } catch (e) {
        console.log("allergies column may already exist");
      }

      try {
        await db.execAsync(
          `ALTER TABLE users ADD COLUMN medical_conditions TEXT;`
        );
      } catch (e) {
        console.log("medical_conditions column may already exist");
      }
    },
    down: async (db) => {
      // SQLite doesn't support DROP COLUMN directly
      // We need to recreate the table without the new columns
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users_new (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          profile_image TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        INSERT INTO users_new (id, name, email, phone, profile_image, created_at, updated_at)
        SELECT id, name, email, phone, profile_image, created_at, updated_at FROM users;

        DROP TABLE users;
        ALTER TABLE users_new RENAME TO users;
      `);
    },
  },
];

export const getCurrentVersion = async (
  db: SQLite.SQLiteDatabase
): Promise<number> => {
  try {
    const result = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version"
    );
    return result?.user_version || 0;
  } catch (error) {
    return 0;
  }
};

export const setVersion = async (
  db: SQLite.SQLiteDatabase,
  version: number
) => {
  await db.execAsync(`PRAGMA user_version = ${version}`);
};

export const runMigrations = async (db: SQLite.SQLiteDatabase) => {
  const currentVersion = await getCurrentVersion(db);
  console.log(`Current database version: ${currentVersion}`);

  let hasRunMigrations = false;
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration to version ${migration.version}`);
      await migration.up(db);
      await setVersion(db, migration.version);
      hasRunMigrations = true;
    }
  }

  // If no migrations ran, ensure we're at the latest version
  if (!hasRunMigrations && currentVersion < DATABASE_VERSION) {
    console.log(`Setting database version to ${DATABASE_VERSION}`);
    await setVersion(db, DATABASE_VERSION);
  }

  const finalVersion = await getCurrentVersion(db);
  console.log(`Final database version: ${finalVersion}`);
};
