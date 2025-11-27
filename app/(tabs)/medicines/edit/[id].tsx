import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '../../../../constants/design';
import { useColorScheme } from 'react-native';
import { Input } from '../../../../components/ui/Input';
import { Select, SelectOption } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { validateMedicineForm } from '../../../../lib/utils/validation';
import { getMedicineById, updateMedicine } from '../../../../lib/database/models/medicine';

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

export default function EditMedicineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    dosage: '',
    unit: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMedicine();
  }, [id]);

  const loadMedicine = async () => {
    try {
      const medicine = await getMedicineById(id);
      if (medicine) {
        setFormData({
          name: medicine.name,
          type: medicine.type,
          dosage: medicine.dosage,
          unit: medicine.unit,
          frequency: medicine.frequency,
          start_date: medicine.start_date.split('T')[0],
          end_date: medicine.end_date ? medicine.end_date.split('T')[0] : '',
          notes: medicine.notes || '',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load medicine');
      console.error('Error loading medicine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateMedicineForm(formData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    setSaving(true);
    try {
      await updateMedicine(id, {
        name: formData.name,
        type: formData.type as any,
        dosage: formData.dosage,
        unit: formData.unit,
        frequency: formData.frequency as any,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        notes: formData.notes || undefined,
      });

      Alert.alert('Success', 'Medicine updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update medicine. Please try again.');
      console.error('Error updating medicine:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

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
            title="Save Changes"
            onPress={handleSubmit}
            loading={saving}
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

