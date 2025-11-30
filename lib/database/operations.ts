import * as SQLite from "expo-sqlite";
import { ensureUserProfileColumns } from "./force-migration";
import {
  DATABASE_NAME,
  createTables,
  getCurrentVersion,
  runMigrations,
} from "./schema";

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;
let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const initDatabase = async (
  retryCount: number = 0
): Promise<SQLite.SQLiteDatabase> => {
  // If already initialized, return the instance
  if (dbInstance) {
    console.log("Database already initialized, reusing instance");
    return dbInstance;
  }

  // If currently initializing, wait for that to complete
  if (isInitializing && initializationPromise) {
    console.log("Database initialization in progress, waiting...");
    return initializationPromise;
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Mark as initializing
  isInitializing = true;

  initializationPromise = (async () => {
    try {
      console.log(
        `Initializing database (attempt ${retryCount + 1}/${
          MAX_RETRIES + 1
        })...`
      );

      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Create tables
      await createTables(db);

      // Get version before migrations
      const versionBefore = await getCurrentVersion(db);

      // Run migrations (this will also set the version)
      await runMigrations(db);

      // Get version after migrations
      const versionAfter = await getCurrentVersion(db);

      // Only force ensure columns if migration just ran or version is less than 4
      if (versionBefore < 4 || versionAfter < 4) {
        console.log("Ensuring user profile columns exist...");
        await ensureUserProfileColumns(db);
      }

      dbInstance = db;
      isInitializing = false;
      console.log("Database initialized successfully");
      return db;
    } catch (error) {
      console.error(
        `Error initializing database (attempt ${retryCount + 1}):`,
        error
      );

      // If we haven't exceeded max retries, try again
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying database initialization in ${RETRY_DELAY}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        isInitializing = false;
        initializationPromise = null;
        return initDatabase(retryCount + 1);
      }

      // If all retries failed, reset and throw the error
      isInitializing = false;
      initializationPromise = null;
      console.error("Failed to initialize database after all retries");
      throw error;
    }
  })();

  return initializationPromise;
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // If not initialized, initialize it
  if (!dbInstance) {
    console.log("Database not initialized, initializing now...");
    return await initDatabase();
  }

  // Return the cached instance
  return dbInstance;
};

export const closeDatabase = async () => {
  if (dbInstance) {
    try {
      await dbInstance.closeAsync();
    } catch (error) {
      console.error("Error closing database:", error);
    } finally {
      dbInstance = null;
    }
  }
};

export const resetDatabase = async (): Promise<void> => {
  console.log("Resetting database instance...");
  await closeDatabase();
  dbInstance = null;
};

// Generic CRUD operations
export const executeQuery = async <T>(
  query: string,
  params: any[] = []
): Promise<T[]> => {
  const db = await getDatabase();
  try {
    const result = await db.getAllAsync<T>(query, params);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

export const executeQueryFirst = async <T>(
  query: string,
  params: any[] = []
): Promise<T | null> => {
  const db = await getDatabase();
  try {
    const result = await db.getFirstAsync<T>(query, params);
    return result || null;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

export const executeUpdate = async (
  query: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  try {
    const result = await db.runAsync(query, params);
    return result;
  } catch (error) {
    console.error("Error executing update:", error);
    throw error;
  }
};

export const executeTransaction = async <T>(
  callback: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> => {
  const db = await getDatabase();
  try {
    let result: T;
    await db.withTransactionAsync(async () => {
      result = await callback(db);
    });
    return result!;
  } catch (error) {
    console.error("Error executing transaction:", error);
    throw error;
  }
};

// Helper function to generate UUID
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper function to get current ISO timestamp
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

// Generic insert function
export const insert = async <T extends Record<string, any>>(
  table: string,
  data: Omit<T, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
): Promise<string> => {
  const id = data.id || generateUUID();
  const created_at = data.created_at || getCurrentTimestamp();

  // Only add updated_at for tables that have this column
  const tablesWithUpdatedAt = [
    "users",
    "medicines",
    "schedules",
    "notification_settings",
  ];
  const shouldAddUpdatedAt = tablesWithUpdatedAt.includes(table);

  const fullData = shouldAddUpdatedAt
    ? { ...data, id, created_at, updated_at: data.updated_at || getCurrentTimestamp() }
    : { ...data, id, created_at };

  const columns = Object.keys(fullData);
  const placeholders = columns.map(() => "?").join(", ");
  const values = columns.map((col) => fullData[col]);

  const query = `INSERT INTO ${table} (${columns.join(
    ", "
  )}) VALUES (${placeholders})`;

  try {
    await executeUpdate(query, values);
    return id;
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    console.error(`Query: ${query}`);
    console.error(`Values:`, values);
    throw error;
  }
};

// Generic update function
export const update = async <T extends Record<string, any>>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  // Filter out undefined values and convert them to null
  const cleanedData: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    const value = data[key];
    // Only include defined values or explicitly set null
    if (value !== undefined) {
      cleanedData[key] = value === "" ? null : value;
    }
  });

  // If no data to update, return early
  if (Object.keys(cleanedData).length === 0) {
    console.warn(`No data to update for ${table} with id ${id}`);
    return;
  }

  // Only add updated_at for tables that have this column
  const tablesWithUpdatedAt = [
    "users",
    "medicines",
    "schedules",
    "notification_settings",
  ];
  const shouldAddUpdatedAt = tablesWithUpdatedAt.includes(table);

  const fullData = shouldAddUpdatedAt
    ? { ...cleanedData, updated_at: getCurrentTimestamp() }
    : { ...cleanedData };

  const columns = Object.keys(fullData);
  const setClause = columns.map((col) => `${col} = ?`).join(", ");
  const values = [...columns.map((col) => (fullData as any)[col]), id];

  const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

  try {
    await executeUpdate(query, values);
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    console.error(`Query: ${query}`);
    console.error(`Values:`, values);
    throw error;
  }
};

// Generic delete function
export const deleteRecord = async (
  table: string,
  id: string
): Promise<void> => {
  const query = `DELETE FROM ${table} WHERE id = ?`;
  await executeUpdate(query, [id]);
};

// Generic find by id function
export const findById = async <T>(
  table: string,
  id: string
): Promise<T | null> => {
  const query = `SELECT * FROM ${table} WHERE id = ?`;
  return await executeQueryFirst<T>(query, [id]);
};

// Generic find all function
export const findAll = async <T>(
  table: string,
  where?: string,
  params?: any[],
  orderBy?: string
): Promise<T[]> => {
  let query = `SELECT * FROM ${table}`;

  if (where) {
    query += ` WHERE ${where}`;
  }

  if (orderBy) {
    query += ` ORDER BY ${orderBy}`;
  }

  return await executeQuery<T>(query, params || []);
};
