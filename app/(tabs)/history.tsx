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
  View,
} from "react-native";
import { Calendar } from "../../components/ui/Calendar";
import { Card } from "../../components/ui/Card";
import { DatePicker } from "../../components/ui/DatePicker";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { Select, SelectOption } from "../../components/ui/Select";
import {
  BarChart,
  BarChartData,
  LineChart,
  LineChartData,
  PieChart,
  PieChartData,
} from "../../components/ui/Charts";
import {
  BorderRadius,
  Spacing,
  Typography,
} from "../../constants/design";
import { useTheme } from "../../lib/context/AppContext";
import {
  getDosesInDateRange,
  markDoseAsMissed,
  markDoseAsSkipped,
  markDoseAsTaken,
} from "../../lib/database/models/dose";
import { getActiveMedicines } from "../../lib/database/models/medicine";
import { ensureUserExists } from "../../lib/database/models/user";
import { useCalendarData, useMedicineStats } from "../../lib/hooks/useDoses";
import { formatDate, formatDateTime } from "../../lib/utils/date-helpers";
import {
  exportDosesAsCSV,
  exportMedicinesAsCSV,
  generateTextReport,
} from "../../lib/utils/export-helpers";
import { DoseWithMedicine } from "../../types/medicine";

type ViewMode = "list" | "calendar" | "charts";
type DateRangeType = "today" | "week" | "month" | "custom";

