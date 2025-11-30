import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Spacing, Typography } from '../../constants/design';
import { useTheme } from '../../lib/context/AppContext';

interface DatePickerProps {
  label: string;
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  minimumDate,
  maximumDate,
  placeholder = 'Select date',
}) => {
  const { colors } = useTheme();
  
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePress = () => {
    if (value) {
      setTempDate(new Date(value));
    } else {
      setTempDate(new Date());
    }
    setShowPicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker closes automatically, so we handle it here
    if (Platform.OS === 'android') {
      setShowPicker(false);
      
      // If user cancelled (selectedDate is undefined on cancel)
      if (event.type === 'dismissed') {
        return;
      }
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      
      // Format date as YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      onChange(formattedDate);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
        </Text>
        {value && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={value ? colors.text : colors.textSecondary}
        />
        <Text
          style={[
            styles.inputText,
            {
              color: value ? colors.text : colors.textSecondary,
            },
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {showPicker && (
        <View>
          {Platform.OS === 'ios' && (
            <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
              <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={closePicker}>
                  <Text style={[styles.pickerButton, { color: colors.primary }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={colors.text}
              />
            </View>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  required: {
    fontSize: Typography.fontSize.base,
  },
  clearButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  clearText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  inputText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
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
  },
  pickerButton: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

