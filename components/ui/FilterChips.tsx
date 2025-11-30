import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
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

const FilterChipsComponent: React.FC<FilterChipsProps> = ({
  filters,
  selectedFilters,
  onFilterToggle,
  onClearAll,
  showClearAll = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollPositionRef = useRef(0);

  const hasActiveFilters = selectedFilters.length > 0;

  const handleScroll = (event: any) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.x;
  };

  const handleFilterPress = (filterId: string) => {
    // Store current scroll position
    const currentPosition = scrollPositionRef.current;

    // Call the toggle function
    onFilterToggle(filterId);

    // Restore scroll position after state update
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: currentPosition,
        animated: false,
      });
    }, 0);
  };

  const handleClearPress = () => {
    // Store current scroll position
    const currentPosition = scrollPositionRef.current;

    // Call the clear function
    onClearAll?.();

    // Restore scroll position after state update
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: currentPosition,
        animated: false,
      });
    }, 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
              onPress={() => handleFilterPress(filter.id)}
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
            onPress={handleClearPress}
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

// Memoize the component to prevent unnecessary re-renders
export const FilterChips = React.memo(
  FilterChipsComponent,
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these props actually change
    return (
      prevProps.selectedFilters.length === nextProps.selectedFilters.length &&
      prevProps.selectedFilters.every(
        (filter, index) => filter === nextProps.selectedFilters[index]
      ) &&
      prevProps.filters.length === nextProps.filters.length &&
      prevProps.showClearAll === nextProps.showClearAll
    );
  }
);

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