const dateRangeOptions: SelectOption[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Custom Range", value: "custom" },
];

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { stats, loading, refresh } = useMedicineStats();
  const [refreshing, setRefreshing] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Date range filter state
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loadingDoses, setLoadingDoses] = useState(false);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const { data: calendarData, loading: calendarLoading } =
    useCalendarData(calendarMonth);

  // Status change modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState<DoseWithMedicine | null>(
    null
  );

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRangeType, startDate, endDate]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
      loadDoses();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
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

    try {
      setShowStatusModal(false);
      setSelectedDose(null);

      if (newStatus === "taken") {
        await markDoseAsTaken(selectedDose.id);
      } else if (newStatus === "missed") {
        await markDoseAsMissed(selectedDose.id);
      } else if (newStatus === "skipped") {
        await markDoseAsSkipped(selectedDose.id);
      }

      await Promise.all([refresh(), loadDoses()]);
      Alert.alert("Success", `Dose marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating dose status:", error);
      Alert.alert("Error", "Failed to update dose status");
      await loadDoses();
    }
  };

  const handleCalendarDayPress = (date: string) => {
    setSelectedDate(date);
    // Switch to list view and set custom date range
    setViewMode("list");
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    setStartDate(selectedDay.toISOString());
    setEndDate(endOfDay.toISOString());
    setDateRangeType("custom");
  };

  const handleExport = async (type: "csv" | "report" | "medicines") => {
    try {
      setExporting(true);
      const user = await ensureUserExists();

      if (type === "csv") {
        await exportDosesAsCSV(doses, "dose_history.csv");
        Alert.alert("Success", "Dose history exported successfully");
      } else if (type === "medicines") {
        const medicines = await getActiveMedicines(user.id);
        await exportMedicinesAsCSV(medicines, "medicines.csv");
        Alert.alert("Success", "Medicines exported successfully");
      } else if (type === "report") {
        const medicines = await getActiveMedicines(user.id);
        const { start, end } = getDateRange();
        await generateTextReport(stats, doses, medicines, start, end);
        Alert.alert("Success", "Report generated successfully");
      }

      setShowExportModal(false);
    } catch (error) {
      console.error("Error exporting:", error);
      Alert.alert("Error", "Failed to export data");
    } finally {
      setExporting(false);
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

  // Prepare chart data
  const prepareWeeklyChartData = (): LineChartData[] => {
    const weekData: { [key: string]: { taken: number; total: number } } = {};

    doses.forEach((dose) => {
      const date = new Date(dose.taken_time || dose.scheduled_time);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      if (!weekData[dayName]) {
        weekData[dayName] = { taken: 0, total: 0 };
      }

      weekData[dayName].total++;
      if (dose.status === "taken") {
        weekData[dayName].taken++;
      }
    });

    const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysOrder.map((day) => ({
      label: day,
      value: weekData[day]
        ? Math.round((weekData[day].taken / weekData[day].total) * 100)
        : 0,
    }));
  };

  const prepareStatusChartData = (): PieChartData[] => {
    return [
      {
        label: "Taken",
        value: periodStats.taken,
        color: colors.success,
      },
      {
        label: "Missed",
        value: periodStats.missed,
        color: colors.danger,
      },
      {
        label: "Skipped",
        value: periodStats.skipped,
        color: colors.warning,
      },
    ].filter((item) => item.value > 0);
  };

  const prepareMedicineChartData = (): BarChartData[] => {
    const medicineStats: {
      [key: string]: { taken: number; total: number; color?: string };
    } = {};

    doses.forEach((dose) => {
      const medicineName = dose.medicine.name;
      if (!medicineStats[medicineName]) {
        medicineStats[medicineName] = {
          taken: 0,
          total: 0,
          color: dose.medicine.color || colors.primary,
        };
      }

      medicineStats[medicineName].total++;
      if (dose.status === "taken") {
        medicineStats[medicineName].taken++;
      }
    });

    return Object.entries(medicineStats)
      .map(([name, data]) => ({
        label: name.length > 10 ? name.substring(0, 10) + "..." : name,
        value: Math.round((data.taken / data.total) * 100),
        color: data.color,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 medicines
  };

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
      {/* View Mode Tabs */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            viewMode === "list" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setViewMode("list")}
        >
          <Ionicons
            name="list"
            size={20}
            color={viewMode === "list" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  viewMode === "list" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            viewMode === "calendar" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setViewMode("calendar")}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={
              viewMode === "calendar" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  viewMode === "calendar"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            viewMode === "charts" && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setViewMode("charts")}
        >
          <Ionicons
            name="bar-chart"
            size={20}
            color={
              viewMode === "charts" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  viewMode === "charts" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Charts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => setShowExportModal(true)}
        >
          <Ionicons name="download-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* List View */}
        {viewMode === "list" && (
          <>
            {/* Date Range Filter */}
            <Card style={styles.section}>
              <View style={styles.filterHeader}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <Text style={[styles.filterTitle, { color: colors.text }]}>
                  View History
                </Text>
              </View>

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
                    style={[
                      styles.adherenceValue,
                      { color: getAdherenceColor() },
                    ]}
                  >
                    {adherencePercentage}%
                  </Text>
                  <Text
                    style={[
                      styles.adherenceLabel,
                      { color: colors.textSecondary },
                    ]}
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
                    style={[
                      styles.statBoxLabel,
                      { color: colors.textSecondary },
                    ]}
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
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={colors.danger}
                  />
                  <Text style={[styles.statBoxValue, { color: colors.text }]}>
                    {periodStats.missed}
                  </Text>
                  <Text
                    style={[
                      styles.statBoxLabel,
                      { color: colors.textSecondary },
                    ]}
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
                    style={[
                      styles.statBoxLabel,
                      { color: colors.textSecondary },
                    ]}
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
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No doses found for the selected period
                </Text>
              ) : (
                <View>
                  {Object.keys(groupedDoses).map((dateKey, index) => (
                    <View key={dateKey}>
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
                          style={[
                            styles.dateHeaderText,
                            { color: colors.text },
                          ]}
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
                                style={[
                                  styles.doseName,
                                  { color: colors.text },
                                ]}
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
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={colors.info}
                />
                <Text
                  style={[styles.insightText, { color: colors.textSecondary }]}
                >
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
                    style={[
                      styles.insightText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    You&apos;re on a {stats.currentStreak} day streak!
                  </Text>
                </View>
              )}
            </Card>
          </>
        )}

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Monthly Calendar
            </Text>
            <Text
              style={[styles.helperText, { color: colors.textSecondary }]}
            >
              Tap any day to view detailed dose history
            </Text>

            {calendarLoading ? (
              <LoadingSpinner />
            ) : (
              <Calendar
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                dayData={calendarData}
                onDayPress={handleCalendarDayPress}
                selectedDate={selectedDate}
              />
            )}
          </Card>
        )}

        {/* Charts View */}
        {viewMode === "charts" && (
          <>
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Statistics & Insights
              </Text>

              {doses.length === 0 ? (
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No data available for charts. Take some doses to see
                  statistics!
                </Text>
              ) : (
                <>
                  {/* Weekly Adherence Trend */}
                  {dateRangeType === "week" && (
                    <LineChart
                      data={prepareWeeklyChartData()}
                      title="Weekly Adherence Trend"
                      maxValue={100}
                      color={colors.primary}
                    />
                  )}

                  {/* Status Distribution */}
                  {prepareStatusChartData().length > 0 && (
                    <PieChart
                      data={prepareStatusChartData()}
                      title="Dose Status Distribution"
                    />
                  )}

                  {/* Medicine Adherence Comparison */}
                  {prepareMedicineChartData().length > 0 && (
                    <BarChart
                      data={prepareMedicineChartData()}
                      title="Medicine Adherence (Top 5)"
                      maxValue={100}
                    />
                  )}
                </>
              )}
            </Card>
          </>
        )}
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
              <Text style={[styles.modalMedicineName, { color: colors.text }]}>
                {selectedDose.medicine.name}
              </Text>
              <Text
                style={[styles.modalDosage, { color: colors.textSecondary }]}
              >
                {selectedDose.medicine.dosage} {selectedDose.medicine.unit}
              </Text>
              <Text
                style={[styles.modalTime, { color: colors.textSecondary }]}
              >
                {formatDateTime(
                  selectedDose.taken_time || selectedDose.scheduled_time
                )}
              </Text>
            </View>

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
                  },
                ]}
                onPress={() => handleChangeStatus("taken")}
                disabled={selectedDose.status === "taken"}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={[styles.statusOptionText, { color: colors.text }]}>
                  Taken
                </Text>
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
                  },
                ]}
                onPress={() => handleChangeStatus("missed")}
                disabled={selectedDose.status === "missed"}
              >
                <Ionicons name="close-circle" size={24} color={colors.danger} />
                <Text style={[styles.statusOptionText, { color: colors.text }]}>
                  Missed
                </Text>
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
                  },
                ]}
                onPress={() => handleChangeStatus("skipped")}
                disabled={selectedDose.status === "skipped"}
              >
                <Ionicons
                  name="remove-circle"
                  size={24}
                  color={colors.warning}
                />
                <Text style={[styles.statusOptionText, { color: colors.text }]}>
                  Skipped
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data"
      >
        <View style={styles.exportModalContent}>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Choose what you&apos;d like to export
          </Text>

          <TouchableOpacity
            style={[
              styles.exportOption,
              { backgroundColor: colors.surfaceSecondary },
            ]}
            onPress={() => handleExport("csv")}
            disabled={exporting}
          >
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <View style={styles.exportOptionText}>
              <Text style={[styles.exportOptionTitle, { color: colors.text }]}>
                Dose History (CSV)
              </Text>
              <Text
                style={[
                  styles.exportOptionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Export current dose history as CSV file
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.exportOption,
              { backgroundColor: colors.surfaceSecondary },
            ]}
            onPress={() => handleExport("medicines")}
            disabled={exporting}
          >
            <Ionicons name="medical" size={24} color={colors.primary} />
            <View style={styles.exportOptionText}>
              <Text style={[styles.exportOptionTitle, { color: colors.text }]}>
                Medicines (CSV)
              </Text>
              <Text
                style={[
                  styles.exportOptionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Export your medicine list as CSV file
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.exportOption,
              { backgroundColor: colors.surfaceSecondary },
            ]}
            onPress={() => handleExport("report")}
            disabled={exporting}
          >
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
            <View style={styles.exportOptionText}>
              <Text style={[styles.exportOptionTitle, { color: colors.text }]}>
                Full Report (TXT)
              </Text>
              <Text
                style={[
                  styles.exportOptionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Generate comprehensive text report
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {exporting && <LoadingSpinner />}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  exportButton: {
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
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
  },
  doseDetailsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  modalMedicineName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  modalDosage: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.xs,
  },
  modalTime: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  statusOptionsContainer: {
    gap: Spacing.md,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  exportModalContent: {
    gap: Spacing.md,
  },
  exportOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  exportOptionText: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  exportOptionSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
});

