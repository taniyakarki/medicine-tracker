import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { DoseWithMedicine } from "../../types/medicine";
import { Medicine } from "../../types/database";
import { formatDate, formatDateTime } from "./date-helpers";

/**
 * Export dose history as CSV
 */
export const exportDosesAsCSV = async (
  doses: DoseWithMedicine[],
  fileName: string = "dose_history.csv"
): Promise<void> => {
  try {
    // CSV Header
    const headers = [
      "Date",
      "Time",
      "Medicine",
      "Dosage",
      "Unit",
      "Status",
      "Notes",
    ];

    // CSV Rows
    const rows = doses.map((dose) => {
      const scheduledDate = new Date(dose.scheduled_time);
      const takenDate = dose.taken_time ? new Date(dose.taken_time) : null;
      const displayDate = takenDate || scheduledDate;

      return [
        formatDate(displayDate.toISOString()),
        displayDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        dose.medicine.name,
        dose.medicine.dosage,
        dose.medicine.unit,
        dose.status.charAt(0).toUpperCase() + dose.status.slice(1),
        dose.notes || "",
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Save to file
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Dose History",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw new Error("Failed to export CSV file");
  }
};

/**
 * Export medicines as CSV
 */
export const exportMedicinesAsCSV = async (
  medicines: Medicine[],
  fileName: string = "medicines.csv"
): Promise<void> => {
  try {
    // CSV Header
    const headers = [
      "Name",
      "Type",
      "Dosage",
      "Unit",
      "Frequency",
      "Start Date",
      "End Date",
      "Notes",
      "Active",
    ];

    // CSV Rows
    const rows = medicines.map((medicine) => [
      medicine.name,
      medicine.type,
      medicine.dosage,
      medicine.unit,
      medicine.frequency,
      formatDate(medicine.start_date),
      medicine.end_date ? formatDate(medicine.end_date) : "",
      medicine.notes || "",
      medicine.is_active ? "Yes" : "No",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Save to file
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Medicines",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw new Error("Failed to export CSV file");
  }
};

/**
 * Generate a text-based report
 */
export const generateTextReport = async (
  stats: {
    totalMedicines: number;
    activeMedicines: number;
    todayTotal: number;
    todayTaken: number;
    todayMissed: number;
    weeklyAdherence: number;
    currentStreak: number;
  },
  doses: DoseWithMedicine[],
  medicines: Medicine[],
  startDate: string,
  endDate: string,
  fileName: string = "medicine_report.txt"
): Promise<void> => {
  try {
    const report = `
MEDICINE TRACKER REPORT
Generated: ${formatDateTime(new Date().toISOString())}
Period: ${formatDate(startDate)} to ${formatDate(endDate)}

═══════════════════════════════════════════════════════

OVERVIEW
────────────────────────────────────────────────────────
Total Medicines:        ${stats.totalMedicines}
Active Medicines:       ${stats.activeMedicines}
Current Streak:         ${stats.currentStreak} days
Weekly Adherence:       ${Math.round(stats.weeklyAdherence)}%

TODAY'S SUMMARY
────────────────────────────────────────────────────────
Total Doses:            ${stats.todayTotal}
Taken:                  ${stats.todayTaken}
Missed:                 ${stats.todayMissed}
Adherence:              ${stats.todayTotal > 0 ? Math.round((stats.todayTaken / stats.todayTotal) * 100) : 0}%

PERIOD SUMMARY (${formatDate(startDate)} - ${formatDate(endDate)})
────────────────────────────────────────────────────────
Total Doses:            ${doses.length}
Taken:                  ${doses.filter((d) => d.status === "taken").length}
Missed:                 ${doses.filter((d) => d.status === "missed").length}
Skipped:                ${doses.filter((d) => d.status === "skipped").length}
Adherence:              ${doses.length > 0 ? Math.round((doses.filter((d) => d.status === "taken").length / doses.length) * 100) : 0}%

ACTIVE MEDICINES
────────────────────────────────────────────────────────
${medicines
  .filter((m) => m.is_active)
  .map(
    (m, i) =>
      `${i + 1}. ${m.name}
   Type: ${m.type}
   Dosage: ${m.dosage} ${m.unit}
   Frequency: ${m.frequency}
   Started: ${formatDate(m.start_date)}${m.end_date ? `\n   Ends: ${formatDate(m.end_date)}` : ""}`
  )
  .join("\n\n")}

RECENT DOSE HISTORY
────────────────────────────────────────────────────────
${doses
  .slice(0, 20)
  .map((d) => {
    const date = new Date(d.taken_time || d.scheduled_time);
    return `${formatDateTime(date.toISOString())} - ${d.medicine.name} (${d.medicine.dosage} ${d.medicine.unit})
   Status: ${d.status.charAt(0).toUpperCase() + d.status.slice(1)}${d.notes ? `\n   Notes: ${d.notes}` : ""}`;
  })
  .join("\n\n")}

═══════════════════════════════════════════════════════

This report was generated by Medicine Tracker.
For questions or support, please contact your healthcare provider.
`;

    // Save to file
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, report, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/plain",
        dialogTitle: "Export Medicine Report",
        UTI: "public.plain-text",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report");
  }
};

/**
 * Export all data as JSON (for backup purposes)
 */
export const exportAllDataAsJSON = async (
  data: {
    medicines: Medicine[];
    doses: DoseWithMedicine[];
    stats: any;
  },
  fileName: string = "medicine_data_backup.json"
): Promise<void> => {
  try {
    const jsonContent = JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data,
      },
      null,
      2
    );

    // Save to file
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export Data Backup",
        UTI: "public.json",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Error exporting JSON:", error);
    throw new Error("Failed to export data backup");
  }
};

