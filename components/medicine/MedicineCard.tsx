import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/design';
import { useColorScheme } from 'react-native';
import { MedicineTypeIcon } from './MedicineTypeIcon';
import { MedicineWithNextDose } from '../../types/medicine';
import { formatTime } from '../../lib/utils/date-helpers';

interface MedicineCardProps {
  medicine: MedicineWithNextDose;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handlePress = () => {
    router.push(`/medicines/${medicine.id}`);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, ...Shadows.sm }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <MedicineTypeIcon type={medicine.type} />
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
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
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

