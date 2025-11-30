import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BorderRadius,
  Spacing,
  Typography,
} from "../../constants/design";
import { useTheme } from "../../lib/context/AppContext";

export interface BottomDrawerSelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
}

interface BottomDrawerSelectProps {
  value?: string | null;
  onChange: (value: string) => void;
  options: BottomDrawerSelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  title?: string;
  allowClear?: boolean;
  clearLabel?: string;
  renderTrigger?: (
    selected: BottomDrawerSelectOption | null,
    isOpen: boolean
  ) => React.ReactNode;
  renderOption?: (
    option: BottomDrawerSelectOption,
    isSelected: boolean
  ) => React.ReactNode;
}

export const BottomDrawerSelect: React.FC<BottomDrawerSelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = "Select an option",
  error,
  title = "Select",
  allowClear = true,
  clearLabel = "None",
  renderTrigger,
  renderOption,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = value
    ? options.find((opt) => opt.value === value)
    : null;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={[
          styles.dropdownTrigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
        onPress={() => setIsOpen(true)}
        accessibilityLabel={label || placeholder}
        accessibilityRole="button"
      >
        {renderTrigger ? (
          renderTrigger(selectedOption ?? null, isOpen)
        ) : (
          <>
            {selectedOption ? (
              <View style={styles.selectedDisplay}>
                {selectedOption.icon}
                <Text style={[styles.selectedText, { color: colors.text }]}>
                  {selectedOption.label}
                </Text>
              </View>
            ) : (
              <Text
                style={[styles.placeholderText, { color: colors.textSecondary }]}
              >
                {placeholder}
              </Text>
            )}
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {/* Bottom Drawer */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <Pressable
            style={[styles.drawerContent, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>
                {title}
              </Text>
            </View>

            {/* Options List */}
            <ScrollView style={styles.optionsList}>
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight + "20"
                          : "transparent",
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => handleSelect(option.value)}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <>
                        <View style={styles.optionItemLeft}>
                          {option.icon}
                          <Text
                            style={[
                              styles.optionItemText,
                              { color: colors.text },
                              isSelected && styles.optionItemTextSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={colors.primary}
                          />
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Clear Option */}
              {allowClear && value && (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    styles.clearOption,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={handleClear}
                >
                  <View style={styles.optionItemLeft}>
                    <View
                      style={[
                        styles.clearIconPlaceholder,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          borderWidth: 2,
                          borderColor: colors.border,
                          borderStyle: "dashed",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.optionItemText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {clearLabel}
                    </Text>
                  </View>
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minHeight: 56,
  },
  selectedDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  selectedText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  placeholderText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  drawerContent: {
    width: "100%",
    maxHeight: "70%",
    borderTopLeftRadius: BorderRadius.xl * 1.5,
    borderTopRightRadius: BorderRadius.xl * 1.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  drawerHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  drawerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  optionsList: {
    maxHeight: 500,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  optionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  optionItemText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  optionItemTextSelected: {
    fontWeight: Typography.fontWeight.semibold,
  },
  clearOption: {
    marginTop: Spacing.sm,
  },
  clearIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
  },
});

