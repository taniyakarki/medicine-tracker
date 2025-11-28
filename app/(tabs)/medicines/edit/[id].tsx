import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { ColorPicker } from "../../../../components/medicine/ColorPicker";
import { ImagePicker } from "../../../../components/medicine/ImagePicker";
import {
  SchedulePicker,
  SchedulePickerValue,
} from "../../../../components/medicine/SchedulePicker";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { DatePicker } from "../../../../components/ui/DatePicker";
import { Input } from "../../../../components/ui/Input";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner";
import { Select, SelectOption } from "../../../../components/ui/Select";
import { Colors, Spacing } from "../../../../constants/design";
import { MEDICINE_TYPES } from "../../../../constants/medicine-types";
import {
  getMedicineById,
  updateMedicine,
} from "../../../../lib/database/models/medicine";
import {
  createSchedule,
  deleteSchedulesByMedicineId,
  getSchedulesByMedicineId,
} from "../../../../lib/database/models/schedule";
import { validateMedicineForm } from "../../../../lib/utils/validation";

const frequencies: SelectOption[] = [
  { label: "Daily", value: "daily" },
  { label: "Specific Days", value: "specific_days" },
  { label: "Interval (Hours)", value: "interval" },
];

const medicineUnits: SelectOption[] = [
  { label: "mg (milligrams)", value: "mg" },
  { label: "g (grams)", value: "g" },
  { label: "mcg (micrograms)", value: "mcg" },
  { label: "ml (milliliters)", value: "ml" },
  { label: "L (liters)", value: "L" },
  { label: "IU (International Units)", value: "IU" },
  { label: "units", value: "units" },
  { label: "drops", value: "drops" },
  { label: "puffs", value: "puffs" },
  { label: "tablets", value: "tablets" },
  { label: "capsules", value: "capsules" },
  { label: "tsp (teaspoons)", value: "tsp" },
  { label: "tbsp (tablespoons)", value: "tbsp" },
  { label: "%", value: "%" },
];

export default function EditMedicineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    dosage: "",
    unit: "",
    frequency: "",
    start_date: "",
    end_date: "",
    notes: "",
    image: null as string | null,
    color: "",
  });

  const [scheduleData, setScheduleData] = useState<SchedulePickerValue>({
    times: [],
    daysOfWeek: [],
    intervalHours: 8,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMedicine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          start_date: medicine.start_date.split("T")[0],
          end_date: medicine.end_date ? medicine.end_date.split("T")[0] : "",
          notes: medicine.notes || "",
          image: medicine.image || null,
          color: medicine.color || "",
        });

        // Load schedules
        const schedules = await getSchedulesByMedicineId(id);
        if (schedules.length > 0) {
          const times = schedules.map((s, index) => ({
            id: s.id || index.toString(),
            time: s.time,
          }));

          let daysOfWeek: number[] = [];
          let intervalHours: number | undefined;

          if (schedules[0].days_of_week) {
            try {
              daysOfWeek = JSON.parse(schedules[0].days_of_week);
            } catch (e) {
              console.error("Error parsing days_of_week:", e);
            }
          }

          if (schedules[0].interval_hours) {
            intervalHours = schedules[0].interval_hours;
          }

          setScheduleData({
            times,
            daysOfWeek,
            intervalHours: intervalHours || 8,
          });
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load medicine");
      console.error("Error loading medicine:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateMedicineForm(formData);

    // Additional validation for schedules
    if (scheduleData.times.length === 0) {
      validationErrors.push({
        field: "schedule",
        message: "Please add at least one time slot",
      });
    }

    if (
      formData.frequency === "specific_days" &&
      (!scheduleData.daysOfWeek || scheduleData.daysOfWeek.length === 0)
    ) {
      validationErrors.push({
        field: "schedule",
        message: "Please select at least one day of the week",
      });
    }

    if (formData.frequency === "interval" && !scheduleData.intervalHours) {
      validationErrors.push({
        field: "schedule",
        message: "Please select an interval",
      });
    }

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      Alert.alert("Validation Error", validationErrors[0].message);
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
        image: formData.image || undefined,
        color: formData.color || undefined,
      });

      // Update schedules - delete old ones and create new ones
      await deleteSchedulesByMedicineId(id);

      for (const timeSlot of scheduleData.times) {
        await createSchedule({
          medicine_id: id,
          time: timeSlot.time,
          days_of_week:
            formData.frequency === "specific_days"
              ? JSON.stringify(scheduleData.daysOfWeek)
              : undefined,
          interval_hours:
            formData.frequency === "interval"
              ? scheduleData.intervalHours
              : undefined,
          is_active: true,
        });
      }

      // Reschedule notifications for this medicine
      const { scheduleMedicineNotifications } = await import(
        "../../../../lib/notifications/scheduler"
      );
      try {
        await scheduleMedicineNotifications(id, 7);
      } catch (notifError) {
        console.error("Error rescheduling notifications:", notifError);
        // Don't fail the whole operation if notifications fail
      }

      Alert.alert("Success", "Medicine updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update medicine. Please try again.");
      console.error("Error updating medicine:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Input
              label="Medicine Name"
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                setErrors({ ...errors, name: "" });
              }}
              placeholder="e.g., Aspirin"
              error={errors.name}
              required
            />

            <Select
              label="Medicine Type"
              value={formData.type}
              options={MEDICINE_TYPES}
              onSelect={(value) => {
                setFormData({ ...formData, type: value });
                setErrors({ ...errors, type: "" });
              }}
              error={errors.type}
              required
              showIcons
            />

            <View style={styles.row}>
              <Input
                label="Dosage"
                value={formData.dosage}
                onChangeText={(text) => {
                  setFormData({ ...formData, dosage: text });
                  setErrors({ ...errors, dosage: "" });
                }}
                placeholder="e.g., 500"
                keyboardType="numeric"
                error={errors.dosage}
                containerStyle={styles.halfWidth}
                required
              />

              <Select
                label="Unit"
                value={formData.unit}
                options={medicineUnits}
                onSelect={(value) => {
                  setFormData({ ...formData, unit: value });
                  setErrors({ ...errors, unit: "" });
                }}
                placeholder="Select unit"
                error={errors.unit}
                containerStyle={styles.halfWidth}
                required
              />
            </View>

            <Select
              label="Frequency"
              value={formData.frequency}
              options={frequencies}
              onSelect={(value) =>
                setFormData({ ...formData, frequency: value })
              }
              error={errors.frequency}
              required
            />
          </Card>

          <Card style={styles.card}>
            <SchedulePicker
              value={scheduleData}
              onChange={setScheduleData}
              frequency={formData.frequency as any}
              error={errors.schedule}
            />
          </Card>

          <Card style={styles.card}>
            <ImagePicker
              value={formData.image}
              onChange={(image) => setFormData({ ...formData, image })}
            />

            <ColorPicker
              value={formData.color}
              onChange={(color) => setFormData({ ...formData, color })}
            />
          </Card>

          <Card style={styles.card}>
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(date) => {
                setFormData({ ...formData, start_date: date });
                setErrors({ ...errors, start_date: "" });
              }}
              error={errors.start_date}
              required
              placeholder="Select start date"
            />

            <DatePicker
              label="End Date (Optional)"
              value={formData.end_date}
              onChange={(date) => setFormData({ ...formData, end_date: date })}
              placeholder="Select end date"
              minimumDate={
                formData.start_date ? new Date(formData.start_date) : undefined
              }
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  card: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
});
