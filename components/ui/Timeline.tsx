import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/design';
import { useColorScheme } from 'react-native';

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  status?: 'scheduled' | 'taken' | 'missed' | 'skipped' | 'overdue';
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const getStatusColor = (status?: string) => {
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
  };

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
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

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
});

