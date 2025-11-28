import React, { memo } from 'react';
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

export const MedicineCard = memo<MedicineCardProps>(({ medicine }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handlePress = () => {
    router.push(`/medicines/${medicine.id}`);
  };

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
        <Text style={[styles.name, { color: colors.text }]}>{medicine.name}</Text>
        <Text style={[styles.dosage, { color: colors.textSecondary }]}>
          {medicine.dosage} {medicine.unit}
        </Text>
        {medicine.nextDose && (
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
         prevProps.medicine.nextDose?.time === nextProps.medicine.nextDose?.time;
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
  name: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  dosage: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  nextDose: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
  },
});

