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
  // Get all active medicines
  const medicines = await getActiveMedicines(userId);

  // For each medicine, calculate the next dose based on schedules
  const medicinesWithNextDose = await Promise.all(
    medicines.map(async (medicine) => {
      const schedules = await getSchedulesByMedicineId(medicine.id);
      const nextDose = calculateNextDose(schedules);

      return {
        ...medicine,
        nextDose,
      };
    })
  );

  return medicinesWithNextDose;
};

export const getAllMedicinesWithNextDose = async (
  userId: string
): Promise<MedicineWithNextDose[]> => {
  // Get all medicines (active and inactive)
  const medicines = await getAllMedicines(userId);

  // For each medicine, calculate the next dose based on schedules
  const medicinesWithNextDose = await Promise.all(
    medicines.map(async (medicine) => {
      const schedules = await getSchedulesByMedicineId(medicine.id);
      const nextDose = medicine.is_active ? calculateNextDose(schedules) : undefined;

      return {
        ...medicine,
        nextDose,
      };
    })
  );

  return medicinesWithNextDose;
};

// Helper function to calculate next dose from schedules
const calculateNextDose = (
  schedules: any[]
): { schedule_id: string; scheduled_time: string; time: string } | undefined => {
  if (!schedules || schedules.length === 0) return undefined;

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  let nextDose: { schedule_id: string; scheduled_time: string; time: string } | undefined;
  let minDiff = Infinity;

  // Check each schedule
  for (const schedule of schedules) {
    if (!schedule.is_active) continue;

    if (schedule.interval_hours) {
      // For interval-based schedules
      try {
        const intervalHours = schedule.interval_hours;
        const startTime = schedule.start_time || schedule.time;
        
        if (!startTime) continue;
        
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        
        // Calculate the next dose based on interval
        const startDate = new Date(now);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        // If start time is in the past today, calculate next occurrence
        let nextIntervalDate = new Date(startDate);
        
        while (nextIntervalDate <= now) {
          nextIntervalDate = new Date(nextIntervalDate.getTime() + intervalHours * 60 * 60 * 1000);
        }
        
        const diff = (nextIntervalDate.getTime() - now.getTime()) / (1000 * 60); // in minutes
        
        if (diff < minDiff) {
          minDiff = diff;
          const hours = nextIntervalDate.getHours();
          const minutes = nextIntervalDate.getMinutes();
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          nextDose = {
            schedule_id: schedule.id,
            scheduled_time: nextIntervalDate.toISOString(),
            time: timeStr,
          };
        }
      } catch (error) {
        console.error("Error calculating interval-based schedule:", error);
      }
      continue;
    }

    if (schedule.days_of_week) {
      // For specific days schedules
      try {
        const days = JSON.parse(schedule.days_of_week) as number[];
        const [hours, minutes] = schedule.time.split(":").map(Number);
        const scheduleTime = hours * 60 + minutes;

        // Check today first
        if (days.includes(currentDay) && scheduleTime > currentTime) {
          const diff = scheduleTime - currentTime;
          if (diff < minDiff) {
            minDiff = diff;
            const nextDate = new Date(now);
            nextDate.setHours(hours, minutes, 0, 0);
            nextDose = {
              schedule_id: schedule.id,
              scheduled_time: nextDate.toISOString(),
              time: schedule.time,
            };
          }
        }

        // Check upcoming days (next 7 days)
        for (let i = 1; i <= 7; i++) {
          const checkDay = (currentDay + i) % 7;
          if (days.includes(checkDay)) {
            const daysUntil = i;
            const diff = daysUntil * 24 * 60 + (scheduleTime - currentTime);
            if (diff < minDiff) {
              minDiff = diff;
              const nextDate = new Date(now);
              nextDate.setDate(nextDate.getDate() + daysUntil);
              nextDate.setHours(hours, minutes, 0, 0);
              nextDose = {
                schedule_id: schedule.id,
                scheduled_time: nextDate.toISOString(),
                time: schedule.time,
              };
            }
            break; // Found the next occurrence for this schedule
          }
        }
      } catch (error) {
        console.error("Error parsing days_of_week:", error);
      }
    } else {
      // Daily schedule
      const [hours, minutes] = schedule.time.split(":").map(Number);
      const scheduleTime = hours * 60 + minutes;

      if (scheduleTime > currentTime) {
        // Today
        const diff = scheduleTime - currentTime;
        if (diff < minDiff) {
          minDiff = diff;
          const nextDate = new Date(now);
          nextDate.setHours(hours, minutes, 0, 0);
          nextDose = {
            schedule_id: schedule.id,
            scheduled_time: nextDate.toISOString(),
            time: schedule.time,
          };
        }
      } else {
        // Tomorrow
        const diff = 24 * 60 - currentTime + scheduleTime;
        if (diff < minDiff) {
          minDiff = diff;
          const nextDate = new Date(now);
          nextDate.setDate(nextDate.getDate() + 1);
          nextDate.setHours(hours, minutes, 0, 0);
          nextDose = {
            schedule_id: schedule.id,
            scheduled_time: nextDate.toISOString(),
            time: schedule.time,
          };
        }
      }
    }
  }

  return nextDose;
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
