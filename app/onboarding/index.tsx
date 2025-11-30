import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Spacing, Typography } from "../../constants/design";
import { useTheme } from "../../lib/context/AppContext";

const ONBOARDING_KEY = "@medicine_tracker_onboarding_complete";

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: "medical" as const,
      title: "Track Your Medicines",
      description: "Never miss a dose with smart reminders and easy tracking",
    },
    {
      icon: "notifications" as const,
      title: "Smart Notifications",
      description:
        "Get timely reminders with full-screen alerts when it's time to take your medicine",
    },
    {
      icon: "stats-chart" as const,
      title: "Monitor Progress",
      description: "View your adherence statistics and maintain healthy habits",
    },
    {
      icon: "people" as const,
      title: "Share & Care",
      description: "Share medicine schedules with family members (coming soon)",
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Ionicons
            name={currentStepData.icon}
            size={80}
            color={colors.primary}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {currentStepData.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {currentStepData.description}
        </Text>

        <View style={styles.pagination}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentStep ? colors.primary : colors.border,
                  width: index === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        {currentStep < steps.length - 1 && (
          <Button
            title="Skip"
            onPress={handleSkip}
            variant="ghost"
            style={styles.skipButton}
          />
        )}
        <Button
          title={currentStep === steps.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.lg,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.lg,
    paddingHorizontal: Spacing.lg,
  },
  pagination: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing["2xl"],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    gap: Spacing.md,
  },
  skipButton: {
    width: "100%",
  },
  nextButton: {
    width: "100%",
  },
});
