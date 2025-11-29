import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import { getAllMedicines } from "../database/models/medicine";
import { getAllSchedules } from "../database/models/schedule";
import { getDosesInDateRange } from "../database/models/dose";
import { getEmergencyContactsByUserId } from "../database/models/emergency-contact";
import { getNotificationSettings } from "../database/models/notification-settings";
import { ensureUserExists, getCurrentUser } from "../database/models/user";

interface BackupData {
  version: string;
  exportDate: string;
  user: any;
  medicines: any[];
  schedules: any[];
  doses: any[];
  emergencyContacts: any[];
  notificationSettings: any;
}

/**
 * Export all app data as JSON backup
 */
export const exportBackup = async (): Promise<void> => {
  try {
    const user = await ensureUserExists();

    // Get all data
    const medicines = await getAllMedicines(user.id);
    const schedules = await getAllSchedules(user.id);
    
    // Get doses from the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const doses = await getDosesInDateRange(
      user.id,
      oneYearAgo.toISOString(),
      new Date().toISOString()
    );

    const emergencyContacts = await getEmergencyContactsByUserId(user.id);
    const notificationSettings = await getNotificationSettings(user.id);

    // Create backup object
    const backup: BackupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      user,
      medicines,
      schedules,
      doses,
      emergencyContacts,
      notificationSettings,
    };

    // Convert to JSON
    const jsonContent = JSON.stringify(backup, null, 2);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `medicine_tracker_backup_${timestamp}.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Save file
    await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export Backup",
        UTI: "public.json",
      });
    } else {
      Alert.alert(
        "Success",
        `Backup saved to: ${filename}\n\nYou can find it in the app's documents folder.`
      );
    }
  } catch (error) {
    console.error("Error exporting backup:", error);
    throw new Error("Failed to export backup");
  }
};

/**
 * Import and restore data from JSON backup
 */
export const importBackup = async (): Promise<void> => {
  try {
    // Pick a file
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    // Read the file
    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Parse JSON
    const backup: BackupData = JSON.parse(fileContent);

    // Validate backup structure
    if (!backup.version || !backup.user) {
      throw new Error("Invalid backup file format");
    }

    // Show confirmation dialog
    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Restore Backup",
        `This will restore data from ${new Date(backup.exportDate).toLocaleDateString()}.\n\nThis action cannot be undone. Continue?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Restore",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]
      );
    });

    if (!confirmed) {
      return;
    }

    // Import data
    await restoreBackupData(backup);

    Alert.alert(
      "Success",
      "Backup restored successfully. Please restart the app for changes to take effect."
    );
  } catch (error) {
    console.error("Error importing backup:", error);
    if (error instanceof Error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Error", "Failed to import backup");
    }
  }
};

/**
 * Restore backup data to database
 */
const restoreBackupData = async (backup: BackupData): Promise<void> => {
  try {
    const { updateUser } = await import("../database/models/user");
    const { createMedicine } = await import("../database/models/medicine");
    const { createSchedule } = await import("../database/models/schedule");
    const { createDose } = await import("../database/models/dose");
    const { createEmergencyContact } = await import(
      "../database/models/emergency-contact"
    );
    const { updateNotificationSettings } = await import(
      "../database/models/notification-settings"
    );

    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("No user found");
    }

    // Update user profile (excluding id and timestamps)
    const { id, created_at, updated_at, ...userData } = backup.user;
    await updateUser(currentUser.id, userData);

    // Create a mapping of old IDs to new IDs for medicines
    const medicineIdMap = new Map<string, string>();

    // Restore medicines
    for (const medicine of backup.medicines) {
      const { id: oldId, created_at, updated_at, user_id, ...medicineData } = medicine;
      const newId = await createMedicine({
        ...medicineData,
        user_id: currentUser.id,
      });
      medicineIdMap.set(oldId, newId);
    }

    // Create a mapping of old schedule IDs to new schedule IDs
    const scheduleIdMap = new Map<string, string>();

    // Restore schedules
    for (const schedule of backup.schedules) {
      const { id: oldId, created_at, updated_at, medicine_id, ...scheduleData } = schedule;
      const newMedicineId = medicineIdMap.get(medicine_id);
      if (newMedicineId) {
        const newId = await createSchedule({
          ...scheduleData,
          medicine_id: newMedicineId,
        });
        scheduleIdMap.set(oldId, newId);
      }
    }

    // Restore doses (only recent ones to avoid duplicates)
    for (const dose of backup.doses) {
      const { id, created_at, medicine_id, schedule_id, ...doseData } = dose;
      const newMedicineId = medicineIdMap.get(medicine_id);
      const newScheduleId = scheduleIdMap.get(schedule_id);
      
      if (newMedicineId && newScheduleId) {
        await createDose({
          ...doseData,
          medicine_id: newMedicineId,
          schedule_id: newScheduleId,
        });
      }
    }

    // Restore emergency contacts
    for (const contact of backup.emergencyContacts) {
      const { id, created_at, user_id, ...contactData } = contact;
      await createEmergencyContact({
        ...contactData,
        user_id: currentUser.id,
      });
    }

    // Restore notification settings
    if (backup.notificationSettings) {
      const { id, created_at, updated_at, user_id, ...settingsData } =
        backup.notificationSettings;
      await updateNotificationSettings(currentUser.id, settingsData);
    }
  } catch (error) {
    console.error("Error restoring backup data:", error);
    throw new Error("Failed to restore backup data");
  }
};

/**
 * Get backup file info (for display purposes)
 */
export const getBackupInfo = async (fileUri: string): Promise<{
  version: string;
  exportDate: string;
  medicineCount: number;
  doseCount: number;
} | null> => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const backup: BackupData = JSON.parse(fileContent);

    return {
      version: backup.version,
      exportDate: backup.exportDate,
      medicineCount: backup.medicines?.length || 0,
      doseCount: backup.doses?.length || 0,
    };
  } catch (error) {
    console.error("Error reading backup info:", error);
    return null;
  }
};

