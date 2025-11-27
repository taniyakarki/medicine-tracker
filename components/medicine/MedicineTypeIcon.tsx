import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMedicineTypeColor } from '../../constants/design';
import { useColorScheme } from 'react-native';

interface MedicineTypeIconProps {
  type: string;
  size?: number;
}

export const MedicineTypeIcon: React.FC<MedicineTypeIconProps> = ({ type, size = 24 }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const color = getMedicineTypeColor(type, isDark);

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'pill':
        return 'medical';
      case 'liquid':
        return 'water';
      case 'injection':
        return 'fitness';
      case 'inhaler':
        return 'cloud';
      case 'drops':
        return 'water-outline';
      default:
        return 'medical-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color + '20' }]}>
      <Ionicons name={getIconName()} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

