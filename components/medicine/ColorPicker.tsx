import React from "react";
import { StyleSheet, View } from "react-native";
import { BorderRadius } from "../../constants/design";
import {
  BottomDrawerSelect,
  BottomDrawerSelectOption,
} from "../ui/BottomDrawerSelect";

interface ColorPickerProps {
  value?: string | null;
  onChange: (color: string) => void;
  label?: string;
  error?: string;
}

const MEDICINE_COLORS: BottomDrawerSelectOption[] = [
  { label: "Red", value: "#EF4444" },
  { label: "Pink", value: "#EC4899" },
  { label: "Purple", value: "#A855F7" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Green", value: "#10B981" },
  { label: "Yellow", value: "#EAB308" },
  { label: "Orange", value: "#F97316" },
  { label: "Brown", value: "#92400E" },
  { label: "Gray", value: "#6B7280" },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = "Medicine Color",
  error,
}) => {
  // Add color circles as icons to options
  const colorOptions = MEDICINE_COLORS.map((color) => ({
    ...color,
    icon: (
      <View style={[styles.colorCircle, { backgroundColor: color.value }]} />
    ),
  }));

  return (
    <BottomDrawerSelect
      value={value}
      onChange={onChange}
      options={colorOptions}
      label={label}
      placeholder="Select a color"
      error={error}
      title="Select Color"
      allowClear={true}
      clearLabel="No Color"
    />
  );
};

const styles = StyleSheet.create({
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});
