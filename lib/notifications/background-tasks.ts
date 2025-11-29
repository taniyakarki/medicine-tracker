import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  removeDuplicateDoses,
  updateMissedDoses,
} from "../database/models/dose";
import { rescheduleAllNotifications } from "./scheduler";
import { executeQuery } from "../database/operations";
import { ensureUserExists } from "../database/models/user";
import { ensureNotificationSettings } from "../database/models/notification-settings";

const BACKGROUND_FETCH_TASK = "medicine-tracker-background-fetch";

// Check for missed doses and send follow-up reminders
const checkMissedDosesAndRemind = async (): Promise<void> => {
  try {
    const user = await ensureUserExists();
    const settings = await ensureNotificationSettings(user.id);

    // Only proceed if remind_after_missed is enabled
    if (settings.remind_after_missed_minutes === 0) {
      return;
    }

    const now = new Date();
    const reminderThreshold = new Date(
      now.getTime() - settings.remind_after_missed_minutes * 60 * 1000
    );

    // Find doses that are missed and haven't been reminded yet
    const missedDoses = await executeQuery(
      `SELECT d.id, d.medicine_id, d.scheduled_time, m.name, m.dosage, m.unit
       FROM doses d
       JOIN medicines m ON d.medicine_id = m.id
       WHERE d.status = 'missed'
         AND d.scheduled_time < ?
         AND d.scheduled_time > ?
         AND m.user_id = ?
       ORDER BY d.scheduled_time DESC
       LIMIT 10`,
      [reminderThreshold.toISOString(), new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), user.id]
    );

    for (const dose of missedDoses) {
      // Check if we already sent a reminder for this dose
      const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const hasReminder = existingNotifications.some(
        (notif) => notif.content.data?.doseId === dose.id && 
                   notif.content.data?.type === "medicine_reminder_missed"
      );

      if (!hasReminder) {
        // Send a follow-up reminder
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Missed Medicine Reminder",
            body: `You missed ${dose.name} (${dose.dosage} ${dose.unit}). Take it now?`,
            data: {
              doseId: dose.id,
              medicineId: dose.medicine_id,
              medicineName: dose.name,
              dosage: `${dose.dosage} ${dose.unit}`,
              scheduledTime: dose.scheduled_time,
              type: "medicine_reminder_missed",
            },
            categoryIdentifier: "medicine-reminder",
            sound: settings.sound,
            priority: Platform.OS === "android" ? "high" : "default",
          },
          trigger: null, // Send immediately
        });
      }
    }
  } catch (error) {
    console.error("Error checking missed doses:", error);
  }
};

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log("Background fetch task running...");

    // Remove duplicate doses
    const duplicatesRemoved = await removeDuplicateDoses();
    if (duplicatesRemoved > 0) {
      console.log(`Removed ${duplicatesRemoved} duplicate doses`);
    }

    // Update missed doses
    await updateMissedDoses();

    // Check for missed doses and send reminders
    await checkMissedDosesAndRemind();

    // Reschedule notifications if needed
    // This ensures notifications are always scheduled even if app was killed
    await rescheduleAllNotifications();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background fetch error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundFetchAsync = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Background fetch task registered");
    }
  } catch (error) {
    console.error("Failed to register background fetch:", error);
  }
};

export const unregisterBackgroundFetchAsync = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log("Background fetch task unregistered");
  } catch (error) {
    console.error("Failed to unregister background fetch:", error);
  }
};

export const getBackgroundFetchStatus = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_FETCH_TASK
  );

  return {
    status,
    isRegistered,
    statusText: getStatusText(status),
  };
};

const getStatusText = (
  status: BackgroundFetch.BackgroundFetchStatus
): string => {
  switch (status) {
    case BackgroundFetch.BackgroundFetchStatus.Available:
      return "Available";
    case BackgroundFetch.BackgroundFetchStatus.Denied:
      return "Denied";
    case BackgroundFetch.BackgroundFetchStatus.Restricted:
      return "Restricted";
    default:
      return "Unknown";
  }
};
