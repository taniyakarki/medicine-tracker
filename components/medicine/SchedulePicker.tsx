import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, Typography } from '../../constants/design';
import { Card } from '../ui/Card';

export interface ScheduleTime {
  id: string;
  time: string; // HH:mm format
}

export interface SchedulePickerValue {
  times: ScheduleTime[];
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  intervalHours?: number;
}

interface SchedulePickerProps {
  value: SchedulePickerValue;
  onChange: (value: SchedulePickerValue) => void;
  frequency: 'daily' | 'specific_days' | 'interval';
  error?: string;
}

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export const SchedulePicker: React.FC<SchedulePickerProps> = ({
  value,
  onChange,
  frequency,
  error,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState(new Date());

  const handleAddTime = () => {
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    setTempTime(now);
    setEditingTimeId('new');
    setShowTimePicker(true);
  };

  const handleEditTime = (timeId: string, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    setTempTime(date);
    setEditingTimeId(timeId);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate && editingTimeId) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      if (editingTimeId === 'new') {
        const newTime: ScheduleTime = {
          id: Date.now().toString(),
          time: timeStr,
        };
        onChange({
          ...value,
          times: [...value.times, newTime],
        });
      } else {
        const updatedTimes = value.times.map((t) =>
          t.id === editingTimeId ? { ...t, time: timeStr } : t
        );
        onChange({
          ...value,
          times: updatedTimes,
        });
      }

      if (Platform.OS === 'android') {
        setEditingTimeId(null);
      }
    }
  };

  const handleRemoveTime = (timeId: string) => {
    onChange({
      ...value,
      times: value.times.filter((t) => t.id !== timeId),
    });
  };

  const handleDayToggle = (day: number) => {
    const currentDays = value.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    
    onChange({
      ...value,
      daysOfWeek: newDays,
    });
  };

  const handleIntervalChange = (hours: number) => {
    onChange({
      ...value,
      intervalHours: hours,
    });
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
    setEditingTimeId(null);
  };

  return (
    <View style={styles.container}>
      {/* Time Slots Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: colors.text }]}>
            Time Slots {value.times.length > 0 && `(${value.times.length})`}
          </Text>
          <TouchableOpacity
            onPress={handleAddTime}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Time</Text>
          </TouchableOpacity>
        </View>

        {value.times.length === 0 ? (
          <Card style={StyleSheet.flatten([styles.emptyCard, { backgroundColor: colors.cardSecondary }])}>
            <Ionicons name="time-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No time slots added yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap "Add Time" to schedule when to take this medicine
            </Text>
          </Card>
        ) : (
          <View style={styles.timesList}>
            {value.times.map((timeSlot) => (
              <Card key={timeSlot.id} style={styles.timeCard}>
                <TouchableOpacity
                  onPress={() => handleEditTime(timeSlot.id, timeSlot.time)}
                  style={styles.timeCardContent}
                >
                  <Ionicons name="time" size={24} color={colors.primary} />
                  <Text style={[styles.timeText, { color: colors.text }]}>
                    {timeSlot.time}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTime(timeSlot.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Days of Week Picker (for specific_days frequency) */}
      {frequency === 'specific_days' && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Days of Week
          </Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = value.daysOfWeek?.includes(day.value) || false;
              return (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => handleDayToggle(day.value)}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.cardSecondary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {value.daysOfWeek && value.daysOfWeek.length === 0 && (
            <Text style={[styles.helperText, { color: colors.error }]}>
              Please select at least one day
            </Text>
          )}
        </View>
      )}

      {/* Interval Hours Picker (for interval frequency) */}
      {frequency === 'interval' && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Interval (Hours)
          </Text>
          <View style={styles.intervalContainer}>
            {[2, 4, 6, 8, 12, 24].map((hours) => {
              const isSelected = value.intervalHours === hours;
              return (
                <TouchableOpacity
                  key={hours}
                  onPress={() => handleIntervalChange(hours)}
                  style={[
                    styles.intervalButton,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.cardSecondary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.intervalText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {hours}h
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Medicine will be taken every {value.intervalHours || 0} hours
          </Text>
        </View>
      )}

      {/* Schedule Preview */}
      {value.times.length > 0 && (
        <Card style={StyleSheet.flatten([styles.previewCard, { backgroundColor: colors.cardSecondary }])}>
          <View style={styles.previewHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              Schedule Preview
            </Text>
          </View>
          <Text style={[styles.previewText, { color: colors.textSecondary }]}>
            {frequency === 'daily' && `Daily at ${value.times.map(t => t.time).join(', ')}`}
            {frequency === 'specific_days' && value.daysOfWeek && value.daysOfWeek.length > 0 && 
              `${DAYS_OF_WEEK.filter(d => value.daysOfWeek?.includes(d.value)).map(d => d.label).join(', ')} at ${value.times.map(t => t.time).join(', ')}`}
            {frequency === 'interval' && value.intervalHours && 
              `Every ${value.intervalHours} hours starting at ${value.times[0]?.time || '09:00'}`}
          </Text>
        </Card>
      )}

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <View>
          {Platform.OS === 'ios' && (
            <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={closeTimePicker}>
                  <Text style={[styles.pickerButton, { color: colors.primary }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor={colors.text}
              />
            </View>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={tempTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  timesList: {
    gap: Spacing.sm,
  },
  timeCard: {
    padding: 0,
  },
  timeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  timeText: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  intervalContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  intervalButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 2,
  },
  intervalText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  previewCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previewTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  previewText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  pickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  pickerButton: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

