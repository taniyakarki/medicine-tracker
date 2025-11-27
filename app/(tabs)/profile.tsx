import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Colors, Spacing, Typography } from "../../constants/design";
import { getEmergencyContactsByUserId } from "../../lib/database/models/emergency-contact";
import { ensureNotificationSettings } from "../../lib/database/models/notification-settings";
import { ensureUserExists } from "../../lib/database/models/user";
import {
  EmergencyContact,
  NotificationSettings,
  User,
} from "../../types/database";

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing coming soon!");
  };

  const handleAddEmergencyContact = () => {
    Alert.alert("Add Contact", "Emergency contact management coming soon!");
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
        contentContainerStyle={styles.scrollContent}
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
                <Text
                  style={[
                    styles.profileDetail,
                    { color: colors.textSecondary },
                  ]}
                >
                  {user.email}
                </Text>
              )}
              {user?.phone && (
                <Text
                  style={[
                    styles.profileDetail,
                    { color: colors.textSecondary },
                  ]}
                >
                  {user.phone}
                </Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Emergency Contacts
            </Text>
            <TouchableOpacity onPress={handleAddEmergencyContact}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {emergencyContacts.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No emergency contacts added yet
            </Text>
          ) : (
            emergencyContacts.map((contact) => (
              <View
                key={contact.id}
                style={[
                  styles.contactItem,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.text }]}>
                    {contact.name}
                  </Text>
                  <Text
                    style={[
                      styles.contactDetail,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {contact.relationship} • {contact.phone}
                  </Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity style={styles.contactAction}>
                    <Ionicons name="call" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactAction}>
                    <Ionicons
                      name="chatbubble"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Notification Settings */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notification Settings
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Enable Notifications
              </Text>
            </View>
            <Switch
              value={notificationSettings?.enabled || false}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="volume-high"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Sound
              </Text>
            </View>
            <Text
              style={[styles.settingValue, { color: colors.textSecondary }]}
            >
              {notificationSettings?.sound || "Default"}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="phone-portrait"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Vibration
              </Text>
            </View>
            <Switch
              value={notificationSettings?.vibration || false}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="expand" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Full Screen Alerts
              </Text>
            </View>
            <Switch
              value={notificationSettings?.full_screen_enabled || false}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </Card>

        {/* App Settings */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            App Settings
          </Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Theme
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text
                style={[styles.settingValue, { color: colors.textSecondary }]}
              >
                Auto
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleExportData}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="download"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Export Data
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
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
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
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
    marginTop: Spacing.xs,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    padding: Spacing.lg,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  contactDetail: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  contactActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  contactAction: {
    padding: Spacing.sm,
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
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
  },
  settingValue: {
    fontSize: Typography.fontSize.base,
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
