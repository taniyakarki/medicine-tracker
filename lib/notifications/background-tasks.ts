import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import {
  removeDuplicateDoses,
  updateMissedDoses,
} from "../database/models/dose";
import { rescheduleAllNotifications } from "./scheduler";

const BACKGROUND_FETCH_TASK = "medicine-tracker-background-fetch";

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
