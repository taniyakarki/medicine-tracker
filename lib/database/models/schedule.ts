import { Schedule } from "../../../types/database";
import {
  deleteRecord,
  executeQuery,
  findAll,
  findById,
  insert,
  update,
} from "../operations";

const TABLE_NAME = "schedules";

export const createSchedule = async (
  scheduleData: Omit<Schedule, "id" | "created_at" | "updated_at">
): Promise<string> => {
  return await insert<Schedule>(TABLE_NAME, scheduleData);
};

export const updateSchedule = async (
  id: string,
  scheduleData: Partial<Schedule>
): Promise<void> => {
  await update<Schedule>(TABLE_NAME, id, scheduleData);
};

export const deleteSchedule = async (id: string): Promise<void> => {
  await deleteRecord(TABLE_NAME, id);
};

export const getScheduleById = async (id: string): Promise<Schedule | null> => {
  return await findById<Schedule>(TABLE_NAME, id);
};

export const getSchedulesByMedicineId = async (
  medicineId: string
): Promise<Schedule[]> => {
  return await findAll<Schedule>(
    TABLE_NAME,
    "medicine_id = ?",
    [medicineId],
    "time ASC"
  );
};

export const getActiveSchedulesByMedicineId = async (
  medicineId: string
): Promise<Schedule[]> => {
  return await findAll<Schedule>(
    TABLE_NAME,
    "medicine_id = ? AND is_active = 1",
    [medicineId],
    "time ASC"
  );
};

export const deleteSchedulesByMedicineId = async (
  medicineId: string
): Promise<void> => {
  await executeQuery(`DELETE FROM ${TABLE_NAME} WHERE medicine_id = ?`, [
    medicineId,
  ]);
};

export const deactivateSchedule = async (id: string): Promise<void> => {
  await update<Schedule>(TABLE_NAME, id, { is_active: false });
};

export const activateSchedule = async (id: string): Promise<void> => {
  await update<Schedule>(TABLE_NAME, id, { is_active: true });
};

export const getAllActiveSchedules = async (): Promise<Schedule[]> => {
  return await executeQuery<Schedule>(
    `SELECT s.* FROM ${TABLE_NAME} s
     JOIN medicines m ON s.medicine_id = m.id
     WHERE s.is_active = 1 AND m.is_active = 1
     ORDER BY s.time ASC`
  );
};
