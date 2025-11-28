import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState, useMemo } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { Timeline, TimelineItem } from "../../components/ui/Timeline";
import {
  BorderRadius,
  Colors,
  Gradients,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/design";
import {
  getPastPendingDoses,
  markDoseAsSkipped,
  markDoseAsTaken,
} from "../../lib/database/models/dose";
import { ensureUserExists } from "../../lib/database/models/user";
import {
  useMedicineStats,
  useRecentActivity,
  useUpcomingDoses,
} from "../../lib/hooks/useDoses";
import {
  formatDateTime,
  formatTime,
  getTimeAgo,
  getTimeUntil,
  isOverdue,
} from "../../lib/utils/date-helpers";
import { DoseWithMedicine } from "../../types/medicine";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const {
    stats,
    loading: statsLoading,
    refresh: refreshStats,
  } = useMedicineStats();
  const { doses: upcomingDoses, refresh: refreshDoses } = useUpcomingDoses(24);
  const { activity, refresh: refreshActivity } = useRecentActivity(5);
  const [pastDoses, setPastDoses] = useState<DoseWithMedicine[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  // Load past pending doses
  const loadPastDoses = useCallback(async () => {
    try {
      const user = await ensureUserExists();
      const doses = await getPastPendingDoses(user.id, 24);
      setPastDoses(doses);
    } catch (error) {
      console.error("Error loading past doses:", error);
    }
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshStats();
      refreshDoses();
      refreshActivity();
      loadPastDoses();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshStats(),
      refreshDoses(),
      refreshActivity(),
      loadPastDoses(),
    ]);
    setRefreshing(false);
  };

  const handleTakeDose = useCallback(async (doseId: string) => {
    try {
      // Optimistically update past doses list
      setPastDoses((prev) => prev.filter((dose) => dose.id !== doseId));

      // Mark dose as taken in database
      await markDoseAsTaken(doseId);

      // Refresh all data to ensure consistency
      await Promise.all([
        refreshStats(),
        refreshDoses(),
        refreshActivity(),
        loadPastDoses(),
      ]);

      Alert.alert("Success", "Dose marked as taken!");
    } catch (error) {
      console.error("Error marking dose as taken:", error);
      Alert.alert("Error", "Failed to mark dose as taken");

      // Reload data to revert optimistic update
      await loadPastDoses();
    }
  }, [refreshStats, refreshDoses, refreshActivity, loadPastDoses]);

  const handleSkipDose = useCallback(async (doseId: string) => {
    try {
      // Optimistically update past doses list
      setPastDoses((prev) => prev.filter((dose) => dose.id !== doseId));

      // Mark dose as skipped in database
      await markDoseAsSkipped(doseId);

      // Refresh all data to ensure consistency
      await Promise.all([
        refreshStats(),
        refreshDoses(),
        refreshActivity(),
        loadPastDoses(),
      ]);

      Alert.alert("Success", "Dose marked as skipped");
    } catch (error) {
      console.error("Error marking dose as skipped:", error);
      Alert.alert("Error", "Failed to mark dose as skipped");

      // Reload data to revert optimistic update
      await loadPastDoses();
    }
  }, [refreshStats, refreshDoses, refreshActivity, loadPastDoses]);

  const todayProgress = useMemo(
    () => (stats.todayTotal > 0 ? (stats.todayTaken / stats.todayTotal) * 100 : 0),
    [stats.todayTotal, stats.todayTaken]
  );

  const getStatusForDose = useCallback((dose: any): TimelineItem["status"] => {
    if (dose.status === "taken") return "taken";
    if (dose.status === "missed") return "missed";
    if (dose.status === "skipped") return "skipped";
    if (isOverdue(dose.scheduled_time)) return "overdue";
    return "scheduled";
  }, []);

  const timelineItems: TimelineItem[] = useMemo(
    () =>
      upcomingDoses.map((dose) => ({
        id: dose.id,
        time: formatTime(new Date(dose.scheduled_time).toTimeString().slice(0, 5)),
        title: dose.medicine.name,
        subtitle: `${dose.medicine.dosage} ${dose.medicine.unit} • ${getTimeUntil(
          new Date(dose.scheduled_time)
        )}`,
        status: getStatusForDose(dose),
      })),
    [upcomingDoses, getStatusForDose]
  );

  const pastTimelineItems: TimelineItem[] = useMemo(
    () =>
      pastDoses.map((dose) => ({
        id: dose.id,
        time: formatTime(new Date(dose.scheduled_time).toTimeString().slice(0, 5)),
        title: dose.medicine.name,
        subtitle: `${dose.medicine.dosage} ${dose.medicine.unit} • ${getTimeAgo(
          new Date(dose.scheduled_time)
        )}`,
        status: getStatusForDose(dose),
      })),
    [pastDoses, getStatusForDose]
  );

  if (statsLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        {/* Progress Section */}
        <View style={styles.progressCard}>
          <LinearGradient
            colors={
              colorScheme === "dark"
                ? Gradients.dark.progress
                : Gradients.light.progress
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1.2 }}
            locations={[0, 0.25, 0.5, 0.75, 1]}
            style={styles.gradientCard}
          >
            <View style={styles.progressHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>
                  Today&apos;s Progress
                </Text>
                <Text
                  style={[
                    styles.progressSubtitle,
                    { color: "rgba(255, 255, 255, 0.9)" },
                  ]}
                >
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.percentageBadge,
                  { backgroundColor: "rgba(255, 255, 255, 0.25)" },
                ]}
              >
                <Text style={[styles.percentageText, { color: "#FFFFFF" }]}>
                  {Math.round(todayProgress)}%
                </Text>
              </View>
            </View>

            <View style={styles.progressContent}>
              <ProgressRing 
                progress={todayProgress} 
                size={140} 
                showLabel={true}
                label="Today"
              />
              <View style={styles.progressStats}>
                <View
                  style={[
                    styles.statItem,
                    styles.statItemBordered,
                    { borderColor: "rgba(255, 255, 255, 0.3)" },
                  ]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: "rgba(255, 255, 255, 0.25)" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statValue, { color: "#FFFFFF" }]}>
                      {stats.todayTaken ?? 0}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: "rgba(255, 255, 255, 0.9)" },
                      ]}
                    >
                      Taken
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statItem,
                    styles.statItemBordered,
                    { borderColor: "rgba(255, 255, 255, 0.3)" },
                  ]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: "rgba(255, 255, 255, 0.25)" },
                    ]}
                  >
                    <Ionicons name="calendar" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statValue, { color: "#FFFFFF" }]}>
                      {stats.todayTotal ?? 0}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: "rgba(255, 255, 255, 0.9)" },
                      ]}
                    >
                      Scheduled
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statItem,
                    styles.statItemBordered,
                    { borderColor: "rgba(255, 255, 255, 0.3)" },
                  ]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: "rgba(255, 255, 255, 0.25)" },
                    ]}
                  >
                    <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statValue, { color: "#FFFFFF" }]}>
                      {stats.todayMissed ?? 0}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: "rgba(255, 255, 255, 0.9)" },
                      ]}
                    >
                      Missed
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarBackground,
                  { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: "#FFFFFF",
                      width: `${todayProgress}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressBarLabel,
                  { color: "rgba(255, 255, 255, 0.9)" },
                ]}
              >
                {stats.todayTaken ?? 0} of {stats.todayTotal ?? 0} doses
                completed
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? Gradients.dark.streak
                  : Gradients.light.streak
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 1]}
              style={styles.gradientQuickStat}
            >
              <Ionicons name="flame" size={24} color="#FFFFFF" />
              <Text style={[styles.quickStatValue, { color: "#FFFFFF" }]}>
                {stats.currentStreak ?? 0}
              </Text>
              <Text
                style={[
                  styles.quickStatLabel,
                  { color: "rgba(255, 255, 255, 0.9)" },
                ]}
              >
                Day Streak
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.quickStatCard}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? Gradients.dark.adherence
                  : Gradients.light.adherence
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 1]}
              style={styles.gradientQuickStat}
            >
              <Ionicons name="trending-up" size={24} color="#FFFFFF" />
              <Text style={[styles.quickStatValue, { color: "#FFFFFF" }]}>
                {Math.round(stats.weeklyAdherence ?? 0)}%
              </Text>
              <Text
                style={[
                  styles.quickStatLabel,
                  { color: "rgba(255, 255, 255, 0.9)" },
                ]}
              >
                Weekly
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.quickStatCard}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? Gradients.dark.active
                  : Gradients.light.active
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 1]}
              style={styles.gradientQuickStat}
            >
              <Ionicons name="medical" size={24} color="#FFFFFF" />
              <Text style={[styles.quickStatValue, { color: "#FFFFFF" }]}>
                {stats.activeMedicines ?? 0}
              </Text>
              <Text
                style={[
                  styles.quickStatLabel,
                  { color: "rgba(255, 255, 255, 0.9)" },
                ]}
              >
                Active
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Past Pending Doses */}
        {pastDoses.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Pending (Last 24h)
              </Text>
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>{pastDoses.length}</Text>
              </View>
            </View>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              These doses were scheduled in the past but haven&apos;t been
              marked as taken yet
            </Text>
            <Timeline
              items={pastTimelineItems}
              showActions={true}
              onTakeDose={handleTakeDose}
              onSkipDose={handleSkipDose}
            />
          </Card>
        )}

        {/* Upcoming Doses */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Upcoming (Next 24h)
            </Text>
          </View>
          {upcomingDoses.length === 0 ? (
            <EmptyState
              icon="checkmark-circle"
              title="All Caught Up!"
              description="No upcoming doses in the next 24 hours"
            />
          ) : (
            <Timeline
              items={timelineItems}
              showActions={true}
              onTakeDose={handleTakeDose}
              onSkipDose={handleSkipDose}
            />
          )}
        </Card>

        {/* Recent Activity */}
        {activity.length > 0 && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Activity
            </Text>
            {activity.map((dose, index) => (
              <View
                key={dose.id}
                style={[
                  styles.activityItem,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    marginBottom:
                      index < activity.length - 1 ? Spacing.sm : 0,
                  },
                ]}
              >
                <View
                  style={[
                    styles.activityIconContainer,
                    {
                      backgroundColor:
                        dose.status === "taken"
                          ? colors.success + "20"
                          : dose.status === "missed"
                          ? colors.danger + "20"
                          : colors.warning + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      dose.status === "taken"
                        ? "checkmark-circle"
                        : dose.status === "missed"
                        ? "close-circle"
                        : "time"
                    }
                    size={28}
                    color={
                      dose.status === "taken"
                        ? colors.success
                        : dose.status === "missed"
                        ? colors.danger
                        : colors.warning
                    }
                  />
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text
                      style={[styles.activityTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {dose.medicine.name}
                    </Text>
                    <View
                      style={[
                        styles.activityStatusBadge,
                        {
                          backgroundColor:
                            dose.status === "taken"
                              ? colors.success + "20"
                              : dose.status === "missed"
                              ? colors.danger + "20"
                              : colors.warning + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.activityStatusText,
                          {
                            color:
                              dose.status === "taken"
                                ? colors.success
                                : dose.status === "missed"
                                ? colors.danger
                                : colors.warning,
                          },
                        ]}
                      >
                        {dose.status.charAt(0).toUpperCase() +
                          dose.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activityDetails}>
                    <View style={styles.activityDetailRow}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.activityDetailText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Scheduled:{" "}
                        {formatTime(
                          new Date(dose.scheduled_time)
                            .toTimeString()
                            .slice(0, 5)
                        )}
                      </Text>
                    </View>
                    {dose.status !== "missed" && dose.taken_time && (
                      <View style={styles.activityDetailRow}>
                        <Ionicons
                          name="checkmark-done-outline"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.activityDetailText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {dose.status === "taken" ? "Taken" : "Marked"}:{" "}
                          {formatDateTime(dose.taken_time)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </Card>
        )}
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
  progressCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.lg,
  },
  gradientCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  progressSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  percentageBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  percentageText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  progressContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  progressStats: {
    flex: 1,
    gap: Spacing.sm,
    marginLeft: Spacing.lg,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statItemBordered: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  progressBarContainer: {
    gap: Spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressBarLabel: {
    fontSize: Typography.fontSize.xs,
    textAlign: "center",
  },
  quickStats: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.md,
  },
  gradientQuickStat: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  quickStatValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  quickStatLabel: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
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
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  activityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  activityTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  activityStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  activityStatusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  activityDetails: {
    gap: 4,
  },
  activityDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityDetailText: {
    fontSize: Typography.fontSize.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
});
