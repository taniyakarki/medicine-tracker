import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';
import { useColorScheme } from 'react-native';
import { Card } from '../../components/ui/Card';
import { useMedicineStats, useTodayDoses } from '../../lib/hooks/useDoses';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../lib/utils/date-helpers';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { stats, loading, refresh } = useMedicineStats();
  const { doses } = useTodayDoses();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  const adherencePercentage = Math.round(stats.weeklyAdherence);
  const getAdherenceColor = () => {
    if (adherencePercentage >= 80) return colors.success;
    if (adherencePercentage >= 50) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Weekly Overview */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Overview</Text>
          
          <View style={styles.adherenceContainer}>
            <View style={styles.adherenceCircle}>
              <Text style={[styles.adherenceValue, { color: getAdherenceColor() }]}>
                {adherencePercentage}%
              </Text>
              <Text style={[styles.adherenceLabel, { color: colors.textSecondary }]}>
                Adherence
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={[styles.statBoxValue, { color: colors.text }]}>{stats.todayTaken}</Text>
              <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Taken</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="close-circle" size={24} color={colors.danger} />
              <Text style={[styles.statBoxValue, { color: colors.text }]}>{stats.todayMissed}</Text>
              <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Missed</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="medical" size={24} color={colors.primary} />
              <Text style={[styles.statBoxValue, { color: colors.text }]}>{stats.activeMedicines}</Text>
              <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Medicines</Text>
            </View>
          </View>
        </Card>

        {/* Today's Doses */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Doses ({formatDate(new Date().toISOString())})
          </Text>
          {doses.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No doses scheduled for today
            </Text>
          ) : (
            doses.map((dose) => (
              <View key={dose.id} style={[styles.doseItem, { borderBottomColor: colors.border }]}>
                <View style={styles.doseLeft}>
                  <Ionicons
                    name={
                      dose.status === 'taken'
                        ? 'checkmark-circle'
                        : dose.status === 'missed'
                        ? 'close-circle'
                        : dose.status === 'skipped'
                        ? 'remove-circle'
                        : 'time'
                    }
                    size={24}
                    color={
                      dose.status === 'taken'
                        ? colors.success
                        : dose.status === 'missed'
                        ? colors.danger
                        : dose.status === 'skipped'
                        ? colors.warning
                        : colors.textSecondary
                    }
                  />
                  <View style={styles.doseInfo}>
                    <Text style={[styles.doseName, { color: colors.text }]}>
                      {dose.medicine.name}
                    </Text>
                    <Text style={[styles.doseDosage, { color: colors.textSecondary }]}>
                      {dose.medicine.dosage} {dose.medicine.unit}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.doseStatus,
                    {
                      color:
                        dose.status === 'taken'
                          ? colors.success
                          : dose.status === 'missed'
                          ? colors.danger
                          : dose.status === 'skipped'
                          ? colors.warning
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}
                </Text>
              </View>
            ))
          )}
        </Card>

        {/* Insights */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights</Text>
          <View style={styles.insightItem}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {adherencePercentage >= 80
                ? 'Great job! You\'re maintaining excellent adherence.'
                : adherencePercentage >= 50
                ? 'Keep it up! Try to improve your consistency.'
                : 'Consider setting more reminders to improve adherence.'}
            </Text>
          </View>
          {stats.currentStreak > 0 && (
            <View style={styles.insightItem}>
              <Ionicons name="flame" size={20} color={colors.warning} />
              <Text style={[styles.insightText, { color: colors.textSecondary }]}>
                You're on a {stats.currentStreak} day streak!
              </Text>
            </View>
          )}
        </Card>
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
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  adherenceContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  adherenceCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adherenceValue: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  adherenceLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.light.surfaceSecondary,
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
    textAlign: 'center',
    padding: Spacing.lg,
  },
  doseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  doseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  insightText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
});

