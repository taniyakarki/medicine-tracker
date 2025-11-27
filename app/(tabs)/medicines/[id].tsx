import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/design';
import { useColorScheme } from 'react-native';
import { useMedicine } from '../../../lib/hooks/useMedicines';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { MedicineTypeIcon } from '../../../components/medicine/MedicineTypeIcon';
import { Ionicons } from '@expo/vector-icons';
import { deleteMedicine } from '../../../lib/database/models/medicine';

export default function MedicineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { medicine, loading } = useMedicine(id);

  const handleEdit = () => {
    router.push(`/medicines/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine? This will also delete all associated schedules and dose history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedicine(id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete medicine');
            }
          },
        },
      ]
    );
  };

  if (loading || !medicine) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.header}>
            <MedicineTypeIcon type={medicine.type} size={32} />
            <View style={styles.headerText}>
              <Text style={[styles.name, { color: colors.text }]}>{medicine.name}</Text>
              <Text style={[styles.type, { color: colors.textSecondary }]}>
                {medicine.type.charAt(0).toUpperCase() + medicine.type.slice(1)}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dosage Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="medical" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Dosage:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {medicine.dosage} {medicine.unit}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Frequency:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {medicine.frequency.replace('_', ' ').charAt(0).toUpperCase() +
                medicine.frequency.replace('_', ' ').slice(1)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="play-circle" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Start Date:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(medicine.start_date).toLocaleDateString()}
            </Text>
          </View>
          {medicine.end_date && (
            <View style={styles.infoRow}>
              <Ionicons name="stop-circle" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>End Date:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(medicine.end_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Card>

        {medicine.notes && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
            <Text style={[styles.notes, { color: colors.textSecondary }]}>{medicine.notes}</Text>
          </Card>
        )}

        <View style={styles.actions}>
          <Button title="Edit Medicine" onPress={handleEdit} style={styles.editButton} />
          <Button
            title="Delete"
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteButton}
          />
        </View>
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
  headerCard: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  type: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    marginLeft: Spacing.sm,
    width: 100,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  notes: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  editButton: {
    width: '100%',
  },
  deleteButton: {
    width: '100%',
  },
});

