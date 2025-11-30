import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
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

export interface CalendarDayData {
  date: string; // ISO date string
  total: number;
  taken: number;
  missed: number;
  skipped: number;
}

interface CalendarProps {
  month: Date; // The month to display
  onMonthChange: (newMonth: Date) => void;
  dayData: CalendarDayData[]; // Data for each day
  onDayPress?: (date: string) => void;
  selectedDate?: string;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const Calendar: React.FC<CalendarProps> = ({
  month,
  onMonthChange,
  dayData,
  onDayPress,
  selectedDate,
}) => {
  const { colors } = useTheme();

  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, CalendarDayData>();
    dayData.forEach((data) => {
      const dateKey = data.date.split("T")[0]; // Get just the date part
      map.set(dateKey, data);
    });
    return map;
  }, [dayData]);

  // Get calendar grid (weeks with days)
  const calendarGrid = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    // First day of the month
    const firstDay = new Date(year, monthIndex, 1);
    const firstDayOfWeek = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Build the grid
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    // Fill in empty days before the first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // Fill in the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, monthIndex, day));

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill in remaining empty days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [month]);

  const handlePrevMonth = () => {
    const newMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    onMonthChange(newMonth);
  };

  const getDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getDayColor = (date: Date): string => {
    const dateKey = getDateKey(date);
    const data = dataMap.get(dateKey);

    if (!data || data.total === 0) {
      return colors.border; // No data
    }

    const adherence = data.taken / data.total;

    if (adherence >= 0.8) {
      return colors.success; // Green - good adherence
    } else if (adherence >= 0.5) {
      return colors.warning; // Yellow - partial adherence
    } else {
      return colors.danger; // Red - poor adherence
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return getDateKey(date) === selectedDate.split("T")[0];
  };

  const monthName = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      {/* Header with month navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={[
            styles.navButton,
            { backgroundColor: colors.surfaceSecondary },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.monthText, { color: colors.text }]}>
          {monthName}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={[
            styles.navButton,
            { backgroundColor: colors.surfaceSecondary },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Days of week header */}
      <View style={styles.daysOfWeekRow}>
        {DAYS_OF_WEEK.map((day) => (
          <View key={day} style={styles.dayOfWeekCell}>
            <Text
              style={[styles.dayOfWeekText, { color: colors.textSecondary }]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarGrid.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((date, dayIndex) => {
              if (!date) {
                return <View key={dayIndex} style={styles.emptyDay} />;
              }

              const dateKey = getDateKey(date);
              const data = dataMap.get(dateKey);
              const dayColor = getDayColor(date);
              const isTodayDate = isToday(date);
              const isSelectedDate = isSelected(date);

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                  styles.day,
                  { backgroundColor: colors.surfaceSecondary },
                  isTodayDate && { borderWidth: 2, borderColor: colors.primary },
                    isSelectedDate && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => onDayPress?.(date.toISOString())}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isSelectedDate
                          ? "#FFFFFF"
                          : isTodayDate
                          ? colors.primary
                        : colors.text,
                    },
                    ]}
                  >
                    {date.getDate()}
                  </Text>

                  {data && data.total > 0 && (
                    <View
                      style={[
                        styles.indicator,
                        {
                          backgroundColor: isSelectedDate
                            ? "#FFFFFF"
                            : dayColor,
                        },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { borderTopColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.success }]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Good (≥80%)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.warning }]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Partial (50-79%)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.danger }]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Poor (&lt;50%)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  daysOfWeekRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  dayOfWeekText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  grid: {
    gap: Spacing.xs,
  },
  week: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  emptyDay: {
    flex: 1,
    aspectRatio: 1,
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  todayText: {
    fontWeight: Typography.fontWeight.bold,
  },
  indicator: {
    position: "absolute",
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.fontSize.xs,
  },
});
