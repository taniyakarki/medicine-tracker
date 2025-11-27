import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    severity: 'high' as const,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    Alert.alert(
      'Notification Error',
      'Notifications only work on physical devices, not in simulators.'
    );
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please enable notifications in your device settings to receive medicine reminders.'
    );
    return false;
  }

  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicine-reminders', {
      name: 'Medicine Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // High priority channel for critical reminders
    await Notifications.setNotificationChannelAsync('medicine-critical', {
      name: 'Critical Medicine Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#EF4444',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return true;
};

export const setupNotificationCategories = async () => {
  // Define notification actions
  await Notifications.setNotificationCategoryAsync('medicine-reminder', [
    {
      identifier: 'take',
      buttonTitle: 'Take',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'snooze',
      buttonTitle: 'Snooze 10min',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'skip',
      buttonTitle: 'Skip',
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
    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
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

