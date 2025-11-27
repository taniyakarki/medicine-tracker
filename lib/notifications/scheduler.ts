import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { createDose } from "../database/models/dose";
import { getMedicineById } from "../database/models/medicine";
import { getActiveSchedulesByMedicineId } from "../database/models/schedule";
import { addDays } from "../utils/date-helpers";

export interface ScheduleNotificationParams {
  medicineId: string;
  medicineName: string;
  dosage: string;
  unit: string;
  scheduledTime: Date;
  scheduleId: string;
}

export const scheduleNotification = async (
  params: ScheduleNotificationParams
): Promise<string> => {
  const { medicineId, medicineName, dosage, unit, scheduledTime, scheduleId } =
    params;

  // Create dose record
  const doseId = await createDose({
    medicine_id: medicineId,
    schedule_id: scheduleId,
    scheduled_time: scheduledTime.toISOString(),
    status: "scheduled",
  });

  // Schedule notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Medicine Reminder",
      body: `Time to take ${medicineName} (${dosage} ${unit})`,
      data: {
        doseId,
        medicineId,
        medicineName,
        dosage: `${dosage} ${unit}`,
        scheduledTime: scheduledTime.toISOString(),
        type: "medicine_reminder",
      },
      categoryIdentifier: "medicine-reminder",
      sound: "default",
      priority: Platform.OS === "android" ? "max" : "high",
    },
    trigger: {
      date: scheduledTime,
      channelId: "medicine-reminders",
    },
  });

  return notificationId;
};

export const scheduleMedicineNotifications = async (
  medicineId: string,
  daysAhead: number = 7
): Promise<void> => {
  try {
    const medicine = await getMedicineById(medicineId);
    if (!medicine || !medicine.is_active) {
      return;
    }

    const schedules = await getActiveSchedulesByMedicineId(medicineId);
    if (schedules.length === 0) {
      return;
    }

    const now = new Date();
    const endDate = addDays(now, daysAhead);

    // Check if medicine has ended
    if (medicine.end_date && new Date(medicine.end_date) < now) {
      return;
    }

    // Delete old scheduled doses for this medicine that are in the future
    // This prevents duplicates when rescheduling
    const { executeQuery } = await import("../database/operations");
    await executeQuery(
      `DELETE FROM doses 
       WHERE medicine_id = ? 
       AND status = 'scheduled' 
       AND scheduled_time > ?`,
      [medicineId, now.toISOString()]
    );

    for (const schedule of schedules) {
      if (medicine.frequency === "daily") {
        // Daily frequency - schedule for each day
        let currentDate = new Date(now);
        const [hours, minutes] = schedule.time.split(":").map(Number);

        while (currentDate <= endDate) {
          const scheduledTime = new Date(currentDate);
          scheduledTime.setHours(hours, minutes, 0, 0);

          // Only schedule if it's in the future
          if (scheduledTime > now && scheduledTime <= endDate) {
            await scheduleNotification({
              medicineId: medicine.id,
              medicineName: medicine.name,
              dosage: medicine.dosage,
              unit: medicine.unit,
              scheduledTime,
              scheduleId: schedule.id,
            });
          }

          currentDate = addDays(currentDate, 1);
        }
      } else if (
        medicine.frequency === "specific_days" &&
        schedule.days_of_week
      ) {
        // Specific days frequency - schedule only on selected days
        const daysOfWeek = JSON.parse(schedule.days_of_week);
        let currentDate = new Date(now);

        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();

          if (daysOfWeek.includes(dayOfWeek)) {
            const [hours, minutes] = schedule.time.split(":").map(Number);
            const scheduledTime = new Date(currentDate);
            scheduledTime.setHours(hours, minutes, 0, 0);

            if (scheduledTime > now && scheduledTime <= endDate) {
              await scheduleNotification({
                medicineId: medicine.id,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                unit: medicine.unit,
                scheduledTime,
                scheduleId: schedule.id,
              });
            }
          }

          currentDate = addDays(currentDate, 1);
        }
      } else if (medicine.frequency === "interval" && schedule.interval_hours) {
        // Interval-based frequency - schedule at regular intervals
        const [hours, minutes] = schedule.time.split(":").map(Number);
        let nextOccurrence = new Date(now);
        nextOccurrence.setHours(hours, minutes, 0, 0);

        // If the start time has passed today, start from the next interval
        if (nextOccurrence <= now) {
          const millisSinceStart = now.getTime() - nextOccurrence.getTime();
          const intervalMillis = schedule.interval_hours * 60 * 60 * 1000;
          const intervalsPassed = Math.ceil(millisSinceStart / intervalMillis);
          nextOccurrence = new Date(
            nextOccurrence.getTime() + intervalsPassed * intervalMillis
          );
        }

        // Schedule all occurrences within the time window
        while (nextOccurrence <= endDate) {
          if (nextOccurrence > now) {
            await scheduleNotification({
              medicineId: medicine.id,
              medicineName: medicine.name,
              dosage: medicine.dosage,
              unit: medicine.unit,
              scheduledTime: nextOccurrence,
              scheduleId: schedule.id,
            });
          }

          // Add interval hours for next occurrence
          nextOccurrence = new Date(
            nextOccurrence.getTime() + schedule.interval_hours * 60 * 60 * 1000
          );
        }
      }
    }
  } catch (error) {
    console.error("Error scheduling medicine notifications:", error);
    throw error;
  }
};

export const rescheduleAllNotifications = async (
  userId?: string
): Promise<void> => {
  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Get all active medicines
    const { getActiveMedicines } = await import("../database/models/medicine");
    const { ensureUserExists } = await import("../database/models/user");

    // Get user ID if not provided
    let activeUserId = userId;
    if (!activeUserId) {
      const user = await ensureUserExists();
      activeUserId = user.id;
    }

    const medicines = await getActiveMedicines(activeUserId);

    console.log(
      `Rescheduling notifications for ${medicines.length} active medicines...`
    );

    // Schedule notifications for each medicine (next 7 days)
    for (const medicine of medicines) {
      try {
        await scheduleMedicineNotifications(medicine.id, 7);
      } catch (error) {
        console.error(
          `Error scheduling notifications for medicine ${medicine.id}:`,
          error
        );
        // Continue with other medicines even if one fails
      }
    }

    console.log("Successfully rescheduled all notifications");
  } catch (error) {
    console.error("Error rescheduling notifications:", error);
    throw error;
  }
};

export const snoozeNotification = async (
  doseId: string,
  medicineId: string,
  medicineName: string,
  dosage: string,
  snoozeMinutes: number = 10
): Promise<void> => {
  const snoozeTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Medicine Reminder (Snoozed)",
      body: `Time to take ${medicineName} (${dosage})`,
      data: {
        doseId,
        medicineId,
        medicineName,
        dosage,
        scheduledTime: snoozeTime.toISOString(),
        type: "medicine_reminder",
      },
      categoryIdentifier: "medicine-reminder",
      sound: "default",
    },
    trigger: {
      date: snoozeTime,
      channelId: "medicine-reminders",
    },
  });
};
