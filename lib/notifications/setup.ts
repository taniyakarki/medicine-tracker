import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

// Configure notification behavior
// Notifications should only show when app is in background/closed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    Alert.alert(
      "Notification Error",
      "Notifications only work on physical devices, not in simulators."
    );
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Permission Required",
      "Please enable notifications in your device settings to receive medicine reminders."
    );
    return false;
  }

  // Configure notification channel for Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("medicine-reminders", {
      name: "Medicine Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });

    // High priority channel for critical reminders
    await Notifications.setNotificationChannelAsync("medicine-critical", {
      name: "Critical Medicine Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: "#EF4444",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return true;
};

export const setupNotificationCategories = async () => {
  // Define notification actions
  await Notifications.setNotificationCategoryAsync("medicine-reminder", [
    {
      identifier: "take",
      buttonTitle: "Take",
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: "snooze",
      buttonTitle: "Snooze 10min",
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: "skip",
      buttonTitle: "Skip",
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
};

export const initializeNotifications = async (): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }

    await setupNotificationCategories();

    // Reschedule all notifications on app start to ensure they're up to date
    try {
      const { rescheduleAllNotifications } = await import("./scheduler");
      await rescheduleAllNotifications();
      console.log("Successfully rescheduled all notifications on app start");
    } catch (rescheduleError) {
      console.error(
        "Error rescheduling notifications on app start:",
        rescheduleError
      );
      // Don't fail initialization if rescheduling fails
    }

    return true;
  } catch (error) {
    console.error("Error initializing notifications:", error);
    return false;
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const cancelNotification = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};
