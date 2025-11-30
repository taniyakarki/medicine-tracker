import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../constants/design";
import { useThemeColors } from "../../lib/hooks/useThemeColors";

export interface OptionItem {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  description?: string;
}

interface OptionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: OptionItem[];
  selectedValue: string | number;
  onSelect: (value: string | number) => void;
}

export const OptionModal: React.FC<OptionModalProps> = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  const colors = useThemeColors();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContainer, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <TouchableOpacity
                  key={String(option.value)}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: isSelected
                        ? `${colors.primary}15`
                        : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => onSelect(option.value)}
                  activeOpacity={0.7}
                >
                  {option.icon && (
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={isSelected ? colors.primary : colors.text}
                      style={styles.optionIcon}
                    />
                  )}
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected
                            ? Typography.fontWeight.semibold
                            : Typography.fontWeight.medium,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.description && (
                      <Text
                        style={[
                          styles.optionDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {option.description}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.md,
  },
  optionIcon: {
    marginRight: Spacing.xs,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: Typography.fontSize.base,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
});

