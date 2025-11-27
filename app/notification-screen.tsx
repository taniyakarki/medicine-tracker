import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/design';
import { useColorScheme } from 'react-native';
import { getDoseById } from '../lib/database/models/dose';
import { getMedicineById } from '../lib/database/models/medicine';
import { markDoseAsTaken, markDoseAsSkipped } from '../lib/database/models/dose';
import { snoozeNotification } from '../lib/notifications/scheduler';
import { MedicineTypeIcon } from '../components/medicine/MedicineTypeIcon';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function NotificationScreen() {
  const router = useRouter();
  const { doseId } = useLocalSearchParams<{ doseId: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [medicine, setMedicine] = useState<any>(null);
  const [dose, setDose] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [doseId]);

  const loadData = async () => {
    try {
      const doseData = await getDoseById(doseId);
      if (doseData) {
        setDose(doseData);
        const medicineData = await getMedicineById(doseData.medicine_id);
        setMedicine(medicineData);
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
    }
  };

  const handleTake = async () => {
    try {
      await markDoseAsTaken(doseId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error marking as taken:', error);
    }
  };

  const handleSnooze = async () => {
    try {
      if (medicine && dose) {
        await snoozeNotification(
          doseId,
          medicine.id,
          medicine.name,
          `${medicine.dosage} ${medicine.unit}`,
          10
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        router.back();
      }
    } catch (error) {
      console.error('Error snoozing:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await markDoseAsSkipped(doseId, 'Skipped from notification');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.back();
    } catch (error) {
      console.error('Error skipping:', error);
    }
  };

  if (!medicine || !dose) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.content}>
        <MedicineTypeIcon type={medicine.type} size={64} />
        
        <Text style={styles.title}>Time to Take Your Medicine</Text>
        
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.dosage}>
            {medicine.dosage} {medicine.unit}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.takeButton]}
            onPress={handleTake}
          >
            <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Take</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.snoozeButton]}
            onPress={handleSnooze}
          >
            <Ionicons name="time" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Snooze 10min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.skipButton]}
            onPress={handleSkip}
          >
            <Ionicons name="close-circle" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  medicineInfo: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  medicineName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  dosage: {
    fontSize: Typography.fontSize.xl,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.sm,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  takeButton: {
    backgroundColor: Colors.light.success,
  },
  snoozeButton: {
    backgroundColor: Colors.light.warning,
  },
  skipButton: {
    backgroundColor: Colors.light.danger,
  },
  actionText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    padding: Spacing.sm,
  },
});

