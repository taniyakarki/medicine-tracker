import * as SQLite from "expo-sqlite";
import {
  DATABASE_NAME,
  DATABASE_VERSION,
  createTables,
  runMigrations,
  setVersion,
} from "./schema";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    // Create tables
    await createTables(db);

    // Run migrations
    await runMigrations(db);

    // Set current version
    await setVersion(db, DATABASE_VERSION);

    dbInstance = db;
    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbInstance) {
    return await initDatabase();
  }
  return dbInstance;
};

export const closeDatabase = async () => {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
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
  data: Omit<T, "id" | "created_at"> & { id?: string; created_at?: string }
): Promise<string> => {
  const id = data.id || generateUUID();
  const created_at = data.created_at || getCurrentTimestamp();

  const fullData = { ...data, id, created_at };
  const columns = Object.keys(fullData);
  const placeholders = columns.map(() => "?").join(", ");
  const values = columns.map((col) => fullData[col]);

  const query = `INSERT INTO ${table} (${columns.join(
    ", "
  )}) VALUES (${placeholders})`;

  await executeUpdate(query, values);
  return id;
};

// Generic update function
export const update = async <T extends Record<string, any>>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  // Only add updated_at for tables that have this column
  const tablesWithUpdatedAt = ['users', 'medicines', 'schedules', 'notification_settings'];
  const shouldAddUpdatedAt = tablesWithUpdatedAt.includes(table);
  
  const fullData = shouldAddUpdatedAt 
    ? { ...data, updated_at: getCurrentTimestamp() }
    : { ...data };

  const columns = Object.keys(fullData);
  const setClause = columns.map((col) => `${col} = ?`).join(", ");
  const values = [...columns.map((col) => fullData[col]), id];

  const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

  await executeUpdate(query, values);
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
