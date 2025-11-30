import React, { useEffect, useRef, useMemo, memo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { Shadows, Typography } from "../../constants/design";
import { useIsDarkMode } from "../../lib/hooks/useThemeColors";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
}

export const ProgressRing = memo<ProgressRingProps>(function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 12,
  showPercentage = true,
  showLabel = false,
  label = "Complete",
}) {
  const isDark = useIsDarkMode();
  
  const animatedValue = useRef(new Animated.Value(0)).current;

  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => radius * 2 * Math.PI, [radius]);

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: progress,
      useNativeDriver: true, // Already optimized with native driver
      tension: 40,
      friction: 10,
    }).start();
  }, [progress, animatedValue]);

  const strokeDashoffset = useMemo(
    () => circumference - (progress / 100) * circumference,
    [circumference, progress]
  );

  // Unused but kept for potential future use
  // const progressColor = useMemo(() => {
  //   if (progress >= 80) return colors.success;
  //   if (progress >= 50) return colors.warning;
  //   return colors.danger;
  // }, [progress, colors]);

  const gradientColors = useMemo(() => {
    if (progress >= 80) {
      // Green gradient for good progress
      return isDark 
        ? ['#10B981', '#34D399', '#6EE7B7']
        : ['#059669', '#10B981', '#34D399'];
    } else if (progress >= 50) {
      // Amber gradient for moderate progress
      return isDark
        ? ['#F59E0B', '#FBBF24', '#FCD34D']
        : ['#D97706', '#F59E0B', '#FBBF24'];
    } else {
      // Red gradient for low progress
      return isDark
        ? ['#EF4444', '#F87171', '#FCA5A5']
        : ['#DC2626', '#EF4444', '#F87171'];
    }
  }, [progress, isDark]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow container */}
      <View style={[
        styles.glowContainer,
        {
          width: size + 20,
          height: size + 20,
          borderRadius: (size + 20) / 2,
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.3)',
          ...Shadows.md,
        }
      ]}>
        {/* Inner white background */}
        <View style={[
          styles.innerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.5)',
          }
        ]}>
          <Svg width={size} height={size}>
            <Defs>
              <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="1" />
                <Stop offset="50%" stopColor={gradientColors[1]} stopOpacity="1" />
                <Stop offset="100%" stopColor={gradientColors[2]} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            
            {/* Background circle with subtle color */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.5)'}
              strokeWidth={strokeWidth}
              fill="none"
            />
            
            {/* Progress circle with gradient */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          
          {/* Center content */}
          {showPercentage && (
            <View style={styles.textContainer}>
              <Text style={[styles.percentage, { color: '#FFFFFF' }]}>
                {Math.round(progress)}%
              </Text>
              {showLabel && (
                <Text style={[styles.label, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                  {label}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if progress or size changes significantly
  return Math.round(prevProps.progress) === Math.round(nextProps.progress) &&
         prevProps.size === nextProps.size &&
         prevProps.showPercentage === nextProps.showPercentage &&
         prevProps.showLabel === nextProps.showLabel;
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  glowContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percentage: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
