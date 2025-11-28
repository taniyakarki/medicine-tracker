import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../../components/ui/Button";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Modal } from "../../../components/ui/Modal";
import {
  BorderRadius,
  Colors,
  Layout,
  Spacing,
  Typography,
} from "../../../constants/design";
import {
  ensureUserExists,
  updateUser,
} from "../../../lib/database/models/user";
import { User } from "../../../types/database";

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [address, setAddress] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
  }>({});

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genders = ["Male", "Female", "Other", "Prefer not to say"];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await ensureUserExists();
      setUser(userData);
      setName(userData.name);
      setEmail(userData.email || "");
      setPhone(userData.phone || "");
      setDateOfBirth(
        userData.date_of_birth ? new Date(userData.date_of_birth) : undefined
      );
      setGender(userData.gender || "");
      setAddress(userData.address || "");
      setBloodType(userData.blood_type || "");
      setAllergies(userData.allergies || "");
      setMedicalConditions(userData.medical_conditions || "");
    } catch (error) {
      console.error("Error loading user:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (dateOfBirth && dateOfBirth > new Date()) {
      newErrors.dateOfBirth = "Date of birth cannot be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) {
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        name: name.trim(),
      };

      // Only include fields that have values
      if (email && email.trim()) {
        updateData.email = email.trim();
      }
      if (phone && phone.trim()) {
        updateData.phone = phone.trim();
      }
      if (dateOfBirth) {
        updateData.date_of_birth = dateOfBirth.toISOString().split("T")[0];
      }
      if (gender) {
        updateData.gender = gender;
      }
      if (address && address.trim()) {
        updateData.address = address.trim();
      }
      if (bloodType) {
        updateData.blood_type = bloodType;
      }
      if (allergies && allergies.trim()) {
        updateData.allergies = allergies.trim();
      }
      if (medicalConditions && medicalConditions.trim()) {
        updateData.medical_conditions = medicalConditions.trim();
      }

      await updateUser(user.id, updateData);

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all your data? This action cannot be undone.\n\nThis will delete:\n• All medicines\n• All dose history\n• All schedules\n• Emergency contacts\n• Notification settings\n\nYour profile information will be kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Coming Soon",
              "Data clearing functionality will be implemented soon"
            );
          },
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
      if (errors.dateOfBirth) {
        setErrors({ ...errors, dateOfBirth: undefined });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top > 0 ? insets.top : Spacing.md,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Profile
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Photo upload will be available soon"
                )
              }
            >
              <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Name <Text style={styles.required}>*</Text>
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
                  placeholder="Enter your name"
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

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
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
                  placeholder="Enter your email"
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

            {/* Phone Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
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
                  placeholder="Enter your phone number"
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

            {/* Date of Birth Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Date of Birth
              </Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.dateOfBirth
                      ? colors.danger
                      : colors.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={[
                    styles.pickerButtonText,
                    {
                      color: dateOfBirth ? colors.text : colors.textTertiary,
                    },
                  ]}
                >
                  {dateOfBirth
                    ? dateOfBirth.toLocaleDateString()
                    : "Select date of birth"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {errors.dateOfBirth && (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {errors.dateOfBirth}
                </Text>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
              {Platform.OS === "ios" && showDatePicker && (
                <View style={styles.datePickerButtons}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerButton}
                  >
                    <Text style={{ color: colors.primary }}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Gender Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowGenderPicker(true)}
              >
                <Text
                  style={[
                    styles.pickerButtonText,
                    {
                      color: gender ? colors.text : colors.textTertiary,
                    },
                  ]}
                >
                  {gender || "Select gender"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Address Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Address
              </Text>
              <View
                style={[
                  styles.textAreaWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.textAreaIconContainer}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your address"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Medical Information Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Medical Information
              </Text>
            </View>

            {/* Blood Type Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Blood Type
              </Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowBloodTypePicker(true)}
              >
                <Text
                  style={[
                    styles.pickerButtonText,
                    {
                      color: bloodType ? colors.text : colors.textTertiary,
                    },
                  ]}
                >
                  {bloodType || "Select blood type"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Allergies Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Allergies
              </Text>
              <View
                style={[
                  styles.textAreaWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.textAreaIconContainer}>
                  <Ionicons
                    name="warning-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text }]}
                  value={allergies}
                  onChangeText={setAllergies}
                  placeholder="List any allergies (e.g., Penicillin, Peanuts)"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              <Text
                style={[styles.helperText, { color: colors.textSecondary }]}
              >
                Important for emergency situations
              </Text>
            </View>

            {/* Medical Conditions Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Medical Conditions
              </Text>
              <View
                style={[
                  styles.textAreaWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.textAreaIconContainer}>
                  <Ionicons
                    name="fitness-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text }]}
                  value={medicalConditions}
                  onChangeText={setMedicalConditions}
                  placeholder="List any chronic conditions (e.g., Diabetes, Hypertension)"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              <Text
                style={[styles.helperText, { color: colors.textSecondary }]}
              >
                Helps healthcare providers give better care
              </Text>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerZoneContainer}>
            <View style={styles.dangerZoneHeader}>
              <Ionicons name="warning" size={24} color={colors.danger} />
              <Text style={[styles.dangerZoneTitle, { color: colors.danger }]}>
                Danger Zone
              </Text>
            </View>

            <View style={styles.dangerZoneContent}>
              <Text
                style={[
                  styles.dangerZoneDescription,
                  { color: colors.textSecondary },
                ]}
              >
                These actions are irreversible. Please proceed with caution.
              </Text>
              <Button
                title="Clear All Data"
                onPress={handleClearData}
                variant="danger"
                style={styles.dangerButton}
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
              paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.lg,
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

      {/* Blood Type Picker Modal */}
      <Modal
        visible={showBloodTypePicker}
        onClose={() => setShowBloodTypePicker(false)}
        title="Select Blood Type"
      >
        {bloodTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.option,
              {
                backgroundColor:
                  bloodType === type ? colors.primaryLight : "transparent",
              },
            ]}
            onPress={() => {
              setBloodType(type);
              setShowBloodTypePicker(false);
            }}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: bloodType === type ? "#FFFFFF" : colors.text,
                  fontWeight:
                    bloodType === type
                      ? Typography.fontWeight.semibold
                      : Typography.fontWeight.normal,
                },
              ]}
            >
              {type}
            </Text>
            {bloodType === type && (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </Modal>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        onClose={() => setShowGenderPicker(false)}
        title="Select Gender"
      >
        {genders.map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.option,
              {
                backgroundColor:
                  gender === g ? colors.primaryLight : "transparent",
              },
            ]}
            onPress={() => {
              setGender(g);
              setShowGenderPicker(false);
            }}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: gender === g ? "#FFFFFF" : colors.text,
                  fontWeight:
                    gender === g
                      ? Typography.fontWeight.semibold
                      : Typography.fontWeight.normal,
                },
              ]}
            >
              {g}
            </Text>
            {gender === g && (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  changePhotoButton: {
    padding: Spacing.sm,
  },
  changePhotoText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
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
  required: {
    color: Colors.light.danger,
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
  helperText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  textAreaWrapper: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 100,
  },
  textAreaIconContainer: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  textAreaInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    minHeight: 80,
    paddingTop: 0,
    textAlignVertical: "top",
  },
  pickerButton: {
    height: Layout.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerButtonText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
  datePickerButtons: {
    alignItems: "flex-end",
    marginTop: Spacing.sm,
  },
  datePickerButton: {
    padding: Spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
  dangerZoneContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.danger + "30",
    backgroundColor: Colors.light.danger + "05",
  },
  dangerZoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dangerZoneTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  dangerZoneContent: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  dangerZoneDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  dangerButton: {
    width: "100%",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  saveButton: {
    width: "100%",
  },
});
