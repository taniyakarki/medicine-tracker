import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
 useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../../../constants/design';
import { Input } from '../../../components/ui/Input';
import { Select, SelectOption } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { validateMedicineForm } from '../../../lib/utils/validation';
import { createMedicine } from '../../../lib/database/models/medicine';
import { createSchedule } from '../../../lib/database/models/schedule';
import { ensureUserExists } from '../../../lib/database/models/user';

const medicineTypes: SelectOption[] = [
  { label: 'Pill', value: 'pill' },
  { label: 'Liquid', value: 'liquid' },
  { label: 'Injection', value: 'injection' },
  { label: 'Inhaler', value: 'inhaler' },
  { label: 'Drops', value: 'drops' },
  { label: 'Other', value: 'other' },
];

const frequencies: SelectOption[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Specific Days', value: 'specific_days' },
  { label: 'Interval (Hours)', value: 'interval' },
];

export default function AddMedicineScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    dosage: '',
    unit: '',
    frequency: 'daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });

  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    // Validate form
    const validationErrors = validateMedicineForm(formData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    setLoading(true);
    try {
      const user = await ensureUserExists();

      // Create medicine
      const medicineId = await createMedicine({
        user_id: user.id,
        name: formData.name,
        type: formData.type as any,
        dosage: formData.dosage,
        unit: formData.unit,
        frequency: formData.frequency as any,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        notes: formData.notes || undefined,
        is_active: true,
      });

      // Create default schedule
      await createSchedule({
        medicine_id: medicineId,
        time: scheduleTime,
        is_active: true,
      });

      Alert.alert('Success', 'Medicine added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add medicine. Please try again.');
      console.error('Error adding medicine:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Input
            label="Medicine Name"
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              setErrors({ ...errors, name: '' });
            }}
            placeholder="e.g., Aspirin"
            error={errors.name}
            required
          />

          <Select
            label="Medicine Type"
            value={formData.type}
            options={medicineTypes}
            onSelect={(value) => {
              setFormData({ ...formData, type: value });
              setErrors({ ...errors, type: '' });
            }}
            placeholder="Select type"
            error={errors.type}
            required
          />

          <View style={styles.row}>
            <Input
              label="Dosage"
              value={formData.dosage}
              onChangeText={(text) => {
                setFormData({ ...formData, dosage: text });
                setErrors({ ...errors, dosage: '' });
              }}
              placeholder="e.g., 500"
              keyboardType="numeric"
              error={errors.dosage}
              containerStyle={styles.halfWidth}
              required
            />

            <Input
              label="Unit"
              value={formData.unit}
              onChangeText={(text) => {
                setFormData({ ...formData, unit: text });
                setErrors({ ...errors, unit: '' });
              }}
              placeholder="e.g., mg"
              error={errors.unit}
              containerStyle={styles.halfWidth}
              required
            />
          </View>

          <Select
            label="Frequency"
            value={formData.frequency}
            options={frequencies}
            onSelect={(value) => setFormData({ ...formData, frequency: value })}
            error={errors.frequency}
            required
          />

          <Input
            label="Time"
            value={scheduleTime}
            onChangeText={setScheduleTime}
            placeholder="HH:mm"
            error={errors.time}
          />

          <Input
            label="Start Date"
            value={formData.start_date}
            onChangeText={(text) => {
              setFormData({ ...formData, start_date: text });
              setErrors({ ...errors, start_date: '' });
            }}
            placeholder="YYYY-MM-DD"
            error={errors.start_date}
            required
          />

          <Input
            label="End Date (Optional)"
            value={formData.end_date}
            onChangeText={(text) => setFormData({ ...formData, end_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <Input
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Any additional instructions..."
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />
        </Card>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            style={styles.button}
          />
          <Button
            title="Add Medicine"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
});

