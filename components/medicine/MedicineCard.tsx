import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/design';
import { MedicineTypeIcon } from './MedicineTypeIcon';
import { MedicineWithNextDose } from '../../types/medicine';
import { formatTime } from '../../lib/utils/date-helpers';
import { getRelativeTime, formatMedicineType } from '../../lib/utils/medicine-helpers';
import { useThemeColors } from '../../lib/hooks/useThemeColors';

interface MedicineCardProps {
  medicine: MedicineWithNextDose;
}

export const MedicineCard = memo<MedicineCardProps>(function MedicineCard({ medicine }) {
  const router = useRouter();
  const colors = useThemeColors();

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

