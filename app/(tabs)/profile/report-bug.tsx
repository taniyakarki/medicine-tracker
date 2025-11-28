import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select, SelectOption } from "../../../components/ui/Select";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../../constants/design";

const bugCategories: SelectOption[] = [
  { label: "App Crash", value: "crash" },
  { label: "Feature Not Working", value: "feature" },
  { label: "UI/Display Issue", value: "ui" },
  { label: "Notification Problem", value: "notification" },
  { label: "Data Sync Issue", value: "sync" },
  { label: "Performance Issue", value: "performance" },
  { label: "Other", value: "other" },
];

const severityLevels: SelectOption[] = [
  { label: "Critical - App Unusable", value: "critical" },
  { label: "High - Major Feature Broken", value: "high" },
  { label: "Medium - Inconvenient", value: "medium" },
  { label: "Low - Minor Issue", value: "low" },
];

export default function ReportBugScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    severity: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    deviceInfo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would send this data to your backend
      console.log("Bug Report:", formData);

      Alert.alert(
        "Bug Report Submitted",
        "Thank you for helping us improve! We'll review your report and get back to you soon.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit bug report. Please try again.");
      console.error("Error submitting bug report:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Report a Bug",
          headerBackTitle: "Back",
          headerTintColor: colors.primary,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* Info Banner */}
          <Card
            style={[styles.infoBanner, { backgroundColor: colors.info + "15" }]}
          >
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <View style={styles.infoBannerText}>
              <Text
                style={[styles.infoBannerTitle, { color: colors.text }]}
              >
                      We&apos;re here to help!
              </Text>
              <Text
                style={[
                  styles.infoBannerDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Please provide as much detail as possible to help us fix the
                issue quickly.
              </Text>
            </View>
          </Card>

          {/* Basic Information */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Basic Information
            </Text>

            <Input
              label="Bug Title"
              value={formData.title}
              onChangeText={(text) => {
                setFormData({ ...formData, title: text });
                setErrors({ ...errors, title: "" });
              }}
              placeholder="Brief description of the issue"
              error={errors.title}
              required
            />

            <Select
              label="Category"
              value={formData.category}
              options={bugCategories}
              onSelect={(value) => {
                setFormData({ ...formData, category: value });
                setErrors({ ...errors, category: "" });
              }}
              placeholder="Select bug category"
              error={errors.category}
              required
            />

            <Select
              label="Severity (Optional)"
              value={formData.severity}
              options={severityLevels}
              onSelect={(value) => {
                setFormData({ ...formData, severity: value });
                setErrors({ ...errors, severity: "" });
              }}
              placeholder="How severe is this issue?"
              error={errors.severity}
            />
          </Card>

          {/* Detailed Description */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Detailed Description
            </Text>

            <Input
              label="What happened?"
              value={formData.description}
              onChangeText={(text) => {
                setFormData({ ...formData, description: text });
                setErrors({ ...errors, description: "" });
              }}
              placeholder="Describe the bug in detail..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              error={errors.description}
              required
            />

            <Input
              label="Steps to Reproduce (Optional)"
              value={formData.stepsToReproduce}
              onChangeText={(text) =>
                setFormData({ ...formData, stepsToReproduce: text })
              }
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            <Input
              label="Expected Behavior (Optional)"
              value={formData.expectedBehavior}
              onChangeText={(text) =>
                setFormData({ ...formData, expectedBehavior: text })
              }
              placeholder="What did you expect to happen?"
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            <Input
              label="Actual Behavior (Optional)"
              value={formData.actualBehavior}
              onChangeText={(text) =>
                setFormData({ ...formData, actualBehavior: text })
              }
              placeholder="What actually happened?"
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
          </Card>

          {/* Device Information */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Device Information (Optional)
            </Text>

            <Input
              label="Device & OS Version"
              value={formData.deviceInfo}
              onChangeText={(text) =>
                setFormData({ ...formData, deviceInfo: text })
              }
              placeholder="e.g., iPhone 14, iOS 17.2"
              multiline
              numberOfLines={2}
              style={styles.textArea}
            />

            <View
              style={[
                styles.autoInfoBox,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.autoInfoText, { color: colors.textSecondary }]}
              >
                Device information will be automatically collected when you
                submit
              </Text>
            </View>
          </Card>

          {/* Submit Button */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="ghost"
              style={styles.button}
            />
            <Button
              title="Submit Report"
              onPress={handleSubmit}
              loading={submitting}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  infoBannerDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  autoInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  autoInfoText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
});

