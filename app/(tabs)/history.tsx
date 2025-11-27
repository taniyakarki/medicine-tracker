import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { DatePicker } from "../../components/ui/DatePicker";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { Select, SelectOption } from "../../components/ui/Select";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../constants/design";
import {
  getDosesInDateRange,
  markDoseAsMissed,
  markDoseAsSkipped,
  markDoseAsTaken,
} from "../../lib/database/models/dose";
import { ensureUserExists } from "../../lib/database/models/user";
import { useMedicineStats } from "../../lib/hooks/useDoses";
import { formatDate, formatDateTime } from "../../lib/utils/date-helpers";
import { DoseWithMedicine } from "../../types/medicine";

type DateRangeType = "today" | "week" | "month" | "custom";

const dateRangeOptions: SelectOption[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Custom Range", value: "custom" },
];

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { stats, loading, refresh } = useMedicineStats();
  const [refreshing, setRefreshing] = useState(false);

  // Date range filter state
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loadingDoses, setLoadingDoses] = useState(false);

  // Status change modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState<DoseWithMedicine | null>(
    null
  );

  // Calculate date range based on type
  const getDateRange = useCallback(() => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (dateRangeType) {
      case "today":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        break;
      case "custom":
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        } else {
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
        }
        break;
      default:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }, [dateRangeType, startDate, endDate]);

  // Load doses for the selected date range
  const loadDoses = useCallback(async () => {
    try {
      setLoadingDoses(true);
      const user = await ensureUserExists();
      const { start, end } = getDateRange();
      const dosesData = await getDosesInDateRange(user.id, start, end);

      // Sort doses by date and time (most recent first)
      const sortedDoses = dosesData.sort((a, b) => {
        const timeA = new Date(a.taken_time || a.scheduled_time).getTime();
        const timeB = new Date(b.taken_time || b.scheduled_time).getTime();
        return timeB - timeA; // Descending order (newest first)
      });

      setDoses(sortedDoses);
    } catch (error) {
      console.error("Error loading doses:", error);
    } finally {
      setLoadingDoses(false);
    }
  }, [getDateRange]);

  // Load doses when date range changes
  useEffect(() => {
    loadDoses();
  }, [loadDoses]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
      loadDoses();
    }, [refresh, loadDoses])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadDoses()]);
    setRefreshing(false);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRangeType(value as DateRangeType);
    if (value === "custom") {
      setShowDatePicker(true);
    }
  };

  const handleApplyCustomDates = () => {
    setShowDatePicker(false);
    loadDoses();
  };

  const handleDosePress = (dose: DoseWithMedicine) => {
    setSelectedDose(dose);
    setShowStatusModal(true);
  };

  const handleChangeStatus = async (
    newStatus: "taken" | "missed" | "skipped"
  ) => {
    if (!selectedDose) return;

    // Store original dose for potential rollback
    const originalDose = selectedDose;

    try {
      // Optimistically update the dose in the list
      setDoses((prevDoses) =>
        prevDoses.map((dose) =>
          dose.id === selectedDose.id
            ? { ...dose, status: newStatus as any }
            : dose
        )
      );

      // Close modal first for better UX
      setShowStatusModal(false);
      setSelectedDose(null);

      // Update dose status in database
      if (newStatus === "taken") {
        await markDoseAsTaken(originalDose.id);
      } else if (newStatus === "missed") {
        await markDoseAsMissed(originalDose.id);
      } else if (newStatus === "skipped") {
        await markDoseAsSkipped(originalDose.id);
      }

      // Refresh all data to ensure consistency
      await Promise.all([refresh(), loadDoses()]);

      Alert.alert("Success", `Dose marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating dose status:", error);
      Alert.alert("Error", "Failed to update dose status");

      // Rollback optimistic update by reloading data
      await loadDoses();

      // Close modal even on error
      setShowStatusModal(false);
      setSelectedDose(null);
    }
  };

  // Calculate stats for the selected period
  const calculatePeriodStats = () => {
    const total = doses.length;
    const taken = doses.filter((d) => d.status === "taken").length;
    const missed = doses.filter((d) => d.status === "missed").length;
    const skipped = doses.filter((d) => d.status === "skipped").length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { total, taken, missed, skipped, adherence };
  };

  const periodStats = calculatePeriodStats();

  // Group doses by date
  const groupDosesByDate = () => {
    const grouped: { [key: string]: DoseWithMedicine[] } = {};

    doses.forEach((dose) => {
      const date = new Date(dose.taken_time || dose.scheduled_time);
      const dateKey = formatDate(date.toISOString());

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(dose);
    });

    return grouped;
  };

  const groupedDoses = groupDosesByDate();

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  const adherencePercentage = periodStats.adherence;
  const getAdherenceColor = () => {
    if (adherencePercentage >= 80) return colors.success;
    if (adherencePercentage >= 50) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top > 0 ? insets.top : Spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Date Range Filter */}
        <Card style={styles.section}>
          <View style={styles.filterHeader}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.filterTitle, { color: colors.text }]}>
              View History
            </Text>
          </View>

          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Select a time period to view your medication history and adherence
            statistics
          </Text>

          <Select
            value={dateRangeType}
            options={dateRangeOptions}
            onSelect={handleDateRangeChange}
          />

          {dateRangeType === "custom" && (
            <TouchableOpacity
              style={[
                styles.customDateButton,
                { backgroundColor: colors.surfaceSecondary },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.customDateText, { color: colors.text }]}>
                {startDate && endDate
                  ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                  : "Select Date Range"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </Card>

        {/* Period Overview */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {dateRangeType === "today"
              ? "Today's Overview"
              : dateRangeType === "week"
              ? "Weekly Overview"
              : dateRangeType === "month"
              ? "Monthly Overview"
              : "Period Overview"}
          </Text>

          <View style={styles.adherenceContainer}>
            <View
              style={[
                styles.adherenceCircle,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Text
                style={[styles.adherenceValue, { color: getAdherenceColor() }]}
              >
                {adherencePercentage}%
              </Text>
              <Text
                style={[styles.adherenceLabel, { color: colors.textSecondary }]}
              >
                Adherence
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statBox,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.success}
              />
              <Text style={[styles.statBoxValue, { color: colors.text }]}>
                {periodStats.taken}
              </Text>
              <Text
                style={[styles.statBoxLabel, { color: colors.textSecondary }]}
              >
                Taken
              </Text>
            </View>
            <View
              style={[
                styles.statBox,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Ionicons name="close-circle" size={24} color={colors.danger} />
              <Text style={[styles.statBoxValue, { color: colors.text }]}>
                {periodStats.missed}
              </Text>
              <Text
                style={[styles.statBoxLabel, { color: colors.textSecondary }]}
              >
                Missed
              </Text>
            </View>
            <View
              style={[
                styles.statBox,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Ionicons name="medical" size={24} color={colors.primary} />
              <Text style={[styles.statBoxValue, { color: colors.text }]}>
                {periodStats.total}
              </Text>
              <Text
                style={[styles.statBoxLabel, { color: colors.textSecondary }]}
              >
                Total
              </Text>
            </View>
          </View>
        </Card>

        {/* Dose History */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Dose History
            </Text>
            {loadingDoses && <LoadingSpinner />}
          </View>
          {doses.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No doses found for the selected period
            </Text>
          ) : (
            <View>
              {Object.keys(groupedDoses).map((dateKey, index) => (
                <View key={dateKey}>
                  {/* Date Header */}
                  <View
                    style={[
                      styles.dateHeader,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        marginTop: index > 0 ? Spacing.lg : 0,
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.dateHeaderText, { color: colors.text }]}
                    >
                      {dateKey}
                    </Text>
                    <View
                      style={[
                        styles.dateHeaderBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.dateHeaderBadgeText}>
                        {groupedDoses[dateKey].length}
                      </Text>
                    </View>
                  </View>

                  {/* Doses for this date */}
                  {groupedDoses[dateKey].map((dose, doseIndex) => (
                    <TouchableOpacity
                      key={dose.id}
                      style={[
                        styles.doseItem,
                        {
                          borderBottomColor: colors.border,
                          borderBottomWidth:
                            doseIndex === groupedDoses[dateKey].length - 1
                              ? 0
                              : 1,
                        },
                      ]}
                      onPress={() => handleDosePress(dose)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.doseLeft}>
                        <Ionicons
                          name={
                            dose.status === "taken"
                              ? "checkmark-circle"
                              : dose.status === "missed"
                              ? "close-circle"
                              : dose.status === "skipped"
                              ? "remove-circle"
                              : "time"
                          }
                          size={24}
                          color={
                            dose.status === "taken"
                              ? colors.success
                              : dose.status === "missed"
                              ? colors.danger
                              : dose.status === "skipped"
                              ? colors.warning
                              : colors.textSecondary
                          }
                        />
                        <View style={styles.doseInfo}>
                          <Text
                            style={[styles.doseName, { color: colors.text }]}
                          >
                            {dose.medicine.name}
                          </Text>
                          <Text
                            style={[
                              styles.doseDosage,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {dose.medicine.dosage} {dose.medicine.unit}
                          </Text>
                          <Text
                            style={[
                              styles.doseTime,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {new Date(
                              dose.taken_time || dose.scheduled_time
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.doseRight}>
                        <Text
                          style={[
                            styles.doseStatus,
                            {
                              color:
                                dose.status === "taken"
                                  ? colors.success
                                  : dose.status === "missed"
                                  ? colors.danger
                                  : dose.status === "skipped"
                                  ? colors.warning
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {dose.status.charAt(0).toUpperCase() +
                            dose.status.slice(1)}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Insights */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Insights
          </Text>
          <View style={styles.insightItem}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {adherencePercentage >= 80
                ? "Great job! You're maintaining excellent adherence."
                : adherencePercentage >= 50
                ? "Keep it up! Try to improve your consistency."
                : "Consider setting more reminders to improve adherence."}
            </Text>
          </View>
          {stats.currentStreak > 0 && (
            <View style={styles.insightItem}>
              <Ionicons name="flame" size={20} color={colors.warning} />
              <Text
                style={[styles.insightText, { color: colors.textSecondary }]}
              >
                You&apos;re on a {stats.currentStreak} day streak!
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Custom Date Range Modal */}
      <Modal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        title="Select Date Range"
      >
        <View style={styles.datePickerContainer}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            placeholder="Select start date"
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            placeholder="Select end date"
            minimumDate={startDate ? new Date(startDate) : undefined}
          />
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApplyCustomDates}
            disabled={!startDate || !endDate}
          >
            <Text style={styles.applyButtonText}>Apply Date Range</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        visible={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedDose(null);
        }}
        title="Change Dose Status"
      >
        {selectedDose && (
          <View style={styles.statusModalContent}>
            <View
              style={[
                styles.doseDetailsCard,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Ionicons
                  name="medical"
                  size={24}
                  color={colors.primary}
                  style={styles.modalIcon}
                />
                <View style={styles.modalHeaderText}>
                  <Text
                    style={[styles.modalMedicineName, { color: colors.text }]}
                  >
                    {selectedDose.medicine.name}
                  </Text>
                  <Text
                    style={[
                      styles.modalDosage,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedDose.medicine.dosage} {selectedDose.medicine.unit}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.modalTimeContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.modalTime, { color: colors.textSecondary }]}
                >
                  {formatDateTime(
                    selectedDose.taken_time || selectedDose.scheduled_time
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.currentStatusBadge,
                  {
                    backgroundColor:
                      selectedDose.status === "taken"
                        ? `${colors.success}15`
                        : selectedDose.status === "missed"
                        ? `${colors.danger}15`
                        : `${colors.warning}15`,
                  },
                ]}
              >
                <Ionicons
                  name={
                    selectedDose.status === "taken"
                      ? "checkmark-circle"
                      : selectedDose.status === "missed"
                      ? "close-circle"
                      : "remove-circle"
                  }
                  size={20}
                  color={
                    selectedDose.status === "taken"
                      ? colors.success
                      : selectedDose.status === "missed"
                      ? colors.danger
                      : colors.warning
                  }
                />
                <Text
                  style={[
                    styles.currentStatusLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Current Status:
                </Text>
                <Text
                  style={[
                    styles.currentStatusValue,
                    {
                      color:
                        selectedDose.status === "taken"
                          ? colors.success
                          : selectedDose.status === "missed"
                          ? colors.danger
                          : colors.warning,
                    },
                  ]}
                >
                  {selectedDose.status.charAt(0).toUpperCase() +
                    selectedDose.status.slice(1)}
                </Text>
              </View>
            </View>

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <Text style={[styles.statusModalTitle, { color: colors.text }]}>
              Change Status To:
            </Text>

            <View style={styles.statusOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  {
                    backgroundColor:
                      selectedDose.status === "taken"
                        ? `${colors.success}20`
                        : colors.surfaceSecondary,
                    borderColor:
                      selectedDose.status === "taken"
                        ? colors.success
                        : colors.border,
                    opacity: selectedDose.status === "taken" ? 0.6 : 1,
                  },
                ]}
                onPress={() => handleChangeStatus("taken")}
                disabled={selectedDose.status === "taken"}
                activeOpacity={0.7}
              >
                <View style={styles.statusOptionLeft}>
                  <View
                    style={[
                      styles.statusIconContainer,
                      { backgroundColor: `${colors.success}20` },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.success}
                    />
                  </View>
                  <View>
                    <Text
                      style={[styles.statusOptionText, { color: colors.text }]}
                    >
                      Taken
                    </Text>
                    <Text
                      style={[
                        styles.statusOptionSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Medicine was consumed
                    </Text>
                  </View>
                </View>
                {selectedDose.status === "taken" && (
                  <View
                    style={[
                      styles.currentBadge,
                      { backgroundColor: colors.success },
                    ]}
                  >
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  {
                    backgroundColor:
                      selectedDose.status === "missed"
                        ? `${colors.danger}20`
                        : colors.surfaceSecondary,
                    borderColor:
                      selectedDose.status === "missed"
                        ? colors.danger
                        : colors.border,
                    opacity: selectedDose.status === "missed" ? 0.6 : 1,
                  },
                ]}
                onPress={() => handleChangeStatus("missed")}
                disabled={selectedDose.status === "missed"}
                activeOpacity={0.7}
              >
                <View style={styles.statusOptionLeft}>
                  <View
                    style={[
                      styles.statusIconContainer,
                      { backgroundColor: `${colors.danger}20` },
                    ]}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={colors.danger}
                    />
                  </View>
                  <View>
                    <Text
                      style={[styles.statusOptionText, { color: colors.text }]}
                    >
                      Missed
                    </Text>
                    <Text
                      style={[
                        styles.statusOptionSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Forgot to take medicine
                    </Text>
                  </View>
                </View>
                {selectedDose.status === "missed" && (
                  <View
                    style={[
                      styles.currentBadge,
                      { backgroundColor: colors.danger },
                    ]}
                  >
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  {
                    backgroundColor:
                      selectedDose.status === "skipped"
                        ? `${colors.warning}20`
                        : colors.surfaceSecondary,
                    borderColor:
                      selectedDose.status === "skipped"
                        ? colors.warning
                        : colors.border,
                    opacity: selectedDose.status === "skipped" ? 0.6 : 1,
                  },
                ]}
                onPress={() => handleChangeStatus("skipped")}
                disabled={selectedDose.status === "skipped"}
                activeOpacity={0.7}
              >
                <View style={styles.statusOptionLeft}>
                  <View
                    style={[
                      styles.statusIconContainer,
                      { backgroundColor: `${colors.warning}20` },
                    ]}
                  >
                    <Ionicons
                      name="remove-circle"
                      size={24}
                      color={colors.warning}
                    />
                  </View>
                  <View>
                    <Text
                      style={[styles.statusOptionText, { color: colors.text }]}
                    >
                      Skipped
                    </Text>
                    <Text
                      style={[
                        styles.statusOptionSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Intentionally not taken
                    </Text>
                  </View>
                </View>
                {selectedDose.status === "skipped" && (
                  <View
                    style={[
                      styles.currentBadge,
                      { backgroundColor: colors.warning },
                    ]}
                  >
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  customDateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  customDateText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
  },
  datePickerContainer: {
    gap: Spacing.md,
  },
  applyButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  adherenceContainer: {
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  adherenceCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  adherenceValue: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  adherenceLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statBoxValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  statBoxLabel: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    padding: Spacing.lg,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  dateHeaderText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  dateHeaderBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dateHeaderBadgeText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  doseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  doseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doseInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  doseName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  doseDosage: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  doseStatus: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  doseTime: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  doseRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  insightText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  statusModalContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  doseDetailsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalIcon: {
    marginRight: Spacing.md,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalMedicineName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  modalDosage: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.xs,
  },
  modalTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  modalTime: {
    fontSize: Typography.fontSize.sm,
  },
  currentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  currentStatusLabel: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  currentStatusValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  statusModalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  statusOptionsContainer: {
    gap: Spacing.md,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  statusOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statusOptionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusOptionSubtext: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  currentBadgeText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
});
