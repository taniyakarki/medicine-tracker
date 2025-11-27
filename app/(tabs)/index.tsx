import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { Timeline, TimelineItem } from "../../components/ui/Timeline";
import {
  BorderRadius,
  Colors,
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
  getTimeUntil,
  isOverdue,
} from "../../lib/utils/date-helpers";
import { DoseWithMedicine } from "../../types/medicine";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

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
      Promise.all([
        refreshStats(),
        refreshDoses(),
        refreshActivity(),
        loadPastDoses(),
      ]);
    }, [refreshStats, refreshDoses, refreshActivity, loadPastDoses])
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

  const handleTakeDose = async (doseId: string) => {
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
  };

  const handleSkipDose = async (doseId: string) => {
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
  };

  const todayProgress =
    stats.todayTotal > 0 ? (stats.todayTaken / stats.todayTotal) * 100 : 0;

  const getStatusForDose = (dose: any): TimelineItem["status"] => {
    if (dose.status === "taken") return "taken";
    if (dose.status === "missed") return "missed";
    if (dose.status === "skipped") return "skipped";
    if (isOverdue(dose.scheduled_time)) return "overdue";
    return "scheduled";
  };

  const timelineItems: TimelineItem[] = upcomingDoses.map((dose) => ({
    id: dose.id,
    time: formatTime(new Date(dose.scheduled_time).toTimeString().slice(0, 5)),
    title: dose.medicine.name,
    subtitle: `${dose.medicine.dosage} ${dose.medicine.unit} • ${getTimeUntil(
      new Date(dose.scheduled_time)
    )}`,
    status: getStatusForDose(dose),
  }));

  const pastTimelineItems: TimelineItem[] = pastDoses.map((dose) => ({
    id: dose.id,
    time: formatTime(new Date(dose.scheduled_time).toTimeString().slice(0, 5)),
    title: dose.medicine.name,
    subtitle: `${dose.medicine.dosage} ${dose.medicine.unit} • ${getTimeUntil(
      new Date(dose.scheduled_time)
    )}`,
    status: getStatusForDose(dose),
  }));

  if (statsLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

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
        {/* Progress Section */}
        <Card style={styles.progressCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today&apos;s Progress
          </Text>
          <View style={styles.progressContent}>
            <ProgressRing progress={todayProgress} size={120} />
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {stats.todayTaken}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Taken
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: colors.textSecondary }]}
                >
                  {stats.todayTotal}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.danger }]}>
                  {stats.todayMissed}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Missed
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Card style={styles.quickStatCard}>
            <Ionicons name="flame" size={24} color={colors.warning} />
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {stats.currentStreak}
            </Text>
            <Text
              style={[styles.quickStatLabel, { color: colors.textSecondary }]}
            >
              Day Streak
            </Text>
          </Card>
          <Card style={styles.quickStatCard}>
            <Ionicons name="trending-up" size={24} color={colors.success} />
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {Math.round(stats.weeklyAdherence)}%
            </Text>
            <Text
              style={[styles.quickStatLabel, { color: colors.textSecondary }]}
            >
              Weekly
            </Text>
          </Card>
          <Card style={styles.quickStatCard}>
            <Ionicons name="medical" size={24} color={colors.primary} />
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {stats.activeMedicines}
            </Text>
            <Text
              style={[styles.quickStatLabel, { color: colors.textSecondary }]}
            >
              Active
            </Text>
          </Card>
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
            {activity.map((dose) => (
              <View key={dose.id} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityDot,
                      {
                        backgroundColor:
                          dose.status === "taken"
                            ? colors.success
                            : dose.status === "missed"
                            ? colors.danger
                            : colors.warning,
                      },
                    ]}
                  />
                  <View>
                    <Text
                      style={[styles.activityTitle, { color: colors.text }]}
                    >
                      {dose.medicine.name}
                    </Text>
                    <Text
                      style={[
                        styles.activityTime,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatDateTime(dose.taken_time || dose.scheduled_time)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.activityStatus,
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
                  {dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}
                </Text>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  progressCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  progressContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  progressStats: {
    gap: Spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  quickStats: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickStatCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  activityTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  activityTime: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  activityStatus: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
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
