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

const isInDndPeriod = (time: Date, dndStart?: string, dndEnd?: string): boolean => {
  if (!dndStart || !dndEnd) return false;

  const [startHour, startMin] = dndStart.split(":").map(Number);
  const [endHour, endMin] = dndEnd.split(":").map(Number);

  const timeMinutes = time.getHours() * 60 + time.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight DND (e.g., 22:00 - 07:00)
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes < endMinutes;
  }

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};

export const scheduleNotification = async (
  params: ScheduleNotificationParams,
  userId?: string
): Promise<string> => {
  const { medicineId, medicineName, dosage, unit, scheduledTime, scheduleId } =
    params;

  // Get notification settings
  const { ensureNotificationSettings } = await import("../database/models/notification-settings");
  const { ensureUserExists } = await import("../database/models/user");
  
  let activeUserId = userId;
  if (!activeUserId) {
    const user = await ensureUserExists();
    activeUserId = user.id;
  }

  const settings = await ensureNotificationSettings(activeUserId);

  // Check if notifications are enabled
  if (!settings.enabled) {
    return "";
  }

  // Check DND settings
  const medicine = await getMedicineById(medicineId);
  const isInDnd = settings.dnd_enabled && 
                  isInDndPeriod(scheduledTime, settings.dnd_start_time, settings.dnd_end_time);
  
  // Skip notification if in DND and medicine is not critical
  if (isInDnd && !settings.dnd_allow_critical) {
    // Still create the dose record but don't schedule notification
    await createDose({
      medicine_id: medicineId,
      schedule_id: scheduleId,
      scheduled_time: scheduledTime.toISOString(),
      status: "scheduled",
    });
    return "";
  }

  // Create dose record
  const doseId = await createDose({
    medicine_id: medicineId,
    schedule_id: scheduleId,
    scheduled_time: scheduledTime.toISOString(),
    status: "scheduled",
  });

  // Schedule "remind before" notification if enabled
  if (settings.remind_before_minutes > 0) {
    const remindBeforeTime = new Date(scheduledTime.getTime() - settings.remind_before_minutes * 60 * 1000);
    
    if (remindBeforeTime > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Medicine",
          body: `${medicineName} (${dosage} ${unit}) in ${settings.remind_before_minutes} minutes`,
          data: {
            doseId,
            medicineId,
            medicineName,
            dosage: `${dosage} ${unit}`,
            scheduledTime: scheduledTime.toISOString(),
            type: "medicine_reminder_before",
          },
          categoryIdentifier: "medicine-reminder",
          sound: settings.sound,
          priority: Platform.OS === "android" ? "high" : "default",
        },
        trigger: {
          date: remindBeforeTime,
          channelId: "medicine-reminders",
        },
      });
    }
  }

  // Schedule main notification
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
      sound: settings.sound,
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
    // Add a 2-minute buffer to prevent immediate notifications
    const bufferTime = new Date(now.getTime() + 2 * 60 * 1000);
    const endDate = addDays(now, daysAhead);

    // Check if medicine has ended
    if (medicine.end_date && new Date(medicine.end_date) < now) {
      return;
    }

    // Cancel all existing notifications for this medicine
    const allScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const medicineNotifications = allScheduledNotifications.filter(
      (notification) => notification.content.data?.medicineId === medicineId
    );
    
    for (const notification of medicineNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
    
    console.log(`Cancelled ${medicineNotifications.length} notifications for medicine ${medicineId}`);

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

          // Only schedule if it's in the future (with buffer)
          if (scheduledTime > bufferTime && scheduledTime <= endDate) {
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

            if (scheduledTime > bufferTime && scheduledTime <= endDate) {
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

        // Start from the medicine's start date
        const startDate = new Date(medicine.start_date);
        let firstOccurrence = new Date(startDate);
        firstOccurrence.setHours(hours, minutes, 0, 0);

        const intervalMillis = schedule.interval_hours * 60 * 60 * 1000;

        // Create past doses as "missed" if the start time was in the past
        if (firstOccurrence < now) {
          let pastOccurrence = new Date(firstOccurrence);
          const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

          // Only create past doses for the last 24 hours to avoid too many missed doses
          while (pastOccurrence < now) {
            if (pastOccurrence >= oneDayAgo && pastOccurrence < bufferTime) {
              // Check if a dose already exists for this time
              const existingDose = await executeQuery(
                `SELECT id FROM doses 
                 WHERE medicine_id = ? 
                   AND schedule_id = ? 
                   AND scheduled_time = ?
                 LIMIT 1`,
                [medicine.id, schedule.id, pastOccurrence.toISOString()]
              );

              // Only create if it doesn't exist
              if (existingDose.length === 0) {
                await createDose({
                  medicine_id: medicine.id,
                  schedule_id: schedule.id,
                  scheduled_time: pastOccurrence.toISOString(),
                  status: "missed",
                });
              }
            }
            pastOccurrence = new Date(
              pastOccurrence.getTime() + intervalMillis
            );
          }

          // Set next occurrence to the first future time
          firstOccurrence = pastOccurrence;
        }

        // Schedule future occurrences
        let nextOccurrence = new Date(firstOccurrence);
        while (nextOccurrence <= endDate) {
          if (nextOccurrence > bufferTime) {
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
          nextOccurrence = new Date(nextOccurrence.getTime() + intervalMillis);
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
  userId?: string
): Promise<void> => {
  // Get notification settings for snooze duration
  const { ensureNotificationSettings } = await import("../database/models/notification-settings");
  const { ensureUserExists } = await import("../database/models/user");
  
  let activeUserId = userId;
  if (!activeUserId) {
    const user = await ensureUserExists();
    activeUserId = user.id;
  }

  const settings = await ensureNotificationSettings(activeUserId);
  const snoozeMinutes = settings.snooze_duration_minutes || 10;
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
      sound: settings.sound,
    },
    trigger: {
      date: snoozeTime,
      channelId: "medicine-reminders",
    },
  });
};
