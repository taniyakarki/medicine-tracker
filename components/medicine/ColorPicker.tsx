import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/design';

interface ColorPickerProps {
  value?: string | null;
  onChange: (color: string) => void;
  label?: string;
  error?: string;
}

const MEDICINE_COLORS = [
  { name: 'Red', value: '#EF4444', light: '#FEE2E2' },
  { name: 'Orange', value: '#F97316', light: '#FFEDD5' },
  { name: 'Amber', value: '#F59E0B', light: '#FEF3C7' },
  { name: 'Yellow', value: '#EAB308', light: '#FEF9C3' },
  { name: 'Lime', value: '#84CC16', light: '#ECFCCB' },
  { name: 'Green', value: '#10B981', light: '#D1FAE5' },
  { name: 'Emerald', value: '#059669', light: '#D1FAE5' },
  { name: 'Teal', value: '#14B8A6', light: '#CCFBF1' },
  { name: 'Cyan', value: '#06B6D4', light: '#CFFAFE' },
  { name: 'Sky', value: '#0EA5E9', light: '#E0F2FE' },
  { name: 'Blue', value: '#3B82F6', light: '#DBEAFE' },
  { name: 'Indigo', value: '#6366F1', light: '#E0E7FF' },
  { name: 'Violet', value: '#8B5CF6', light: '#EDE9FE' },
  { name: 'Purple', value: '#A855F7', light: '#F3E8FF' },
  { name: 'Fuchsia', value: '#D946EF', light: '#FAE8FF' },
  { name: 'Pink', value: '#EC4899', light: '#FCE7F3' },
  { name: 'Rose', value: '#F43F5E', light: '#FFE4E6' },
  { name: 'Gray', value: '#6B7280', light: '#F3F4F6' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = 'Color',
  error,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      <View style={styles.colorsGrid}>
        {MEDICINE_COLORS.map((color) => {
          const isSelected = value === color.value;
          return (
            <TouchableOpacity
              key={color.value}
              onPress={() => onChange(color.value)}
              style={[
                styles.colorButton,
                {
                  backgroundColor: color.value,
                  borderColor: isSelected ? colors.text : 'transparent',
                  borderWidth: isSelected ? 3 : 0,
                },
              ]}
              accessibilityLabel={`Select ${color.name} color`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {value && (
        <View style={styles.selectedColorInfo}>
          <View
            style={[
              styles.selectedColorPreview,
              { backgroundColor: value },
            ]}
          />
          <Text style={[styles.selectedColorText, { color: colors.text }]}>
            {MEDICINE_COLORS.find((c) => c.value === value)?.name || 'Custom'}
          </Text>
          <TouchableOpacity
            onPress={() => onChange('')}
            style={styles.clearButton}
          >
            <Text style={[styles.clearButtonText, { color: colors.primary }]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      <Text style={[styles.helperText, { color: colors.textSecondary }]}>
        Optional: Choose a color to help identify this medicine
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  selectedColorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColorText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clearButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
  },
});

