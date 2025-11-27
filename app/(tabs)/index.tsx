import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';
import { useColorScheme } from 'react-native';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useMedicineStats, useUpcomingDoses, useRecentActivity, useDoseActions } from '../../lib/hooks/useDoses';
import { formatTime, formatDateTime, getTimeUntil, isOverdue, isUpcomingSoon } from '../../lib/utils/date-helpers';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { stats, loading: statsLoading, refresh: refreshStats } = useMedicineStats();
  const { doses: upcomingDoses, loading: dosesLoading, refresh: refreshDoses } = useUpcomingDoses(24);
  const { activity, loading: activityLoading, refresh: refreshActivity } = useRecentActivity(5);
  const { markAsTaken } = useDoseActions();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStats(), refreshDoses(), refreshActivity()]);
    setRefreshing(false);
  };

  const handleMarkAsTaken = async (doseId: string) => {
    try {
      await markAsTaken(doseId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await handleRefresh();
    } catch (error) {
      console.error('Error marking dose as taken:', error);
    }
  };

  const todayProgress = stats.todayTotal > 0 ? (stats.todayTaken / stats.todayTotal) * 100 : 0;

  const getStatusForDose = (dose: any): TimelineItem['status'] => {
    if (dose.status === 'taken') return 'taken';
    if (dose.status === 'missed') return 'missed';
    if (dose.status === 'skipped') return 'skipped';
    if (isOverdue(dose.scheduled_time)) return 'overdue';
    return 'scheduled';
  };

  const timelineItems: TimelineItem[] = upcomingDoses.map((dose) => ({
    id: dose.id,
    time: formatTime(new Date(dose.scheduled_time).toTimeString().slice(0, 5)),
    title: dose.medicine.name,
    subtitle: `${dose.medicine.dosage} ${dose.medicine.unit} • ${getTimeUntil(new Date(dose.scheduled_time))}`,
    status: getStatusForDose(dose),
  }));

  if (statsLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Progress Section */}
        <Card style={styles.progressCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Progress</Text>
          <View style={styles.progressContent}>
            <ProgressRing progress={todayProgress} size={120} />
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>{stats.todayTaken}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Taken</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.textSecondary }]}>{stats.todayTotal}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.danger }]}>{stats.todayMissed}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Missed</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Card style={styles.quickStatCard}>
            <Ionicons name="flame" size={24} color={colors.warning} />
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{stats.currentStreak}</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </Card>
          <Card style={styles.quickStatCard}>
            <Ionicons name="trending-up" size={24} color={colors.success} />
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {Math.round(stats.weeklyAdherence)}%
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Weekly</Text>
          </Card>
          <Card style={styles.quickStatCard}>
            <Ionicons name="medical" size={24} color={colors.primary} />
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{stats.activeMedicines}</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Active</Text>
          </Card>
        </View>

        {/* Upcoming Doses */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming (Next 24h)</Text>
          </View>
          {upcomingDoses.length === 0 ? (
            <EmptyState
              icon="checkmark-circle"
              title="All Caught Up!"
              description="No upcoming doses in the next 24 hours"
            />
          ) : (
            <Timeline items={timelineItems} />
          )}
        </Card>

        {/* Recent Activity */}
        {activity.length > 0 && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            {activity.map((dose) => (
              <View key={dose.id} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityDot,
                      {
                        backgroundColor:
                          dose.status === 'taken'
                            ? colors.success
                            : dose.status === 'missed'
                            ? colors.danger
                            : colors.warning,
                      },
                    ]}
                  />
                  <View>
                    <Text style={[styles.activityTitle, { color: colors.text }]}>
                      {dose.medicine.name}
                    </Text>
                    <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                      {formatDateTime(dose.taken_time || dose.scheduled_time)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.activityStatus,
                    {
                      color:
                        dose.status === 'taken'
                          ? colors.success
                          : dose.status === 'missed'
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
    padding: Spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  progressStats: {
    gap: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

