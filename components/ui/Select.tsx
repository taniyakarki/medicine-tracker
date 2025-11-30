import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Typography, BorderRadius, Spacing, Layout } from '../../constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from './Modal';
import { useThemeColors } from '../../lib/hooks/useThemeColors';

export interface SelectOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  showIcons?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  error,
  containerStyle,
  required = false,
  showIcons = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const colors = useThemeColors();

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.select,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectText,
            {
              color: selectedOption ? colors.text : colors.textTertiary,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={label || 'Select'}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              {
                backgroundColor:
                  option.value === value ? colors.primaryLight : 'transparent',
              },
            ]}
            onPress={() => handleSelect(option.value)}
          >
            {showIcons && option.icon && (
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={option.icon} 
                  size={24} 
                  color={option.value === value ? '#FFFFFF' : colors.textSecondary} 
                />
              </View>
            )}
            <Text
              style={[
                styles.optionText,
                {
                  color: option.value === value ? '#FFFFFF' : colors.text,
                  fontWeight:
                    option.value === value
                      ? Typography.fontWeight.semibold
                      : Typography.fontWeight.normal,
                },
              ]}
            >
              {option.label}
            </Text>
            {option.value === value && (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  select: {
    height: Layout.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
  error: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
});

