import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import {
  Colors,
  Spacing,
  Typography,
} from "../../constants/design";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - Spacing.md * 4;
const CHART_HEIGHT = 200;

// ============================================================================
// Bar Chart Component
// ============================================================================

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  maxValue?: number;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  maxValue,
  showValues = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const barWidth = (CHART_WIDTH - Spacing.md * (data.length + 1)) / data.length;
  const chartHeight = CHART_HEIGHT - 40; // Leave space for labels

  return (
    <View style={styles.chartContainer}>
      {title && (
        <Text style={[styles.chartTitle, { color: colors.text }]}>{title}</Text>
      )}

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight * (1 - ratio);
          return (
            <Line
              key={index}
              x1={0}
              y1={y}
              x2={CHART_WIDTH}
              y2={y}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / max) * chartHeight;
          const x = Spacing.md + index * (barWidth + Spacing.md);
          const y = chartHeight - barHeight;
          const barColor = item.color || colors.primary;

          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                rx={4}
              />

              {/* Value label on top of bar */}
              {showValues && item.value > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize={12}
                  fill={colors.text}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {item.value}
                </SvgText>
              )}

              {/* X-axis label */}
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + 20}
                fontSize={11}
                fill={colors.textSecondary}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

// ============================================================================
// Line Chart Component
// ============================================================================

export interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  maxValue?: number;
  color?: string;
  showDots?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  maxValue,
  color,
  showDots = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const lineColor = color || colors.primary;
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const chartHeight = CHART_HEIGHT - 40;
  const pointSpacing = CHART_WIDTH / (data.length - 1 || 1);

  // Generate path for the line
  const linePath = data
    .map((item, index) => {
      const x = index * pointSpacing;
      const y = chartHeight - (item.value / max) * chartHeight;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  // Generate path for the filled area under the line
  const areaPath =
    linePath +
    ` L ${(data.length - 1) * pointSpacing} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <View style={styles.chartContainer}>
      {title && (
        <Text style={[styles.chartTitle, { color: colors.text }]}>{title}</Text>
      )}

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight * (1 - ratio);
          return (
            <Line
              key={index}
              x1={0}
              y1={y}
              x2={CHART_WIDTH}
              y2={y}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Filled area under the line */}
        <Path d={areaPath} fill={`${lineColor}20`} />

        {/* Line */}
        <Path d={linePath} stroke={lineColor} strokeWidth={3} fill="none" />

        {/* Data points */}
        {showDots &&
          data.map((item, index) => {
            const x = index * pointSpacing;
            const y = chartHeight - (item.value / max) * chartHeight;

            return (
              <React.Fragment key={index}>
                <Circle cx={x} cy={y} r={5} fill={lineColor} />
                <Circle cx={x} cy={y} r={3} fill="#FFFFFF" />
              </React.Fragment>
            );
          })}

        {/* X-axis labels */}
        {data.map((item, index) => {
          const x = index * pointSpacing;
          return (
            <SvgText
              key={index}
              x={x}
              y={chartHeight + 20}
              fontSize={11}
              fill={colors.textSecondary}
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

// ============================================================================
// Pie Chart Component
// ============================================================================

export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  size = 200,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calculate pie slices
  let currentAngle = -90; // Start at top

  const slices = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc path
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    currentAngle = endAngle;

    return {
      ...item,
      path,
      percentage: Math.round(percentage * 100),
    };
  });

  return (
    <View style={styles.chartContainer}>
      {title && (
        <Text style={[styles.chartTitle, { color: colors.text }]}>{title}</Text>
      )}

      <View style={styles.pieContainer}>
        <Svg width={size} height={size}>
          {slices.map((slice, index) => (
            <Path key={index} d={slice.path} fill={slice.color} />
          ))}
        </Svg>

        {/* Legend */}
        <View style={styles.pieLegend}>
          {slices.map((slice, index) => (
            <View key={index} style={styles.pieLegendItem}>
              <View
                style={[
                  styles.pieLegendDot,
                  { backgroundColor: slice.color },
                ]}
              />
              <Text style={[styles.pieLegendText, { color: colors.text }]}>
                {slice.label}
              </Text>
              <Text
                style={[styles.pieLegendValue, { color: colors.textSecondary }]}
              >
                {slice.percentage}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// Progress Ring Component
// ============================================================================

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color,
  backgroundColor,
  children,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const ringColor = color || colors.primary;
  const bgColor = backgroundColor || colors.border;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      {children && (
        <View style={styles.progressRingCenter}>{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    width: "100%",
    marginVertical: Spacing.md,
  },
  chartTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  pieContainer: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  pieLegend: {
    width: "100%",
    gap: Spacing.sm,
  },
  pieLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  pieLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pieLegendText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },
  pieLegendValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  progressRingContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressRingCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

