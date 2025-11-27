import { NotificationSettings } from "../../../types/database";
import { executeQueryFirst, findAll, insert, update } from "../operations";

const TABLE_NAME = "notification_settings";

export const createNotificationSettings = async (
  settingsData: Omit<NotificationSettings, "id" | "created_at" | "updated_at">
): Promise<string> => {
  return await insert<NotificationSettings>(TABLE_NAME, settingsData);
};

export const updateNotificationSettings = async (
  id: string,
  settingsData: Partial<NotificationSettings>
): Promise<void> => {
  await update<NotificationSettings>(TABLE_NAME, id, settingsData);
};

export const getNotificationSettingsByUserId = async (
  userId: string
): Promise<NotificationSettings | null> => {
  const settings = await findAll<NotificationSettings>(
    TABLE_NAME,
    "user_id = ?",
    [userId]
  );
  return settings.length > 0 ? settings[0] : null;
};

export const ensureNotificationSettings = async (
  userId: string
): Promise<NotificationSettings> => {
  let settings = await getNotificationSettingsByUserId(userId);

  if (!settings) {
    // Create default settings
    const settingsId = await createNotificationSettings({
      user_id: userId,
      enabled: true,
      sound: "default",
      vibration: true,
      full_screen_enabled: true,
      remind_before_minutes: 0,
      remind_after_missed_minutes: 15,
      snooze_duration_minutes: 10,
    });

    settings = await executeQueryFirst<NotificationSettings>(
      `SELECT * FROM ${TABLE_NAME} WHERE id = ?`,
      [settingsId]
    );

    if (!settings) {
      throw new Error("Failed to create notification settings");
    }
  }

  return settings;
};
