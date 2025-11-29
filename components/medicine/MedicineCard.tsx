import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/design';
import { MedicineTypeIcon } from './MedicineTypeIcon';
import { MedicineWithNextDose } from '../../types/medicine';
import { formatTime } from '../../lib/utils/date-helpers';

interface MedicineCardProps {
  medicine: MedicineWithNextDose;
}

// Helper function to get relative time with natural language
const getRelativeTime = (dateString: string): string => {
  try {
    const now = new Date();
    const targetDate = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(targetDate.getTime())) {
      return '';
    }
    
    const diffMs = targetDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    // Calculate if it's today, tomorrow, or another day
    const nowStart = new Date(now);
    nowStart.setHours(0, 0, 0, 0);
    
    const targetStart = new Date(targetDate);
    targetStart.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((targetStart.getTime() - nowStart.getTime()) / 86400000);

    // Overdue
    if (diffMins < 0) return 'Overdue';
    
    // Very soon (less than 1 hour)
    if (diffMins === 0) return 'Now';
    if (diffMins < 60) return `in ${diffMins}m`;
    
    // Today but more than 1 hour away
    if (daysDiff === 0) {
      if (diffHours < 2) return `in ${diffHours}h`;
      return `Today`;
    }
    
    // Tomorrow
    if (daysDiff === 1) return 'Tomorrow';
    
    // Within the next week - show day name
    if (daysDiff > 1 && daysDiff <= 7) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[targetDate.getDay()];
    }
    
    // More than a week away
    if (daysDiff > 7) return `in ${daysDiff}d`;
    
    return '';
  } catch (error) {
    return '';
  }
};

// Helper to format medicine type label
const formatMedicineType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const MedicineCard = memo<MedicineCardProps>(function MedicineCard({ medicine }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handlePress = () => {
    router.push(`/medicines/${medicine.id}`);
  };

  // Get relative time for next dose
  const relativeTime = useMemo(() => {
    if (!medicine.nextDose || !medicine.nextDose.scheduled_time) return '';
    return getRelativeTime(medicine.nextDose.scheduled_time);
  }, [medicine.nextDose]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, ...Shadows.sm },
        medicine.color && { borderLeftWidth: 4, borderLeftColor: medicine.color },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {medicine.image ? (
        <Image 
          source={{ uri: medicine.image }} 
          style={styles.medicineImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      ) : medicine.color ? (
        <View style={[styles.colorIcon, { backgroundColor: medicine.color }]}>
          <MedicineTypeIcon type={medicine.type} size={24} color="#FFFFFF" />
        </View>
      ) : (
        <MedicineTypeIcon type={medicine.type} />
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: colors.text }]}>{medicine.name}</Text>
          {relativeTime && (
            <View style={[
              styles.timePill, 
              { backgroundColor: relativeTime === 'Overdue' ? colors.danger : colors.primary }
            ]}>
              <Text style={styles.timePillText}>
                {relativeTime}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.type, { color: colors.textTertiary }]}>
          {formatMedicineType(medicine.type)} • {medicine.dosage} {medicine.unit}
        </Text>
        {medicine.nextDose && medicine.nextDose.time && (
          <Text style={[styles.nextDose, { color: colors.primary }]}>
            Next: {formatTime(medicine.nextDose.time)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return prevProps.medicine.id === nextProps.medicine.id &&
         prevProps.medicine.updated_at === nextProps.medicine.updated_at &&
         prevProps.medicine.nextDose?.scheduled_time === nextProps.medicine.nextDose?.scheduled_time;
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  medicineImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'cover',
  },
  colorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  timePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  timePillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  type: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  nextDose: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
  },
});

