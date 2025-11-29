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
  // Use a subquery to get unique doses by medicine_id and scheduled_time
  // This prevents duplicates while allowing multiple schedules per medicine
  let query = `
    SELECT d.*
    FROM ${TABLE_NAME} d
    INNER JOIN (
      SELECT medicine_id, scheduled_time, MIN(id) as min_id
      FROM ${TABLE_NAME}
      WHERE medicine_id = ?
      GROUP BY medicine_id, scheduled_time
    ) unique_doses
    ON d.id = unique_doses.min_id
    ORDER BY d.scheduled_time DESC`;
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
  const now = new Date().toISOString();
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
       AND d.scheduled_time > ? 
       AND d.scheduled_time <= ?
       AND d.status = 'scheduled'
       AND m.is_active = 1
     GROUP BY d.medicine_id, d.scheduled_time
     HAVING d.id = MIN(d.id)
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
     GROUP BY d.medicine_id, d.scheduled_time
     HAVING d.id = MIN(d.id)
     ORDER BY d.scheduled_time ASC`,
    [userId, startOfDay.toISOString(), endOfDay.toISOString()]
  ).then((doses) =>
    doses.map((d) => ({
      ...d,
      medicine: JSON.parse(d.medicine as any),
    }))
  );
};

export const getDosesInDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
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
       AND d.scheduled_time >= ? 
       AND d.scheduled_time <= ?
     GROUP BY d.medicine_id, d.scheduled_time
     HAVING d.id = MIN(d.id)
       AND m.is_active = 1
     ORDER BY d.scheduled_time DESC`,
    [userId, startDate, endDate]
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
      SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken,
      SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed,
      SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped
     FROM (
       SELECT d.status, d.medicine_id, d.scheduled_time
       FROM ${TABLE_NAME} d
       JOIN medicines m ON d.medicine_id = m.id
       WHERE m.user_id = ? 
         AND d.scheduled_time >= ? 
         AND d.scheduled_time <= ?
         AND m.is_active = 1
       GROUP BY d.medicine_id, d.scheduled_time
       HAVING d.id = MIN(d.id)
     ) as unique_doses`,
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

export const getPastPendingDoses = async (
  userId: string,
  hours: number = 24
): Promise<DoseWithMedicine[]> => {
  const now = new Date().toISOString();
  const past = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

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
       AND d.scheduled_time < ?
       AND (d.status = 'scheduled' OR d.status = 'missed')
       AND m.is_active = 1
     GROUP BY d.medicine_id, d.scheduled_time
     HAVING d.id = MIN(d.id)
     ORDER BY d.scheduled_time DESC`,
    [userId, past, now]
  ).then((doses) =>
    doses.map((d) => ({
      ...d,
      medicine: JSON.parse(d.medicine as any),
    }))
  );
};

/**
 * Remove duplicate doses that have the same medicine_id and scheduled_time
 * Keeps the oldest dose (MIN id) and deletes the rest
 */
export const removeDuplicateDoses = async (): Promise<number> => {
  const result = await executeQuery(
    `DELETE FROM ${TABLE_NAME}
     WHERE id NOT IN (
       SELECT MIN(id)
       FROM ${TABLE_NAME}
       GROUP BY medicine_id, scheduled_time
     )`
  );

  // Return the number of deleted rows
  return result.changes || 0;
};

/**
 * Calculate the current streak of consecutive days without missed doses
 * A streak is broken if any dose was missed on a day
 * Days with no scheduled doses don't break the streak
 */
export const calculateStreak = async (userId: string): Promise<number> => {
  // Get all doses for the user, grouped by day
  const doses = await executeQuery<{
    date: string;
    total: number;
    missed: number;
  }>(
    `SELECT 
      DATE(d.scheduled_time) as date,
      COUNT(*) as total,
      SUM(CASE WHEN d.status = 'missed' THEN 1 ELSE 0 END) as missed
     FROM (
       SELECT d.scheduled_time, d.status, d.medicine_id
       FROM ${TABLE_NAME} d
       JOIN medicines m ON d.medicine_id = m.id
       WHERE m.user_id = ? 
         AND d.scheduled_time <= ?
         AND m.is_active = 1
       GROUP BY d.medicine_id, d.scheduled_time
       HAVING d.id = MIN(d.id)
     ) d
     GROUP BY DATE(d.scheduled_time)
     ORDER BY date DESC`,
    [userId, getCurrentTimestamp()]
  );

  if (doses.length === 0) {
    return 0;
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < doses.length; i++) {
    const dose = doses[i];
    const doseDate = new Date(dose.date);
    doseDate.setHours(0, 0, 0, 0);

    // Calculate expected date for this position in streak
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    // If there's a gap in dates, streak is broken
    if (doseDate.getTime() !== expectedDate.getTime()) {
      break;
    }

    // If any dose was missed on this day, streak is broken
    if (dose.missed > 0) {
      break;
    }

    streak++;
  }

  return streak;
};

/**
 * Get calendar data for a specific month
 * Returns adherence data for each day
 */
export const getCalendarMonthData = async (
  userId: string,
  year: number,
  month: number // 0-11 (January = 0)
): Promise<
  Array<{
    date: string;
    total: number;
    taken: number;
    missed: number;
    skipped: number;
  }>
> => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return await executeQuery<{
    date: string;
    total: number;
    taken: number;
    missed: number;
    skipped: number;
  }>(
    `SELECT 
      DATE(d.scheduled_time) as date,
      COUNT(*) as total,
      SUM(CASE WHEN d.status = 'taken' THEN 1 ELSE 0 END) as taken,
      SUM(CASE WHEN d.status = 'missed' THEN 1 ELSE 0 END) as missed,
      SUM(CASE WHEN d.status = 'skipped' THEN 1 ELSE 0 END) as skipped
     FROM (
       SELECT d.scheduled_time, d.status, d.medicine_id
       FROM ${TABLE_NAME} d
       JOIN medicines m ON d.medicine_id = m.id
       WHERE m.user_id = ? 
         AND d.scheduled_time >= ? 
         AND d.scheduled_time <= ?
         AND m.is_active = 1
       GROUP BY d.medicine_id, d.scheduled_time
       HAVING d.id = MIN(d.id)
     ) d
     GROUP BY DATE(d.scheduled_time)
     ORDER BY date ASC`,
    [userId, startDate.toISOString(), endDate.toISOString()]
  );
};
