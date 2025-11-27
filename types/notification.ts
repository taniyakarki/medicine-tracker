export interface NotificationData {
  doseId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  type: 'medicine_reminder';
}

export interface NotificationAction {
  identifier: string;
  buttonTitle: string;
  options?: {
    opensAppToForeground?: boolean;
  };
}

export type NotificationResponse = 'taken' | 'snoozed' | 'skipped' | 'dismissed';

