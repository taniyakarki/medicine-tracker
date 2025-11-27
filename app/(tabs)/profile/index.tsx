import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Colors, Spacing, Typography } from "../../../constants/design";
import { getEmergencyContactsByUserId } from "../../../lib/database/models/emergency-contact";
import { ensureNotificationSettings } from "../../../lib/database/models/notification-settings";
import { ensureUserExists } from "../../../lib/database/models/user";
import {
  EmergencyContact,
  NotificationSettings,
  User,
} from "../../../types/database";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

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
    }, [loadData])
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

  const handleToggleNotifications = async (enabled: boolean) => {
    Alert.alert(
      "Notifications",
      `Notifications ${enabled ? "enabled" : "disabled"}`
    );
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Data export feature coming soon!");
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all your data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Coming Soon",
              "Data clearing will be implemented soon"
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top > 0 ? insets.top : Spacing.md },
        ]}
      >
        {/* Profile Section */}
        <Card style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.name}
              </Text>
              {user?.email && (
                <View style={styles.detailRow}>
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.profileDetail,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {user.email}
                  </Text>
                </View>
              )}
              {user?.phone && (
                <View style={styles.detailRow}>
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.profileDetail,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {user.phone}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Button
            title="Edit Profile"
            onPress={handleEditProfile}
            variant="ghost"
          />
        </Card>

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
                    borderBottomColor: colors.border,
                    borderBottomWidth:
                      index < emergencyContacts.length - 1 ? 1 : 0,
                  },
                ]}
                onLongPress={() => handleDeleteEmergencyContact(contact)}
                onPress={() => handleEditEmergencyContact(contact)}
              >
                <View
                  style={[
                    styles.contactIconContainer,
                    { backgroundColor: colors.danger + "15" },
                  ]}
                >
                  <Ionicons name="person" size={24} color={colors.danger} />
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={[styles.contactName, { color: colors.text }]}>
                      {contact.name}
                    </Text>
                    {contact.priority > 0 && (
                      <View
                        style={[
                          styles.primaryBadge,
                          { backgroundColor: colors.warning + "20" },
                        ]}
                      >
                        <Ionicons
                          name="star"
                          size={12}
                          color={colors.warning}
                        />
                        <Text
                          style={[
                            styles.primaryBadgeText,
                            { color: colors.warning },
                          ]}
                        >
                          Primary
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.contactDetail,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {contact.relationship}
                  </Text>
                  <Text
                    style={[
                      styles.contactPhone,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {contact.phone}
                  </Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={[
                      styles.contactAction,
                      { backgroundColor: colors.success + "15" },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCallContact(contact.phone);
                    }}
                  >
                    <Ionicons name="call" size={20} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.contactAction,
                      { backgroundColor: colors.info + "15" },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMessageContact(contact.phone);
                    }}
                  >
                    <Ionicons
                      name="chatbubble"
                      size={20}
                      color={colors.info}
                    />
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
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Enable Notifications
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Receive medication reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings?.enabled || false}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.success + "15" },
                  ]}
                >
                  <Ionicons
                    name="volume-high"
                    size={20}
                    color={colors.success}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Sound
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {notificationSettings?.sound || "Default"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.warning + "15" },
                  ]}
                >
                  <Ionicons
                    name="phone-portrait"
                    size={20}
                    color={colors.warning}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Vibration
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Vibrate on notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings?.vibration || false}
                onValueChange={() => {}}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.info + "15" },
                  ]}
                >
                  <Ionicons name="expand" size={20} color={colors.info} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Full Screen Alerts
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Show full screen reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings?.full_screen_enabled || false}
                onValueChange={() => {}}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
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
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.textSecondary + "15" },
                  ]}
                >
                  <Ionicons
                    name="moon"
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
                    Auto (System)
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
                    Export Data
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
          </View>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>
            Danger Zone
          </Text>
          <Button
            title="Clear All Data"
            onPress={handleClearData}
            variant="danger"
            style={styles.dangerButton}
          />
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  profileInfo: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  profileName: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  profileDetail: {
    fontSize: Typography.fontSize.base,
    marginLeft: Spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: Spacing.xs,
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
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  contactName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
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
    marginBottom: 2,
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
    borderRadius: 20,
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
  dangerButton: {
    width: "100%",
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


