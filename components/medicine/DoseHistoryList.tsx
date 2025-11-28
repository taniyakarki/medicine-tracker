import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Colors, Spacing, Typography } from "../../constants/design";
import { DoseStatus, DoseWithMedicine } from "../../types/medicine";
import { Card } from "../ui/Card";

interface DoseHistoryListProps {
  doses: DoseWithMedicine[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  showMedicineName?: boolean;
  nested?: boolean; // If true, renders without FlatList for nested ScrollView compatibility
}

type FilterType = "all" | "taken" | "missed" | "skipped";

export const DoseHistoryList: React.FC<DoseHistoryListProps> = ({
  doses,
  onLoadMore,
  hasMore = false,
  loading = false,
  showMedicineName = true,
  nested = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [filter, setFilter] = useState<FilterType>("all");

  const filteredDoses = doses.filter((dose) => {
    if (filter === "all") return true;
    return dose.status === filter;
  });

  const getStatusIcon = (status: DoseStatus) => {
    switch (status) {
      case "taken":
        return "checkmark-circle";
      case "missed":
        return "close-circle";
      case "skipped":
        return "remove-circle";
      case "scheduled":
        return "time";
      default:
        return "help-circle";
    }
  };

  const getStatusColor = useCallback((status: DoseStatus) => {
    switch (status) {
      case "taken":
        return colors.success;
      case "missed":
        return colors.error;
      case "skipped":
        return colors.warning;
      case "scheduled":
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  }, [colors]);

  const getStatusLabel = (status: DoseStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Otherwise return formatted date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeDifference = (scheduledTime: string, takenTime: string) => {
    const scheduled = new Date(scheduledTime);
    const taken = new Date(takenTime);
    const diffMs = taken.getTime() - scheduled.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins === 0) {
      return "on time";
    } else if (diffMins > 0) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m late`;
      }
      return `${diffMins}m late`;
    } else {
      const absMins = Math.abs(diffMins);
      const hours = Math.floor(absMins / 60);
      const mins = absMins % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m early`;
      }
      return `${absMins}m early`;
    }
  };

  const renderFilterButton = (
    filterType: FilterType,
    label: string,
    count: number
  ) => {
    const isActive = filter === filterType;
    return (
      <TouchableOpacity
        onPress={() => setFilter(filterType)}
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive ? colors.primary : colors.cardSecondary,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.filterText,
            { color: isActive ? "#FFFFFF" : colors.text },
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.filterBadge,
            {
              backgroundColor: isActive
                ? "rgba(255,255,255,0.3)"
                : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.filterBadgeText,
              { color: isActive ? "#FFFFFF" : colors.textSecondary },
            ]}
          >
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDoseItem = useCallback(({ item }: { item: DoseWithMedicine }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <Card style={styles.doseCard}>
        <View style={styles.doseHeader}>
          <View
            style={[
              styles.statusIconContainer,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Ionicons name={statusIcon} size={24} color={statusColor} />
          </View>

          <View style={styles.doseMainInfo}>
            {showMedicineName && (
              <Text style={[styles.medicineName, { color: colors.text }]}>
                {item.medicine.name}
              </Text>
            )}
            <View style={styles.firstRow}>
              <Text style={[styles.dosageText, { color: colors.text }]}>
                {item.medicine.dosage} {item.medicine.unit}
              </Text>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDate(item.scheduled_time)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.detailText, { color: colors.textSecondary }]}
              >
                Scheduled: {formatTime(item.scheduled_time)}
              </Text>
            </View>
            {item.taken_time && (
              <View style={styles.takenTimeRow}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={14}
                    color={colors.success}
                  />
                  <Text style={[styles.detailText, { color: colors.success }]}>
                    Taken: {formatTime(item.taken_time)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.timeDiffBadge,
                    {
                      backgroundColor: `${colors.success}10`,
                      borderColor: `${colors.success}30`,
                    },
                  ]}
                >
                  <Text
                    style={[styles.timeDiffText, { color: colors.success }]}
                  >
                    {getTimeDifference(item.scheduled_time, item.taken_time)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}15` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {item.notes && (
          <View
            style={[
              styles.notesContainer,
              { backgroundColor: colors.cardSecondary },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>
              {item.notes}
            </Text>
          </View>
        )}
      </Card>
    );
  }, [showMedicineName, colors, getStatusColor]);

  const keyExtractor = useCallback((item: DoseWithMedicine) => item.id, []);

  const renderEmpty = useCallback(() => (
    <Card style={styles.emptyCard}>
      <Ionicons
        name="calendar-outline"
        size={48}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No {filter !== "all" ? filter : ""} doses found
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        {filter !== "all"
          ? `Try changing the filter to see other doses`
          : "Dose history will appear here once you start tracking"}
      </Text>
    </Card>
  ), [filter, colors]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;

    return (
      <TouchableOpacity
        onPress={onLoadMore}
        disabled={loading}
        style={[
          styles.loadMoreButton,
          { backgroundColor: colors.cardSecondary },
        ]}
      >
        <Text style={[styles.loadMoreText, { color: colors.primary }]}>
          {loading ? "Loading..." : "Load More"}
        </Text>
      </TouchableOpacity>
    );
  }, [hasMore, loading, onLoadMore, colors]);

  const stats = {
    all: doses.length,
    taken: doses.filter((d) => d.status === "taken").length,
    missed: doses.filter((d) => d.status === "missed").length,
    skipped: doses.filter((d) => d.status === "skipped").length,
  };

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton("all", "All", stats.all)}
        {renderFilterButton("taken", "Taken", stats.taken)}
        {renderFilterButton("missed", "Missed", stats.missed)}
        {renderFilterButton("skipped", "Skipped", stats.skipped)}
      </View>

      {/* Dose List */}
      {nested ? (
        // Render without FlatList when nested in ScrollView
        <View style={styles.listContent}>
          {filteredDoses.length === 0 ? (
            renderEmpty()
          ) : (
            <>
              {filteredDoses.map((item) => (
                <View key={item.id}>{renderDoseItem({ item })}</View>
              ))}
              {renderFooter()}
            </>
          )}
        </View>
      ) : (
        // Use FlatList for standalone usage
        <FlatList
          data={filteredDoses}
          renderItem={renderDoseItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={5}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: "wrap",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  filterBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: {
    gap: Spacing.sm,
  },
  doseCard: {
    padding: Spacing.md,
  },
  doseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  doseMainInfo: {
    flex: 1,
    gap: 4,
  },
  medicineName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  firstRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 2,
  },
  dosageText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  separator: {
    fontSize: Typography.fontSize.sm,
    color: "#999",
  },
  dateText: {
    fontSize: Typography.fontSize.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
  },
  takenTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  timeDiffBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeDiffText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.sm,
    alignItems: "flex-start",
  },
  notesText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },
  loadMoreButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  loadMoreText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});
