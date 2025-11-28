import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { MedicineCard } from "../../../components/medicine/MedicineCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Colors, Spacing } from "../../../constants/design";
import { useMedicines } from "../../../lib/hooks/useMedicines";
import { MedicineWithNextDose } from "../../../types/medicine";

export default function MedicinesListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const { medicines, loading, refresh } = useMedicines();
  const [refreshing, setRefreshing] = useState(false);

  // Reload medicines when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleAddMedicine = useCallback(() => {
    router.push("/medicines/add");
  }, [router]);

  const renderMedicineCard = useCallback(
    ({ item }: { item: MedicineWithNextDose }) => (
      <MedicineCard medicine={item} />
    ),
    []
  );

  const keyExtractor = useCallback((item: MedicineWithNextDose) => item.id, []);

  const renderEmptyComponent = useCallback(
    () => (
      <EmptyState
        icon="medical-outline"
        title="No Medicines Yet"
        description="Add your first medicine to start tracking your medication schedule"
        actionLabel="Add Medicine"
        onAction={handleAddMedicine}
      />
    ),
    [handleAddMedicine]
  );

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={medicines}
        renderItem={renderMedicineCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.scrollContent}
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
    padding: Spacing.md,
    paddingBottom: 100,
    flexGrow: 1,
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
