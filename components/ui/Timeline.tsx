import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius } from '../../constants/design';
import { useTheme } from '../../lib/context/AppContext';

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  status?: 'scheduled' | 'taken' | 'missed' | 'skipped' | 'overdue';
}

interface TimelineProps {
  items: TimelineItem[];
  onTakeDose?: (id: string) => void;
  onSkipDose?: (id: string) => void;
  showActions?: boolean;
}

export const Timeline = memo<TimelineProps>(function Timeline({ 
  items, 
  onTakeDose, 
  onSkipDose, 
  showActions = false 
}) {
  const { colors } = useTheme();

  const getStatusColor = useCallback((status?: string) => {
    switch (status) {
      case 'taken':
        return colors.success;
      case 'missed':
        return colors.danger;
      case 'skipped':
        return colors.warning;
      case 'overdue':
        return colors.danger;
      default:
        return colors.primary;
    }
  }, [colors]);

  const canShowActions = useCallback((item: TimelineItem) => {
    return showActions && (item.status === 'scheduled' || item.status === 'overdue');
  }, [showActions]);

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={item.id} style={styles.itemContainer}>
          <View style={styles.leftSection}>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {item.time}
            </Text>
          </View>
          <View style={styles.centerSection}>
            <View
              style={[
                styles.dot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            {index < items.length - 1 && (
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            )}
          </View>
          <View style={styles.rightSection}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderLeftColor: getStatusColor(item.status),
                },
              ]}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {item.subtitle}
                </Text>
              )}
              
              {canShowActions(item) && (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => onTakeDose?.(item.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Take</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.warning }]}
                    onPress={() => onSkipDose?.(item.id)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if items array or callbacks change
  return prevProps.items === nextProps.items &&
         prevProps.showActions === nextProps.showActions &&
         prevProps.onTakeDose === nextProps.onTakeDose &&
         prevProps.onSkipDose === nextProps.onSkipDose;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  leftSection: {
    width: 60,
    paddingTop: Spacing.xs,
  },
  time: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  centerSection: {
    width: 30,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
  },
  rightSection: {
    flex: 1,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    flex: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});

