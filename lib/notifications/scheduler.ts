import * as Notifications from 'expo-notifications';
import { Schedule, Medicine } from '../../types/database';
import { createDose } from '../database/models/dose';
import { getActiveSchedulesByMedicineId } from '../database/models/schedule';
import { getMedicineById } from '../database/models/medicine';
import { getNextOccurrence, addDays } from '../utils/date-helpers';
import { Platform } from 'react-native';

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
  const { medicineId, medicineName, dosage, unit, scheduledTime, scheduleId } = params;

  // Create dose record
  const doseId = await createDose({
    medicine_id: medicineId,
    schedule_id: scheduleId,
    scheduled_time: scheduledTime.toISOString(),
    status: 'scheduled',
  });

  // Schedule notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Medicine Reminder',
      body: `Time to take ${medicineName} (${dosage} ${unit})`,
      data: {
        doseId,
        medicineId,
        medicineName,
        dosage: `${dosage} ${unit}`,
        scheduledTime: scheduledTime.toISOString(),
        type: 'medicine_reminder',
      },
      categoryIdentifier: 'medicine-reminder',
      sound: 'default',
      priority: Platform.OS === 'android' ? 'max' : 'high',
    },
    trigger: {
      date: scheduledTime,
      channelId: 'medicine-reminders',
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

    for (const schedule of schedules) {
      let currentDate = now;

      while (currentDate <= endDate) {
        let nextOccurrence: Date;

        if (medicine.frequency === 'daily') {
          nextOccurrence = getNextOccurrence(schedule.time);
        } else if (medicine.frequency === 'specific_days' && schedule.days_of_week) {
          const daysOfWeek = JSON.parse(schedule.days_of_week);
          nextOccurrence = getNextOccurrence(schedule.time, daysOfWeek);
        } else if (medicine.frequency === 'interval' && schedule.interval_hours) {
          // For interval-based schedules, calculate next occurrence
          const [hours, minutes] = schedule.time.split(':').map(Number);
          nextOccurrence = new Date(currentDate);
          nextOccurrence.setHours(hours, minutes, 0, 0);

          if (nextOccurrence <= now) {
            nextOccurrence = new Date(now.getTime() + schedule.interval_hours * 60 * 60 * 1000);
          }
        } else {
          break;
        }

        if (nextOccurrence > now && nextOccurrence <= endDate) {
          await scheduleNotification({
            medicineId: medicine.id,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            unit: medicine.unit,
            scheduledTime: nextOccurrence,
            scheduleId: schedule.id,
          });
        }

        // Move to next day for daily/specific_days schedules
        if (medicine.frequency !== 'interval') {
          currentDate = addDays(currentDate, 1);
        } else {
          break; // For interval schedules, only schedule once
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling medicine notifications:', error);
    throw error;
  }
};

export const rescheduleAllNotifications = async (): Promise<void> => {
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Get all active medicines and reschedule
    // This would typically be called from a background task
    // For now, we'll implement the basic structure
    console.log('Rescheduling all notifications...');
  } catch (error) {
    console.error('Error rescheduling notifications:', error);
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
      title: 'Medicine Reminder (Snoozed)',
      body: `Time to take ${medicineName} (${dosage})`,
      data: {
        doseId,
        medicineId,
        medicineName,
        dosage,
        scheduledTime: snoozeTime.toISOString(),
        type: 'medicine_reminder',
      },
      categoryIdentifier: 'medicine-reminder',
      sound: 'default',
    },
    trigger: {
      date: snoozeTime,
      channelId: 'medicine-reminders',
    },
  });
};

