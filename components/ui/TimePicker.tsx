import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modal } from "./Modal";
import { Colors, Spacing, Typography, BorderRadius } from "../../constants/design";

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialTime?: string;
  title: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  visible,
  onClose,
  onSelect,
  initialTime = "00:00",
  title,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [hours, minutes] = initialTime.split(":").map(Number);
  const [selectedHour, setSelectedHour] = useState(hours);
  const [selectedMinute, setSelectedMinute] = useState(minutes);

  const handleConfirm = () => {
    const timeString = `${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
    onSelect(timeString);
    onClose();
  };

  const renderHourButtons = () => {
    const hourButtons = [];
    for (let i = 0; i < 24; i++) {
      hourButtons.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.timeButton,
            {
              backgroundColor:
                selectedHour === i ? `${colors.primary}20` : colors.surfaceSecondary,
              borderColor: selectedHour === i ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setSelectedHour(i)}
        >
          <Text
            style={[
              styles.timeButtonText,
              {
                color: selectedHour === i ? colors.primary : colors.text,
                fontWeight: selectedHour === i ? "600" : "400",
              },
            ]}
          >
            {i.toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>
      );
    }
    return hourButtons;
  };

  const renderMinuteButtons = () => {
    const minuteButtons = [];
    for (let i = 0; i < 60; i += 5) {
      minuteButtons.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.timeButton,
            {
              backgroundColor:
                selectedMinute === i ? `${colors.primary}20` : colors.surfaceSecondary,
              borderColor: selectedMinute === i ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setSelectedMinute(i)}
        >
          <Text
            style={[
              styles.timeButtonText,
              {
                color: selectedMinute === i ? colors.primary : colors.text,
                fontWeight: selectedMinute === i ? "600" : "400",
              },
            ]}
          >
            {i.toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>
      );
    }
    return minuteButtons;
  };

  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <View style={styles.container}>
        <View style={styles.timeDisplay}>
          <Text style={[styles.timeDisplayText, { color: colors.text }]}>
            {selectedHour.toString().padStart(2, "0")}:{selectedMinute.toString().padStart(2, "0")}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Hours
        </Text>
        <View style={styles.timeGrid}>{renderHourButtons()}</View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Minutes
        </Text>
        <View style={styles.timeGrid}>{renderMinuteButtons()}</View>

        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
        >
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  timeDisplay: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  timeDisplayText: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  timeButton: {
    width: 56,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  timeButtonText: {
    fontSize: Typography.fontSize.base,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});

