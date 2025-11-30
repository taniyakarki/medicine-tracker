import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicineCard } from "../../../components/medicine/MedicineCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import { FilterChips, FilterOption } from "../../../components/ui/FilterChips";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { SearchBar } from "../../../components/ui/SearchBar";
import { Spacing, Typography } from "../../../constants/design";
import { MEDICINE_TYPES } from "../../../constants/medicine-types";
import { useTheme } from "../../../lib/context/AppContext";
import { useMedicines } from "../../../lib/hooks/useMedicines";
import { MedicineWithNextDose } from "../../../types/medicine";

export default function MedicinesListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { medicines, loading, refresh } = useMedicines();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleAddMedicine = useCallback(() => {
    router.push("/medicines/add");
  }, [router]);

  // Filter options with counts - dynamically generated from medicine data
  const filterOptions: FilterOption[] = useMemo(() => {
    // Get unique medicine types from actual data
    const uniqueTypes = Array.from(new Set(medicines.map((m) => m.type)));

    // Create type filters dynamically based on actual medicine types
    const typeFilters: FilterOption[] = uniqueTypes
      .map((type) => {
        // Find the medicine type definition from constants
        const medicineTypeDef = MEDICINE_TYPES.find((mt) => mt.value === type);

        return {
          id: type,
          label:
            medicineTypeDef?.label ||
            type.charAt(0).toUpperCase() + type.slice(1),
          icon:
            (medicineTypeDef?.icon as keyof typeof Ionicons.glyphMap) ||
            "medical-outline",
          count: medicines.filter((m) => m.type === type).length,
        };
      })
      .sort((a, b) => {
        // Sort by count (descending), then by label (alphabetically)
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.label.localeCompare(b.label);
      });

    // Status filters (always present)
    const statusFilters: FilterOption[] = [
      {
        id: "active",
        label: "Active",
        icon: "checkmark-circle",
        count: medicines.filter((m) => m.is_active).length,
      },
      {
        id: "inactive",
        label: "Inactive",
        icon: "close-circle",
        count: medicines.filter((m) => !m.is_active).length,
      },
    ];

    // Schedule filters (always present)
    const scheduleFilters: FilterOption[] = [
      {
        id: "has_upcoming",
        label: "Has Upcoming Dose",
        icon: "time",
        count: medicines.filter((m) => m.nextDose).length,
      },
    ];

    return [...typeFilters, ...statusFilters, ...scheduleFilters];
  }, [medicines]);

  // Filter and search medicines
  const filteredMedicines = useMemo(() => {
    let result = medicines;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(query) ||
          medicine.dosage.toLowerCase().includes(query) ||
          medicine.unit.toLowerCase().includes(query) ||
          medicine.notes?.toLowerCase().includes(query)
      );
    }

    // Apply type/status/schedule filters
    if (selectedFilters.length > 0) {
      result = result.filter((medicine) => {
        // Check type filters
        if (selectedFilters.includes(medicine.type)) {
          return true;
        }

        // Check status filters
        if (selectedFilters.includes("active") && medicine.is_active) {
          return true;
        }
        if (selectedFilters.includes("inactive") && !medicine.is_active) {
          return true;
        }

        // Check schedule filters
        if (selectedFilters.includes("has_upcoming") && medicine.nextDose) {
          return true;
        }

        return false;
      });
    }

    return result;
  }, [medicines, searchQuery, selectedFilters]);

  const handleFilterToggle = useCallback((filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const renderMedicineCard = useCallback(
    ({ item }: { item: MedicineWithNextDose }) => (
      <MedicineCard medicine={item} />
    ),
    []
  );

  const keyExtractor = useCallback((item: MedicineWithNextDose) => item.id, []);

  const renderEmptyComponent = useCallback(() => {
    // Show different empty states based on context
    if (searchQuery.trim() || selectedFilters.length > 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          description="Try adjusting your search or filters to find what you're looking for"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedFilters([]);
          }}
        />
      );
    }

    return (
      <EmptyState
        icon="medical-outline"
        title="No Medicines Yet"
        description="Add your first medicine to start tracking your medication schedule"
        actionLabel="Add Medicine"
        onAction={handleAddMedicine}
      />
    );
  }, [handleAddMedicine, searchQuery, selectedFilters.length]);

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicineCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search medicines..."
              onClear={handleClearSearch}
            />

            {/* Filter Chips */}
            <FilterChips
              filters={filterOptions}
              selectedFilters={selectedFilters}
              onFilterToggle={handleFilterToggle}
              onClearAll={handleClearFilters}
            />

            {/* Results Count */}
            {(searchQuery.trim() || selectedFilters.length > 0) && (
              <View style={styles.resultsContainer}>
                <Text
                  style={[styles.resultsText, { color: colors.textSecondary }]}
                >
                  {filteredMedicines.length}{" "}
                  {filteredMedicines.length === 1 ? "result" : "results"} found
                </Text>
              </View>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddMedicine}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
    flexGrow: 1,
  },
  headerContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  resultsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  resultsText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
