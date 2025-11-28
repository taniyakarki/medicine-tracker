import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { DoseHistoryList } from "../../../components/medicine/DoseHistoryList";
import { MedicineTypeIcon } from "../../../components/medicine/MedicineTypeIcon";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Colors, Spacing, Typography } from "../../../constants/design";
import { getDosesByMedicineId } from "../../../lib/database/models/dose";
import { deleteMedicine } from "../../../lib/database/models/medicine";
import { getSchedulesByMedicineId } from "../../../lib/database/models/schedule";
import { useMedicine } from "../../../lib/hooks/useMedicines";
import { Schedule } from "../../../types/database";
import { DoseWithMedicine } from "../../../types/medicine";

export default function MedicineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const { medicine, loading, refresh: refreshMedicine } = useMedicine(id);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (id) {
      loadSchedulesAndDoses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Refresh data when screen comes into focus (e.g., after editing)
  useFocusEffect(
    useCallback(() => {
      if (id) {
        refreshMedicine();
        loadSchedulesAndDoses();
      }
    }, [id, refreshMedicine])
  );

  const loadSchedulesAndDoses = async () => {
    try {
      setLoadingSchedules(true);
      const [schedulesData, dosesData] = await Promise.all([
        getSchedulesByMedicineId(id),
        getDosesByMedicineId(id, 100), // Load last 100 doses
      ]);
      setSchedules(schedulesData);

      console.log(`Loaded ${dosesData.length} doses for medicine ${id}`);

      // Get end of today (23:59:59)
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Transform doses to include medicine info and filter to only past and today
      const dosesWithMedicine = dosesData
        .map((dose) => ({
          ...dose,
          medicine: medicine || {
            id: id,
            name: "",
            type: "pill" as const,
            dosage: "",
            unit: "",
          },
        }))
        .filter((dose) => {
          const scheduledTime = new Date(dose.scheduled_time);
          return scheduledTime <= endOfToday;
        });

      console.log(
        `Filtered to ${dosesWithMedicine.length} doses (past and today)`
      );
      setDoses(dosesWithMedicine);
    } catch (error) {
      console.error("Error loading schedules and doses:", error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleEdit = () => {
    router.push(`/medicines/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Medicine",
      "Are you sure you want to delete this medicine? This will also delete all associated schedules and dose history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMedicine(id);
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete medicine");
            }
          },
        },
      ]
    );
  };

  const formatDaysOfWeek = (daysJson?: string) => {
    if (!daysJson) return null;
    try {
      const days = JSON.parse(daysJson);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days.map((d: number) => dayNames[d]).join(", ");
    } catch {
      return null;
    }
  };

  const formatTimeWithAMPM = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const getNextScheduledDose = () => {
    if (!schedules || schedules.length === 0) return null;

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    let nextDose: { time: string; date: Date } | null = null;
    let minDiff = Infinity;

    // Check each schedule
    for (const schedule of schedules) {
      if (schedule.interval_hours) {
        // For interval-based schedules, find the next occurrence
        // This is complex, so we'll just show "Every X hours" for now
        continue;
      }

      if (schedule.days_of_week) {
        // For specific days schedules
        try {
          const days = JSON.parse(schedule.days_of_week) as number[];
          const [hours, minutes] = schedule.time.split(":").map(Number);
          const scheduleTime = hours * 60 + minutes;

          // Check today first
          if (days.includes(currentDay) && scheduleTime > currentTime) {
            const diff = scheduleTime - currentTime;
            if (diff < minDiff) {
              minDiff = diff;
              const nextDate = new Date(now);
              nextDate.setHours(hours, minutes, 0, 0);
              nextDose = { time: schedule.time, date: nextDate };
            }
          }

          // Check upcoming days (next 7 days)
          for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (days.includes(checkDay)) {
              const daysUntil = i;
              const diff = daysUntil * 24 * 60 + (scheduleTime - currentTime);
              if (diff < minDiff) {
                minDiff = diff;
                const nextDate = new Date(now);
                nextDate.setDate(nextDate.getDate() + daysUntil);
                nextDate.setHours(hours, minutes, 0, 0);
                nextDose = { time: schedule.time, date: nextDate };
              }
              break; // Found the next occurrence for this schedule
            }
          }
        } catch (error) {
          console.error("Error parsing days_of_week:", error);
        }
      } else {
        // Daily schedule
        const [hours, minutes] = schedule.time.split(":").map(Number);
        const scheduleTime = hours * 60 + minutes;

        if (scheduleTime > currentTime) {
          // Today
          const diff = scheduleTime - currentTime;
          if (diff < minDiff) {
            minDiff = diff;
            const nextDate = new Date(now);
            nextDate.setHours(hours, minutes, 0, 0);
            nextDose = { time: schedule.time, date: nextDate };
          }
        } else {
          // Tomorrow
          const diff = 24 * 60 - currentTime + scheduleTime;
          if (diff < minDiff) {
            minDiff = diff;
            const nextDate = new Date(now);
            nextDate.setDate(nextDate.getDate() + 1);
            nextDate.setHours(hours, minutes, 0, 0);
            nextDose = { time: schedule.time, date: nextDate };
          }
        }
      }
    }

    return nextDose;
  };

  const formatNextDoseTime = (
    nextDose: { time: string; date: Date } | null
  ) => {
    if (!nextDose) return null;

    const now = new Date();
    const diff = nextDose.date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const isToday = nextDose.date.toDateString() === now.toDateString();
    const isTomorrow =
      nextDose.date.toDateString() ===
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    let dateStr = "";
    if (isToday) {
      dateStr = "Today";
    } else if (isTomorrow) {
      dateStr = "Tomorrow";
    } else {
      dateStr = nextDose.date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    let timeUntil = "";
    if (hours > 0) {
      timeUntil = `in ${hours}h ${minutes}m`;
    } else {
      timeUntil = `in ${minutes}m`;
    }

    return {
      dateStr,
      timeStr: formatTimeWithAMPM(nextDose.time),
      timeUntil,
    };
  };

  const nextDose = getNextScheduledDose();
  const nextDoseFormatted = formatNextDoseTime(nextDose);

  if (loading || !medicine) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Medicine Image */}
        {medicine.image && (
          <Card style={styles.imageCard}>
            <Image
              source={{ uri: medicine.image }}
              style={styles.medicineImage}
            />
          </Card>
        )}

        <Card style={styles.headerCard}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {medicine.color ? (
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: medicine.color },
                  ]}
                >
                  <MedicineTypeIcon
                    type={medicine.type}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
              ) : (
                <MedicineTypeIcon type={medicine.type} size={32} />
              )}
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.name, { color: colors.text }]}>
                {medicine.name}
              </Text>
              <Text style={[styles.type, { color: colors.textSecondary }]}>
                {medicine.type.charAt(0).toUpperCase() + medicine.type.slice(1)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Next Scheduled Dose */}
        {nextDoseFormatted && (
          <Card style={styles.nextDoseCard}>
            <View style={styles.nextDoseHeader}>
              <Ionicons name="alarm" size={24} color={colors.primary} />
              <Text style={[styles.nextDoseTitle, { color: colors.text }]}>
                Next Dose
              </Text>
            </View>
            <View style={styles.nextDoseContent}>
              <Text style={[styles.nextDoseDate, { color: colors.text }]}>
                {nextDoseFormatted.dateStr}
              </Text>
              <Text style={[styles.nextDoseTime, { color: colors.primary }]}>
                {nextDoseFormatted.timeStr}
              </Text>
              <View
                style={[
                  styles.nextDoseBadge,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Text
                  style={[styles.nextDoseTimeUntil, { color: colors.primary }]}
                >
                  {nextDoseFormatted.timeUntil}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Dosage Information
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="medical" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Dosage:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {medicine.dosage} {medicine.unit}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Frequency:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {medicine.frequency.replace("_", " ").charAt(0).toUpperCase() +
                medicine.frequency.replace("_", " ").slice(1)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="play-circle"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Start Date:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(medicine.start_date).toLocaleDateString()}
            </Text>
          </View>
          {medicine.end_date && (
            <View style={styles.infoRow}>
              <Ionicons
                name="stop-circle"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                End Date:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(medicine.end_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Card>

        {/* Schedule Information */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Schedule
          </Text>
          {loadingSchedules ? (
            <LoadingSpinner />
          ) : schedules.length > 0 ? (
            schedules.map((schedule, index) => (
              <View key={schedule.id || index} style={styles.scheduleItem}>
                <View style={styles.scheduleRow}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <Text style={[styles.scheduleTime, { color: colors.text }]}>
                    {formatTimeWithAMPM(schedule.time)}
                  </Text>
                </View>
                {schedule.days_of_week && (
                  <View style={styles.scheduleRow}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.scheduleDetail,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatDaysOfWeek(schedule.days_of_week)}
                    </Text>
                  </View>
                )}
                {schedule.interval_hours && (
                  <View style={styles.scheduleRow}>
                    <Ionicons
                      name="repeat"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.scheduleDetail,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Every {schedule.interval_hours} hours
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.noSchedule, { color: colors.textSecondary }]}>
              No schedule set
            </Text>
          )}
        </Card>

        {medicine.notes && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notes
            </Text>
            <Text style={[styles.notes, { color: colors.textSecondary }]}>
              {medicine.notes}
            </Text>
          </Card>
        )}

        {/* Dose Statistics */}
        {doses.length > 0 && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${colors.primary}20` },
                  ]}
                >
                  <Ionicons name="list" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {doses.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Doses
                </Text>
              </View>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${colors.success}20` },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.success}
                  />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {doses.filter((d) => d.status === "taken").length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Taken
                </Text>
              </View>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${colors.error}20` },
                  ]}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={colors.error}
                  />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {doses.filter((d) => d.status === "missed").length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Missed
                </Text>
              </View>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${colors.warning}20` },
                  ]}
                >
                  <Ionicons
                    name="remove-circle"
                    size={24}
                    color={colors.warning}
                  />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {doses.filter((d) => d.status === "skipped").length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Skipped
                </Text>
              </View>
            </View>
            {doses.filter((d) => d.status === "taken").length > 0 && (
              <View style={styles.adherenceContainer}>
                <Text
                  style={[
                    styles.adherenceLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Adherence Rate
                </Text>
                <Text
                  style={[styles.adherenceValue, { color: colors.success }]}
                >
                  {(
                    (doses.filter((d) => d.status === "taken").length /
                      doses.length) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Dose History */}
        <Card style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Dose History
            </Text>
            {doses.length > 0 && (
              <Button
                title={showHistory ? "Hide" : "Show"}
                onPress={() => setShowHistory(!showHistory)}
                variant="ghost"
                style={styles.toggleButton}
              />
            )}
          </View>
          {doses.length === 0 ? (
            <View style={styles.emptyHistoryContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyHistoryText, { color: colors.text }]}>
                No dose history yet
              </Text>
              <Text
                style={[
                  styles.emptyHistorySubtext,
                  { color: colors.textSecondary },
                ]}
              >
                Doses will appear here once they are scheduled and taken
              </Text>
            </View>
          ) : (
            showHistory && (
              <View style={styles.historyContainer}>
                <DoseHistoryList doses={doses} showMedicineName={false} />
              </View>
            )
          )}
        </Card>

        <View style={styles.actions}>
          <Button
            title="Edit Medicine"
            onPress={handleEdit}
            style={styles.editButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  imageCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  medicineImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  headerCard: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  colorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  type: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.md,
  },
  nextDoseCard: {
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  nextDoseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  nextDoseTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  nextDoseContent: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  nextDoseDate: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  nextDoseTime: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  nextDoseBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginTop: Spacing.xs,
  },
  nextDoseTimeUntil: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    marginLeft: Spacing.sm,
    width: 100,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  scheduleItem: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  scheduleTime: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  scheduleDetail: {
    fontSize: Typography.fontSize.base,
  },
  noSchedule: {
    fontSize: Typography.fontSize.base,
    fontStyle: "italic",
  },
  notes: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },
  adherenceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  adherenceLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  adherenceValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  toggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  historyContainer: {
    minHeight: 200,
  },
  emptyHistoryContainer: {
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyHistoryText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  emptyHistorySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  editButton: {
    width: "100%",
  },
  deleteButton: {
    width: "100%",
  },
});
