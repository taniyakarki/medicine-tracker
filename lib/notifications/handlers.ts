import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import {
  getDoseById,
  markDoseAsSkipped,
  markDoseAsTaken,
} from "../database/models/dose";
import { snoozeNotification } from "./scheduler";

export const setupNotificationListeners = () => {
  // Handle notification received while app is foregrounded
  // We don't show notifications in foreground, just log them
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received in foreground (not shown):", notification);
    }
  );

  // Handle notification response (user tapped notification or action button)
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener(async (response) => {
      const { notification, actionIdentifier } = response;
      const data = notification.request.content.data;

      if (data.type !== "medicine_reminder") {
        return;
      }

      const { doseId, medicineId, medicineName, dosage } = data;

      try {
        switch (actionIdentifier) {
          case "take":
            await handleTakeMedicine(doseId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;

          case "snooze":
            await handleSnoozeMedicine(
              doseId,
              medicineId,
              medicineName,
              dosage
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;

          case "skip":
            await handleSkipMedicine(doseId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;

          case Notifications.DEFAULT_ACTION_IDENTIFIER:
            // User tapped the notification itself
            router.push("/notification-screen");
            break;

          default:
            console.log("Unknown action identifier:", actionIdentifier);
        }
      } catch (error) {
        console.error("Error handling notification response:", error);
      }
    });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
};

const handleTakeMedicine = async (doseId: string) => {
  try {
    await markDoseAsTaken(doseId);
    console.log("Medicine marked as taken:", doseId);
  } catch (error) {
    console.error("Error marking medicine as taken:", error);
    throw error;
  }
};

const handleSnoozeMedicine = async (
  doseId: string,
  medicineId: string,
  medicineName: string,
  dosage: string
) => {
  try {
    // Snooze for 10 minutes
    await snoozeNotification(doseId, medicineId, medicineName, dosage, 10);
    console.log("Medicine snoozed:", doseId);
  } catch (error) {
    console.error("Error snoozing medicine:", error);
    throw error;
  }
};

const handleSkipMedicine = async (doseId: string) => {
  try {
    await markDoseAsSkipped(doseId, "Skipped by user");
    console.log("Medicine marked as skipped:", doseId);
  } catch (error) {
    console.error("Error marking medicine as skipped:", error);
    throw error;
  }
};

export const presentFullScreenNotification = async (doseId: string) => {
  try {
    const dose = await getDoseById(doseId);
    if (!dose) {
      return;
    }

    // Navigate to full-screen notification screen
    router.push({
      pathname: "/notification-screen",
      params: { doseId },
    });
  } catch (error) {
    console.error("Error presenting full-screen notification:", error);
  }
};
