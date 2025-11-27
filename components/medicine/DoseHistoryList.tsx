import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/design';
import { Card } from '../ui/Card';
import { DoseWithMedicine } from '../../types/medicine';
import { DoseStatus } from '../../types/medicine';

interface DoseHistoryListProps {
  doses: DoseWithMedicine[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  showMedicineName?: boolean;
}

type FilterType = 'all' | 'taken' | 'missed' | 'skipped';

export const DoseHistoryList: React.FC<DoseHistoryListProps> = ({
  doses,
  onLoadMore,
  hasMore = false,
  loading = false,
  showMedicineName = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredDoses = doses.filter((dose) => {
    if (filter === 'all') return true;
    return dose.status === filter;
  });

  const getStatusIcon = (status: DoseStatus) => {
    switch (status) {
      case 'taken':
        return 'checkmark-circle';
      case 'missed':
        return 'close-circle';
      case 'skipped':
        return 'remove-circle';
      case 'scheduled':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: DoseStatus) => {
    switch (status) {
      case 'taken':
        return colors.success;
      case 'missed':
        return colors.error;
      case 'skipped':
        return colors.warning;
      case 'scheduled':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: DoseStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Otherwise return formatted date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderFilterButton = (filterType: FilterType, label: string, count: number) => {
    const isActive = filter === filterType;
    return (
      <TouchableOpacity
        onPress={() => setFilter(filterType)}
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive ? colors.primary : colors.cardSecondary,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.filterText,
            { color: isActive ? '#FFFFFF' : colors.text },
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.filterBadge,
            {
              backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.filterBadgeText,
              { color: isActive ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDoseItem = ({ item }: { item: DoseWithMedicine }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <Card style={styles.doseCard}>
        <View style={styles.doseHeader}>
          <View style={styles.doseHeaderLeft}>
            <View
              style={[
                styles.statusIconContainer,
                { backgroundColor: `${statusColor}20` },
              ]}
            >
              <Ionicons name={statusIcon} size={24} color={statusColor} />
            </View>
            <View style={styles.doseInfo}>
              {showMedicineName && (
                <Text style={[styles.medicineName, { color: colors.text }]}>
                  {item.medicine.name}
                </Text>
              )}
              <Text style={[styles.dosageText, { color: colors.textSecondary }]}>
                {item.medicine.dosage} {item.medicine.unit}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.doseDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatDate(item.scheduled_time)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Scheduled: {formatTime(item.scheduled_time)}
            </Text>
          </View>
          {item.taken_time && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-outline" size={16} color={colors.success} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                Taken: {formatTime(item.taken_time)}
              </Text>
            </View>
          )}
        </View>

        {item.notes && (
          <View style={[styles.notesContainer, { backgroundColor: colors.cardSecondary }]}>
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>
              {item.notes}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const renderEmpty = () => (
    <Card style={styles.emptyCard}>
      <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No {filter !== 'all' ? filter : ''} doses found
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        {filter !== 'all'
          ? `Try changing the filter to see other doses`
          : 'Dose history will appear here once you start tracking'}
      </Text>
    </Card>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <TouchableOpacity
        onPress={onLoadMore}
        disabled={loading}
        style={[styles.loadMoreButton, { backgroundColor: colors.cardSecondary }]}
      >
        <Text style={[styles.loadMoreText, { color: colors.primary }]}>
          {loading ? 'Loading...' : 'Load More'}
        </Text>
      </TouchableOpacity>
    );
  };

  const stats = {
    all: doses.length,
    taken: doses.filter((d) => d.status === 'taken').length,
    missed: doses.filter((d) => d.status === 'missed').length,
    skipped: doses.filter((d) => d.status === 'skipped').length,
  };

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All', stats.all)}
        {renderFilterButton('taken', 'Taken', stats.taken)}
        {renderFilterButton('missed', 'Missed', stats.missed)}
        {renderFilterButton('skipped', 'Skipped', stats.skipped)}
      </View>

      {/* Dose List */}
      <FlatList
        data={filteredDoses}
        renderItem={renderDoseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  filterBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: {
    gap: Spacing.md,
  },
  doseCard: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  doseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doseInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  medicineName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  dosageText: {
    fontSize: Typography.fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  doseDetails: {
    gap: Spacing.xs,
    paddingLeft: 48 + Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
  },
  notesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.xs,
  },
  notesText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  loadMoreButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  loadMoreText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});

