import { Medicine } from "../../../types/database";
import {
  MedicineWithNextDose,
  MedicineWithSchedules,
} from "../../../types/medicine";
import {
  deleteRecord,
  executeQuery,
  executeQueryFirst,
  findAll,
  findById,
  getCurrentTimestamp,
  insert,
  update,
} from "../operations";
import { getSchedulesByMedicineId } from "./schedule";

const TABLE_NAME = "medicines";

export const createMedicine = async (
  medicineData: Omit<Medicine, "id" | "created_at" | "updated_at" | "sync_flag">
): Promise<string> => {
  return await insert<Medicine>(TABLE_NAME, { ...medicineData, sync_flag: 0 });
};

export const updateMedicine = async (
  id: string,
  medicineData: Partial<Medicine>
): Promise<void> => {
  await update<Medicine>(TABLE_NAME, id, { ...medicineData, sync_flag: 1 });
};

export const deleteMedicine = async (id: string): Promise<void> => {
  await deleteRecord(TABLE_NAME, id);
};

export const getMedicineById = async (id: string): Promise<Medicine | null> => {
  return await findById<Medicine>(TABLE_NAME, id);
};

export const getMedicineWithSchedules = async (
  id: string
): Promise<MedicineWithSchedules | null> => {
  const medicine = await getMedicineById(id);
  if (!medicine) return null;

  const schedules = await getSchedulesByMedicineId(id);

  return {
    ...medicine,
    schedules,
  };
};

export const getAllMedicines = async (userId: string): Promise<Medicine[]> => {
  return await findAll<Medicine>(
    TABLE_NAME,
    "user_id = ?",
    [userId],
    "created_at DESC"
  );
};

export const getActiveMedicines = async (
  userId: string
): Promise<Medicine[]> => {
  return await findAll<Medicine>(
    TABLE_NAME,
    "user_id = ? AND is_active = 1",
    [userId],
    "name ASC"
  );
};

export const getMedicinesByType = async (
  userId: string,
  type: string
): Promise<Medicine[]> => {
  return await findAll<Medicine>(
    TABLE_NAME,
    "user_id = ? AND type = ? AND is_active = 1",
    [userId, type],
    "name ASC"
  );
};

export const searchMedicines = async (
  userId: string,
  searchTerm: string
): Promise<Medicine[]> => {
  return await executeQuery<Medicine>(
    `SELECT * FROM ${TABLE_NAME} 
     WHERE user_id = ? AND name LIKE ? 
     ORDER BY name ASC`,
    [userId, `%${searchTerm}%`]
  );
};

export const getActiveMedicinesWithNextDose = async (
  userId: string
): Promise<MedicineWithNextDose[]> => {
  const now = getCurrentTimestamp();

  const medicines = await executeQuery<MedicineWithNextDose>(
    `SELECT 
      m.*,
      (
        SELECT json_object(
          'schedule_id', s.id,
          'scheduled_time', d.scheduled_time,
          'time', s.time
        )
        FROM schedules s
        JOIN doses d ON d.schedule_id = s.id
        WHERE s.medicine_id = m.id 
          AND s.is_active = 1
          AND d.scheduled_time >= ?
          AND d.status = 'scheduled'
        ORDER BY d.scheduled_time ASC
        LIMIT 1
      ) as nextDose
     FROM ${TABLE_NAME} m
     WHERE m.user_id = ? AND m.is_active = 1
     ORDER BY m.name ASC`,
    [now, userId]
  );

  return medicines.map((m) => ({
    ...m,
    nextDose: m.nextDose ? JSON.parse(m.nextDose as any) : undefined,
  }));
};

export const deactivateMedicine = async (id: string): Promise<void> => {
  await update<Medicine>(TABLE_NAME, id, { is_active: false });
};

export const activateMedicine = async (id: string): Promise<void> => {
  await update<Medicine>(TABLE_NAME, id, { is_active: true });
};

export const getMedicineCount = async (userId: string): Promise<number> => {
  const result = await executeQueryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE user_id = ?`,
    [userId]
  );
  return result?.count || 0;
};

export const getActiveMedicineCount = async (
  userId: string
): Promise<number> => {
  const result = await executeQueryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE user_id = ? AND is_active = 1`,
    [userId]
  );
  return result?.count || 0;
};
