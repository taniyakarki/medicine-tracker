import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
} from "react-native";
import { MedicineTypeIcon } from "../../../components/medicine/MedicineTypeIcon";
import { DoseHistoryList } from "../../../components/medicine/DoseHistoryList";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Colors, Spacing, Typography } from "../../../constants/design";
import { deleteMedicine } from "../../../lib/database/models/medicine";
import { getSchedulesByMedicineId } from "../../../lib/database/models/schedule";
import { getDosesByMedicineId } from "../../../lib/database/models/dose";
import { useMedicine } from "../../../lib/hooks/useMedicines";
import { Schedule } from "../../../types/database";
import { DoseWithMedicine } from "../../../types/medicine";

export default function MedicineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const { medicine, loading } = useMedicine(id);
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (id) {
      loadSchedulesAndDoses();
    }
  }, [id]);

  const loadSchedulesAndDoses = async () => {
    try {
      setLoadingSchedules(true);
      const [schedulesData, dosesData] = await Promise.all([
        getSchedulesByMedicineId(id),
        getDosesByMedicineId(id, 50), // Load last 50 doses
      ]);
      setSchedules(schedulesData);
      
      // Transform doses to include medicine info
      const dosesWithMedicine = dosesData.map((dose) => ({
        ...dose,
        medicine: medicine || {
          id: id,
          name: '',
          type: 'pill' as const,
          dosage: '',
          unit: '',
        },
      }));
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
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map((d: number) => dayNames[d]).join(', ');
    } catch {
      return null;
    }
  };

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
            <Image source={{ uri: medicine.image }} style={styles.medicineImage} />
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
                  <MedicineTypeIcon type={medicine.type} size={24} color="#FFFFFF" />
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
                    {schedule.time}
                  </Text>
                </View>
                {schedule.days_of_week && (
                  <View style={styles.scheduleRow}>
                    <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                    <Text style={[styles.scheduleDetail, { color: colors.textSecondary }]}>
                      {formatDaysOfWeek(schedule.days_of_week)}
                    </Text>
                  </View>
                )}
                {schedule.interval_hours && (
                  <View style={styles.scheduleRow}>
                    <Ionicons name="repeat" size={20} color={colors.textSecondary} />
                    <Text style={[styles.scheduleDetail, { color: colors.textSecondary }]}>
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

        {/* Dose History */}
        <Card style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Dose History
            </Text>
            <Button
              title={showHistory ? "Hide" : "Show"}
              onPress={() => setShowHistory(!showHistory)}
              variant="ghost"
              style={styles.toggleButton}
            />
          </View>
          {showHistory && (
            <View style={styles.historyContainer}>
              <DoseHistoryList
                doses={doses}
                showMedicineName={false}
              />
            </View>
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
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  medicineImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontStyle: 'italic',
  },
  notes: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  toggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  historyContainer: {
    minHeight: 200,
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
