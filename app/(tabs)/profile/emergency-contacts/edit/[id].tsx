import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../../../../../components/ui/Button";
import { LoadingSpinner } from "../../../../../components/ui/LoadingSpinner";
import { Select, SelectOption } from "../../../../../components/ui/Select";
import { Spacing, Typography } from "../../../../../constants/design";
import { useTheme } from "../../../../../lib/context/AppContext";
import {
  getEmergencyContactById,
  updateEmergencyContact,
} from "../../../../../lib/database/models/emergency-contact";
import { EmergencyContact } from "../../../../../types/database";

const relationshipOptions: SelectOption[] = [
  { label: "Spouse", value: "Spouse" },
  { label: "Parent", value: "Parent" },
  { label: "Child", value: "Child" },
  { label: "Sibling", value: "Sibling" },
  { label: "Partner", value: "Partner" },
  { label: "Friend", value: "Friend" },
  { label: "Relative", value: "Relative" },
  { label: "Neighbor", value: "Neighbor" },
  { label: "Caregiver", value: "Caregiver" },
  { label: "Doctor", value: "Doctor" },
  { label: "Other", value: "Other" },
];

export default function EditEmergencyContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  }>({});

  const loadContact = useCallback(async () => {
    try {
      const contactData = await getEmergencyContactById(id);
      if (!contactData) {
        Alert.alert("Error", "Contact not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      setContact(contactData);
      setName(contactData.name);
      setRelationship(contactData.relationship);
      setPhone(contactData.phone);
      setEmail(contactData.email || "");
      setIsPrimary(contactData.priority > 0);
    } catch (error) {
      console.error("Error loading contact:", error);
      Alert.alert("Error", "Failed to load contact data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!relationship.trim()) {
      newErrors.relationship = "Relationship is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !contact) {
      return;
    }

    setSaving(true);
    try {
      await updateEmergencyContact(contact.id, {
        name: name.trim(),
        relationship: relationship.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        priority: isPrimary ? 1 : 0,
      });

      Alert.alert("Success", "Contact updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error updating contact:", error);
      Alert.alert("Error", "Failed to update contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Edit Emergency Contact",
          headerBackTitle: "Back",
          headerTintColor: colors.primary,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
        <View style={styles.form}>
          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Name <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.name ? colors.danger : colors.border,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                placeholder="Enter contact name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
              />
            </View>
            {errors.name && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errors.name}
              </Text>
            )}
          </View>

          {/* Relationship Field */}
          <Select
            label="Relationship"
            value={relationship}
            options={relationshipOptions}
            onSelect={(value) => {
              setRelationship(value);
              if (errors.relationship) {
                setErrors({ ...errors, relationship: undefined });
              }
            }}
            placeholder="Select relationship"
            error={errors.relationship}
            required
          />

          {/* Phone Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Phone Number <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.phone ? colors.danger : colors.border,
                },
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) {
                    setErrors({ ...errors, phone: undefined });
                  }
                }}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errors.phone}
              </Text>
            )}
          </View>

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Email (Optional)
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.email ? colors.danger : colors.border,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                placeholder="Enter email address"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errors.email}
              </Text>
            )}
          </View>

          {/* Primary Contact Toggle */}
          <View style={styles.switchContainer}>
            <View style={styles.switchLeft}>
              <Ionicons name="star" size={20} color={colors.textSecondary} />
              <View style={styles.switchTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Primary Contact
                </Text>
                <Text
                  style={[
                    styles.switchDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Mark as your main emergency contact
                </Text>
              </View>
            </View>
            <Switch
              value={isPrimary}
              onValueChange={setIsPrimary}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Button
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>
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
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  form: {
    gap: Spacing.lg,
  },
  fieldContainer: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchDescription: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
  },
  saveButton: {
    width: "100%",
  },
});

