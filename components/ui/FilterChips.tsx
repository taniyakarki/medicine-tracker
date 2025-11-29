import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../constants/design";

export interface FilterOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
}

interface FilterChipsProps {
  filters: FilterOption[];
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  selectedFilters,
  onFilterToggle,
  onClearAll,
  showClearAll = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const hasActiveFilters = selectedFilters.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);

          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.surfaceSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onFilterToggle(filter.id)}
              activeOpacity={0.7}
            >
              {filter.icon && (
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={isSelected ? "#FFFFFF" : colors.text}
                  style={styles.chipIcon}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
              {filter.count !== undefined && filter.count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.3)"
                        : colors.primary + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      {
                        color: isSelected ? "#FFFFFF" : colors.primary,
                      },
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {showClearAll && hasActiveFilters && (
          <TouchableOpacity
            style={[
              styles.chip,
              styles.clearChip,
              {
                backgroundColor: colors.danger + "15",
                borderColor: colors.danger,
              },
            ]}
            onPress={onClearAll}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={16}
              color={colors.danger}
              style={styles.chipIcon}
            />
            <Text
              style={[
                styles.chipText,
                {
                  color: colors.danger,
                },
              ]}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  chipIcon: {
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  countBadge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  clearChip: {
    marginLeft: Spacing.xs,
  },
});

