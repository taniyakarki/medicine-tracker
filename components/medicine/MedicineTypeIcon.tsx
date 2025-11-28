import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { getMedicineTypeColor } from "../../constants/design";

interface MedicineTypeIconProps {
  type: string;
  size?: number;
  color?: string;
}

export const MedicineTypeIcon: React.FC<MedicineTypeIconProps> = ({
  type,
  size = 24,
  color: customColor,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const color = customColor || getMedicineTypeColor(type, isDark);

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "pill":
        return "medical";
      case "tablet":
        return "tablet-portrait";
      case "capsule":
        return "ellipse";
      case "liquid":
        return "water";
      case "syrup":
        return "flask";
      case "injection":
        return "fitness";
      case "inhaler":
        return "cloud";
      case "drops":
        return "water-outline";
      case "eye_drops":
        return "eye";
      case "ear_drops":
        return "ear";
      case "nasal_spray":
        return "cloud-outline";
      case "cream":
      case "ointment":
      case "gel":
        return "hand-left";
      case "patch":
        return "bandage";
      case "suppository":
        return "medical-outline";
      case "powder":
        return "snow";
      case "lozenge":
        return "ellipse-outline";
      case "spray":
        return "water-sharp";
      default:
        return "medical-outline";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color + "20" }]}>
      <Ionicons name={getIconName()} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
