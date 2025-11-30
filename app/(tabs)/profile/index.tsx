import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Card } from "../../../components/ui/Card";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Modal } from "../../../components/ui/Modal";
import { ThemeSelector } from "../../../components/ui/ThemeSelector";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "../../../constants/design";
import { getEmergencyContactsByUserId } from "../../../lib/database/models/emergency-contact";
import { ensureNotificationSettings } from "../../../lib/database/models/notification-settings";
import { ensureUserExists, updateUser } from "../../../lib/database/models/user";
import {
  exportBackup,
  importBackup,
} from "../../../lib/utils/backup-restore-helpers";
import {
  pickImageFromCamera,
  pickImageFromGallery,
  showImagePickerOptions,
  deleteProfilePhoto,
} from "../../../lib/utils/profile-photo-helpers";
import {
  EmergencyContact,
  NotificationSettings,
  User,
} from "../../../types/database";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [user, setUser] = useState<User | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("auto");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await ensureUserExists();
      setUser(userData);

      const contacts = await getEmergencyContactsByUserId(userData.id);
      setEmergencyContacts(contacts);

      const settings = await ensureNotificationSettings(userData.id);
      setNotificationSettings(settings);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleAddEmergencyContact = () => {
    router.push("/profile/emergency-contacts/add");
  };

  const handleEditEmergencyContact = (contact: EmergencyContact) => {
    router.push(`/profile/emergency-contacts/edit/${contact.id}`);
  };

  const handleDeleteEmergencyContact = (contact: EmergencyContact) => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { deleteEmergencyContact } = await import(
                "../../../lib/database/models/emergency-contact"
              );
              await deleteEmergencyContact(contact.id);
              await loadData();
              Alert.alert("Success", "Contact deleted successfully");
            } catch (error) {
              console.error("Error deleting contact:", error);
              Alert.alert("Error", "Failed to delete contact");
            }
          },
        },
      ]
    );
  };

  const handleCallContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Unable to make phone call")
    );
  };

  const handleMessageContact = (phone: string) => {
    Linking.openURL(`sms:${phone}`).catch(() =>
      Alert.alert("Error", "Unable to send message")
    );
  };


  const handleChangePhoto = async () => {
    try {
      const option = await showImagePickerOptions();
      if (!option) return;

      setUploadingPhoto(true);

      let imageUri: string | null = null;

      if (option === "camera") {
        imageUri = await pickImageFromCamera();
      } else {
        imageUri = await pickImageFromGallery();
      }

      if (imageUri && user) {
        // Delete old photo if exists
        if (user.profile_image) {
          await deleteProfilePhoto(user.profile_image);
        }

        // Update user with new photo
        await updateUser(user.id, { profile_image: imageUri });
        await loadData();
        Alert.alert("Success", "Profile photo updated successfully");
      }
    } catch (error) {
      console.error("Error changing photo:", error);
      Alert.alert("Error", "Failed to update profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleThemeChange = async (mode: "light" | "dark" | "auto") => {
    setThemeMode(mode);
    setShowThemeModal(false);
    Alert.alert(
      "Theme Changed",
      `Theme set to ${mode}. Please restart the app for changes to take effect.`
    );
  };

  const handleExportData = async () => {
    try {
      await exportBackup();
    } catch (error) {
      console.error("Error exporting data:", error);
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleImportData = async () => {
    try {
      await importBackup();
      await loadData();
    } catch (error) {
      console.error("Error importing data:", error);
      // Error is already shown in importBackup
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Profile",
          headerShown: true,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section - Beautiful User Card */}
        <View style={[styles.section, styles.profileCard]}>
          <LinearGradient
            colors={
              colorScheme === "dark"
                ? ["#1a1a2e", "#16213e", "#0f3460"]
                : ["#667eea", "#764ba2", "#f093fb"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientCard, Shadows.md]}
          >
            {/* Decorative Background Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <View style={styles.cardContent}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarOuterRing}>
                  <View style={styles.avatarMiddleRing}>
                    {user?.profile_image ? (
                      <Image
                        source={{ uri: user.profile_image }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <LinearGradient
                        colors={
                          colorScheme === "dark"
                            ? ["#f093fb", "#f5576c", "#4facfe"]
                            : ["#ffffff", "#f0f0f0"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            {
                              color:
                                colorScheme === "dark" ? "#FFFFFF" : "#667eea",
                            },
                          ]}
                        >
                          {user?.name.charAt(0).toUpperCase() || "U"}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                </View>

                {/* Change Photo Button */}
                <TouchableOpacity
                  onPress={handleChangePhoto}
                  style={[
                    styles.editButton,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#f5576c" : "#FFFFFF",
                    },
                  ]}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <Ionicons
                      name="camera"
                      size={18}
                      color={colorScheme === "dark" ? "#FFFFFF" : "#667eea"}
                    />
                  )}
                </TouchableOpacity>

                {/* Edit Profile Button */}
                <TouchableOpacity
                  onPress={handleEditProfile}
                  style={[
                    styles.editProfileButton,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#4facfe" : "#FFFFFF",
                    },
                  ]}
                >
                  <Ionicons
                    name="create"
                    size={18}
                    color={colorScheme === "dark" ? "#FFFFFF" : "#667eea"}
                  />
                </TouchableOpacity>
              </View>

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || "User"}</Text>
                {user?.email && (
                  <View style={styles.emailContainer}>
                    <Ionicons
                      name="mail"
                      size={16}
                      color="rgba(255,255,255,0.85)"
                    />
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                )}
                {!user?.email && user?.phone && (
                  <View style={styles.emailContainer}>
                    <Ionicons
                      name="call"
                      size={16}
                      color="rgba(255,255,255,0.85)"
                    />
                    <Text style={styles.userEmail}>{user.phone}</Text>
                  </View>
                )}
              </View>

              {/* Decorative Stats/Badges */}
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <Ionicons name="heart" size={16} color="#FFFFFF" />
                  <Text style={styles.badgeText}>Health Tracker</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Medical Information */}
        {(user?.blood_type || user?.allergies || user?.medical_conditions) && (
          <Card style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="medical" size={24} color={colors.danger} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Medical Information
              </Text>
            </View>

            {/* Medical Info Items */}
            <View style={styles.medicalList}>
              {user?.blood_type && (
                <View style={styles.medicalItem}>
                  <View
                    style={[
                      styles.medicalIconContainer,
                      { backgroundColor: colors.danger + "15" },
                    ]}
                  >
                    <Ionicons name="water" size={20} color={colors.danger} />
                  </View>
                  <View style={styles.medicalItemContent}>
                    <Text
                      style={[styles.medicalItemTitle, { color: colors.text }]}
                    >
                      Blood Type
                    </Text>
                    <Text
                      style={[
                        styles.medicalItemValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {user.blood_type}
                    </Text>
                  </View>
                </View>
              )}

              {user?.allergies && (
                <View style={styles.medicalItem}>
                  <View
                    style={[
                      styles.medicalIconContainer,
                      { backgroundColor: colors.danger + "15" },
                    ]}
                  >
                    <Ionicons name="warning" size={20} color={colors.danger} />
                  </View>
                  <View style={styles.medicalItemContent}>
                    <Text
                      style={[styles.medicalItemTitle, { color: colors.text }]}
                    >
                      Allergies
                    </Text>
                    <Text
                      style={[
                        styles.medicalItemValue,
                        styles.alertText,
                        { color: colors.danger },
                      ]}
                      numberOfLines={3}
                    >
                      {user.allergies}
                    </Text>
                  </View>
                </View>
              )}

              {user?.medical_conditions && (
                <View style={styles.medicalItem}>
                  <View
                    style={[
                      styles.medicalIconContainer,
                      { backgroundColor: colors.info + "15" },
                    ]}
                  >
                    <Ionicons name="fitness" size={20} color={colors.info} />
                  </View>
                  <View style={styles.medicalItemContent}>
                    <Text
                      style={[styles.medicalItemTitle, { color: colors.text }]}
                    >
                      Medical Conditions
                    </Text>
                    <Text
                      style={[
                        styles.medicalItemValue,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={3}
                    >
                      {user.medical_conditions}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Emergency Contacts */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={colors.danger}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Emergency Contacts
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleAddEmergencyContact}
              style={styles.addButton}
            >
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {emergencyContacts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No emergency contacts added yet
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textTertiary }]}
              >
                Add contacts who can be reached in case of emergency
              </Text>
            </View>
          ) : (
            emergencyContacts.map((contact, index) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactItem,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    marginBottom:
                      index < emergencyContacts.length - 1 ? Spacing.sm : 0,
                  },
                ]}
                onLongPress={() => handleDeleteEmergencyContact(contact)}
                onPress={() => handleEditEmergencyContact(contact)}
              >
                <View style={styles.contactIconWrapper}>
                  <View
                    style={[
                      styles.contactIconContainer,
                      { backgroundColor: colors.danger + "20" },
                    ]}
                  >
                    <Ionicons name="person" size={20} color={colors.danger} />
                  </View>
                  {contact.priority > 0 && (
                    <View
                      style={[
                        styles.primaryBadgeIcon,
                        { backgroundColor: colors.warning },
                      ]}
                    >
                      <Ionicons name="star" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.contactInfo}>
                  <Text
                    style={[styles.contactName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {contact.name}
                  </Text>
                  <View style={styles.contactDetailRow}>
                    <Ionicons
                      name="briefcase-outline"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.contactDetail,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {contact.relationship}
                    </Text>
                  </View>
                  <View style={styles.contactDetailRow}>
                    <Ionicons
                      name="call-outline"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.contactPhone,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {contact.phone}
                    </Text>
                  </View>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={[
                      styles.contactAction,
                      { backgroundColor: colors.success + "20" },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCallContact(contact.phone);
                    }}
                  >
                    <Ionicons name="call" size={18} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.contactAction,
                      { backgroundColor: colors.info + "20" },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMessageContact(contact.phone);
                    }}
                  >
                    <Ionicons name="chatbubble" size={18} color={colors.info} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Card>

        {/* Notification Settings */}
        <Card style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="notifications" size={24} color={colors.info} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notification Settings
            </Text>
          </View>

          <View style={styles.settingsGroup}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/profile/notification-settings")}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.info + "15" },
                  ]}
                >
                  <Ionicons name="settings" size={20} color={colors.info} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Manage Notifications
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {notificationSettings?.enabled
                      ? "Notifications enabled"
                      : "Notifications disabled"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* App Settings */}
        <Card style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="settings" size={24} color={colors.secondary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              App Settings
            </Text>
          </View>

          <View style={styles.settingsGroup}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowThemeModal(true)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.textSecondary + "15" },
                  ]}
                >
                  <Ionicons
                    name={
                      themeMode === "dark"
                        ? "moon"
                        : themeMode === "light"
                        ? "sunny"
                        : "phone-portrait"
                    }
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Theme
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {themeMode === "auto"
                      ? "Auto (System)"
                      : themeMode === "dark"
                      ? "Dark"
                      : "Light"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleExportData}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.info + "15" },
                  ]}
                >
                  <Ionicons name="download" size={20} color={colors.info} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Export Backup
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Download your data as JSON
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleImportData}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.warning + "15" },
                  ]}
                >
                  <Ionicons name="cloud-upload" size={20} color={colors.warning} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Restore Backup
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Import data from backup file
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Support */}
        <Card style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="help-circle" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Support
            </Text>
          </View>

          <View style={styles.settingsGroup}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/profile/report-bug")}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.danger + "15" },
                  ]}
                >
                  <Ionicons name="bug" size={20} color={colors.danger} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Report a Bug
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Let us know about issues
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Alert.alert(
                  "Rate Us",
                  "Enjoying the app? Please rate us on the App Store!"
                )
              }
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.warning + "15" },
                  ]}
                >
                  <Ionicons name="star" size={20} color={colors.warning} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Rate the App
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Share your feedback
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: colors.textTertiary }]}>
            Medicine Tracker v1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: colors.textTertiary }]}>
            Made with ❤️ for better health
          </Text>
        </View>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title="Choose Theme"
      >
        <ThemeSelector
          currentTheme={themeMode}
          onSelectTheme={handleThemeChange}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.md,
  },
  profileCard: {
    overflow: "hidden",
    marginTop: Spacing.md,
  },
  gradientCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -100,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -75,
    left: -30,
  },
  cardContent: {
    alignItems: "center",
    zIndex: 1,
  },
  avatarSection: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  avatarOuterRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
  },
  avatarMiddleRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    ...Shadows.md,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  editProfileButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  userName: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  userEmail: {
    fontSize: Typography.fontSize.base,
    color: "rgba(255,255,255,0.95)",
    fontWeight: Typography.fontWeight.medium,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeText: {
    fontSize: Typography.fontSize.sm,
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.medium,
  },
  medicalList: {
    marginTop: Spacing.md,
  },
  medicalItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  medicalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  medicalItemContent: {
    flex: 1,
  },
  medicalItemTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  medicalItemValue: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  alertText: {
    fontWeight: Typography.fontWeight.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  addButton: {
    padding: Spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    fontWeight: Typography.fontWeight.medium,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  contactIconWrapper: {
    position: "relative",
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBadgeIcon: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  contactInfo: {
    flex: 1,
    gap: 6,
  },
  contactName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 4,
  },
  contactDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  contactDetail: {
    fontSize: Typography.fontSize.sm,
  },
  contactPhone: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  contactActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  contactAction: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsGroup: {
    marginTop: Spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  appInfoText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
});
