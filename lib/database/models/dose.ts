import { Dose } from "../../../types/database";
import { DoseWithMedicine } from "../../../types/medicine";
import {
  deleteRecord,
  executeQuery,
  executeQueryFirst,
  findById,
  getCurrentTimestamp,
  insert,
  update,
} from "../operations";

const TABLE_NAME = "doses";

export const createDose = async (
  doseData: Omit<Dose, "id" | "created_at">
): Promise<string> => {
  return await insert<Dose>(TABLE_NAME, doseData);
};

export const updateDose = async (
  id: string,
  doseData: Partial<Dose>
): Promise<void> => {
  await update<Dose>(TABLE_NAME, id, doseData);
};

export const deleteDose = async (id: string): Promise<void> => {
  await deleteRecord(TABLE_NAME, id);
};

export const getDoseById = async (id: string): Promise<Dose | null> => {
  return await findById<Dose>(TABLE_NAME, id);
};

export const getDosesByMedicineId = async (
  medicineId: string,
  limit?: number
): Promise<Dose[]> => {
  let query = `SELECT * FROM ${TABLE_NAME} WHERE medicine_id = ? ORDER BY scheduled_time DESC`;
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  return await executeQuery<Dose>(query, [medicineId]);
};

export const getDosesByScheduleId = async (
  scheduleId: string
): Promise<Dose[]> => {
  return await executeQuery<Dose>(
    `SELECT * FROM ${TABLE_NAME} WHERE schedule_id = ? ORDER BY scheduled_time DESC`,
    [scheduleId]
  );
};

export const getUpcomingDoses = async (
  userId: string,
  hours: number = 24
): Promise<DoseWithMedicine[]> => {
  const now = getCurrentTimestamp();
  const future = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

  return await executeQuery<DoseWithMedicine>(
    `SELECT 
      d.*,
      json_object(
        'id', m.id,
        'name', m.name,
        'type', m.type,
        'dosage', m.dosage,
        'unit', m.unit,
        'color', m.color
      ) as medicine
     FROM ${TABLE_NAME} d
     JOIN medicines m ON d.medicine_id = m.id
     WHERE m.user_id = ? 
       AND d.scheduled_time >= ? 
       AND d.scheduled_time <= ?
       AND d.status = 'scheduled'
       AND m.is_active = 1
     ORDER BY d.scheduled_time ASC`,
    [userId, now, future]
  ).then((doses) =>
    doses.map((d) => ({
      ...d,
      medicine: JSON.parse(d.medicine as any),
    }))
  );
};

export const getTodayDoses = async (
  userId: string
): Promise<DoseWithMedicine[]> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return await executeQuery<DoseWithMedicine>(
    `SELECT 
      d.*,
      json_object(
        'id', m.id,
        'name', m.name,
        'type', m.type,
        'dosage', m.dosage,
        'unit', m.unit,
        'color', m.color
      ) as medicine
     FROM ${TABLE_NAME} d
     JOIN medicines m ON d.medicine_id = m.id
     WHERE m.user_id = ? 
       AND d.scheduled_time >= ? 
       AND d.scheduled_time <= ?
       AND m.is_active = 1
     ORDER BY d.scheduled_time ASC`,
    [userId, startOfDay.toISOString(), endOfDay.toISOString()]
  ).then((doses) =>
    doses.map((d) => ({
      ...d,
      medicine: JSON.parse(d.medicine as any),
    }))
  );
};

export const markDoseAsTaken = async (
  id: string,
  notes?: string
): Promise<void> => {
  await update<Dose>(TABLE_NAME, id, {
    status: "taken",
    taken_time: getCurrentTimestamp(),
    notes,
  });
};

export const markDoseAsSkipped = async (
  id: string,
  notes?: string
): Promise<void> => {
  await update<Dose>(TABLE_NAME, id, {
    status: "skipped",
    notes,
  });
};

export const markDoseAsMissed = async (id: string): Promise<void> => {
  await update<Dose>(TABLE_NAME, id, {
    status: "missed",
  });
};

export const updateMissedDoses = async (): Promise<void> => {
  const now = getCurrentTimestamp();
  await executeQuery(
    `UPDATE ${TABLE_NAME} 
     SET status = 'missed' 
     WHERE status = 'scheduled' 
       AND scheduled_time < ?`,
    [now]
  );
};

export const getDoseStats = async (
  userId: string,
  startDate: string,
  endDate: string
) => {
  const result = await executeQueryFirst<{
    total: number;
    taken: number;
    missed: number;
    skipped: number;
  }>(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN d.status = 'taken' THEN 1 ELSE 0 END) as taken,
      SUM(CASE WHEN d.status = 'missed' THEN 1 ELSE 0 END) as missed,
      SUM(CASE WHEN d.status = 'skipped' THEN 1 ELSE 0 END) as skipped
     FROM ${TABLE_NAME} d
     JOIN medicines m ON d.medicine_id = m.id
     WHERE m.user_id = ? 
       AND d.scheduled_time >= ? 
       AND d.scheduled_time <= ?`,
    [userId, startDate, endDate]
  );

  return result || { total: 0, taken: 0, missed: 0, skipped: 0 };
};

export const deleteDosesByMedicineId = async (
  medicineId: string
): Promise<void> => {
  await executeQuery(`DELETE FROM ${TABLE_NAME} WHERE medicine_id = ?`, [
    medicineId,
  ]);
};

export const deleteDosesByScheduleId = async (
  scheduleId: string
): Promise<void> => {
  await executeQuery(`DELETE FROM ${TABLE_NAME} WHERE schedule_id = ?`, [
    scheduleId,
  ]);
};

export const getRecentDoseActivity = async (
  userId: string,
  limit: number = 5
): Promise<DoseWithMedicine[]> => {
  return await executeQuery<DoseWithMedicine>(
    `SELECT 
      d.*,
      json_object(
        'id', m.id,
        'name', m.name,
        'type', m.type,
        'dosage', m.dosage,
        'unit', m.unit,
        'color', m.color
      ) as medicine
     FROM ${TABLE_NAME} d
     JOIN medicines m ON d.medicine_id = m.id
     WHERE m.user_id = ? 
       AND d.status != 'scheduled'
     ORDER BY d.taken_time DESC, d.scheduled_time DESC
     LIMIT ?`,
    [userId, limit]
  ).then((doses) =>
    doses.map((d) => ({
      ...d,
      medicine: JSON.parse(d.medicine as any),
    }))
  );
};
