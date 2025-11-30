import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { OptionModal } from "../../../components/ui/OptionModal";
import { TimePicker } from "../../../components/ui/TimePicker";
import { BorderRadius, Spacing, Typography } from "../../../constants/design";
import {
  ensureNotificationSettings,
  updateNotificationSettings,
} from "../../../lib/database/models/notification-settings";
import { ensureUserExists } from "../../../lib/database/models/user";
import { useThemeColors } from "../../../lib/hooks/useThemeColors";
import { NotificationSettings } from "../../../types/database";

const REMIND_BEFORE_OPTIONS = [
  { label: "Disabled", value: 0 },
  { label: "5 minutes before", value: 5 },
  { label: "10 minutes before", value: 10 },
  { label: "15 minutes before", value: 15 },
  { label: "30 minutes before", value: 30 },
  { label: "1 hour before", value: 60 },
];

const REMIND_AFTER_OPTIONS = [
  { label: "Disabled", value: 0 },
  { label: "15 minutes after", value: 15 },
  { label: "30 minutes after", value: 30 },
  { label: "1 hour after", value: 60 },
  { label: "2 hours after", value: 120 },
];

const SNOOZE_OPTIONS = [
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
];

const SOUND_OPTIONS = [
  { label: "Default", value: "default", icon: "volume-high" as const },
  { label: "Gentle", value: "gentle", icon: "volume-low" as const },
  { label: "Loud", value: "loud", icon: "volume-high" as const },
  { label: "Vibrate Only", value: "vibrate", icon: "phone-portrait" as const },
];

export default function NotificationSettingsScreen() {
  const colors = useThemeColors();

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<string>("undetermined");
  const [testingNotification, setTestingNotification] = useState(false);

  const [showRemindBeforeModal, setShowRemindBeforeModal] = useState(false);
  const [showRemindAfterModal, setShowRemindAfterModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showDndStartModal, setShowDndStartModal] = useState(false);
  const [showDndEndModal, setShowDndEndModal] = useState(false);

  const checkPermissions = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    return status;
  }, []);

  const requestPermissions = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);

    if (status !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Please enable notifications in your device settings to receive medication reminders.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }

    return status;
  }, []);

  const sendTestNotification = useCallback(async () => {
    try {
      setTestingNotification(true);

      const status = await checkPermissions();
      if (status !== "granted") {
        await requestPermissions();
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification 💊",
          body: "This is how your medication reminders will look!",
          sound: settings?.sound === "vibrate" ? undefined : true,
          vibrate: settings?.vibration ? [0, 250, 250, 250] : undefined,
        },
        trigger: null, // Send immediately
      });

      Alert.alert("Success", "Test notification sent!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Error", "Failed to send test notification");
    } finally {
      setTestingNotification(false);
    }
  }, [settings, checkPermissions, requestPermissions]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const user = await ensureUserExists();
      const notifSettings = await ensureNotificationSettings(user.id);
      setSettings(notifSettings);
      await checkPermissions();
    } catch (error) {
      console.error("Error loading settings:", error);
      Alert.alert("Error", "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  }, [checkPermissions]);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleUpdateSetting = async (
    updates: Partial<NotificationSettings>
  ) => {
    if (!settings) return;

    try {
      setSaving(true);
      await updateNotificationSettings(settings.id, updates);
      setSettings({ ...settings, ...updates });
    } catch (error) {
      console.error("Error updating settings:", error);
      Alert.alert("Error", "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "Not set";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getPermissionStatusInfo = () => {
    switch (permissionStatus) {
      case "granted":
        return {
          icon: "checkmark-circle" as const,
          color: colors.success,
          text: "Notifications Enabled",
          description: "You'll receive medication reminders",
        };
      case "denied":
        return {
          icon: "close-circle" as const,
          color: colors.danger,
          text: "Notifications Disabled",
          description: "Enable in device settings to receive reminders",
        };
      default:
        return {
          icon: "alert-circle" as const,
          color: colors.warning,
          text: "Permission Required",
          description: "Tap to enable notification permissions",
        };
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!settings) {
    return null;
  }

  const permissionInfo = getPermissionStatusInfo();
  const needsPermission = permissionStatus !== "granted";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Notification Settings",
          headerShown: true,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Permission Status Banner */}
        {needsPermission && (
          <TouchableOpacity
            style={[
              styles.permissionBanner,
              {
                backgroundColor: `${permissionInfo.color}15`,
                borderColor: permissionInfo.color,
              },
            ]}
            onPress={requestPermissions}
            activeOpacity={0.7}
          >
            <Ionicons
              name={permissionInfo.icon}
              size={24}
              color={permissionInfo.color}
              style={styles.bannerIcon}
            />
            <View style={styles.bannerTextContainer}>
              <Text
                style={[styles.bannerTitle, { color: permissionInfo.color }]}
              >
                {permissionInfo.text}
              </Text>
              <Text
                style={[
                  styles.bannerDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {permissionInfo.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={permissionInfo.color}
            />
          </TouchableOpacity>
        )}

        {/* Permission Status Indicator (when granted) */}
        {!needsPermission && (
          <View
            style={[
              styles.permissionCard,
              { backgroundColor: `${colors.success}10` },
            ]}
          >
            <View style={styles.permissionCardContent}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text
                style={[styles.permissionCardText, { color: colors.success }]}
              >
                Notifications are enabled
              </Text>
            </View>
          </View>
        )}

        {/* Test Notification Button */}
        <Button
          title="Send Test Notification"
          onPress={sendTestNotification}
          variant="secondary"
          loading={testingNotification}
          disabled={needsPermission}
          style={styles.testButton}
        />

        {/* General Settings */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            General
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications"
                size={24}
                color={colors.primary}
                style={styles.settingIcon}
              />
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
              value={settings.enabled}
              onValueChange={(value) => handleUpdateSetting({ enabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="phone-portrait"
                size={24}
                color={colors.warning}
                style={styles.settingIcon}
              />
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
              value={settings.vibration}
              onValueChange={(value) =>
                handleUpdateSetting({ vibration: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="expand"
                size={24}
                color={colors.info}
                style={styles.settingIcon}
              />
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
              value={settings.full_screen_enabled}
              onValueChange={(value) =>
                handleUpdateSetting({ full_screen_enabled: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              disabled={saving}
            />
          </View>
        </Card>

        {/* Reminder Timing */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Reminder Timing
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowRemindBeforeModal(true)}
            disabled={saving || needsPermission}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="time-outline"
                size={24}
                color={colors.success}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Remind Before Dose
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {REMIND_BEFORE_OPTIONS.find(
                    (o) => o.value === settings.remind_before_minutes
                  )?.label || "Not set"}
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
            onPress={() => setShowRemindAfterModal(true)}
            disabled={saving || needsPermission}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="alarm-outline"
                size={24}
                color={colors.danger}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Remind After Missed
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {REMIND_AFTER_OPTIONS.find(
                    (o) => o.value === settings.remind_after_missed_minutes
                  )?.label || "Not set"}
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
            onPress={() => setShowSnoozeModal(true)}
            disabled={saving || needsPermission}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="hourglass-outline"
                size={24}
                color={colors.warning}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Snooze Duration
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {SNOOZE_OPTIONS.find(
                    (o) => o.value === settings.snooze_duration_minutes
                  )?.label || "Not set"}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </Card>

        {/* Do Not Disturb */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Do Not Disturb
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="moon"
                size={24}
                color={colors.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Enable DND
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Suppress notifications during quiet hours
                </Text>
              </View>
            </View>
            <Switch
              value={settings.dnd_enabled}
              onValueChange={(value) =>
                handleUpdateSetting({ dnd_enabled: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              disabled={saving}
            />
          </View>

          {settings.dnd_enabled && (
            <>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setShowDndStartModal(true)}
                disabled={saving}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="moon-outline"
                    size={24}
                    color={colors.textSecondary}
                    style={styles.settingIcon}
                  />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Start Time
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatTime(settings.dnd_start_time)}
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
                onPress={() => setShowDndEndModal(true)}
                disabled={saving}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="sunny-outline"
                    size={24}
                    color={colors.textSecondary}
                    style={styles.settingIcon}
                  />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      End Time
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatTime(settings.dnd_end_time)}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="alert-circle"
                    size={24}
                    color={colors.danger}
                    style={styles.settingIcon}
                  />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Allow Critical
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Important medicines bypass DND
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.dnd_allow_critical}
                  onValueChange={(value) =>
                    handleUpdateSetting({ dnd_allow_critical: value })
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                  disabled={saving}
                />
              </View>
            </>
          )}
        </Card>

        {/* Sound & Appearance */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sound & Appearance
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowSoundModal(true)}
            disabled={saving || needsPermission}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="volume-high"
                size={24}
                color={colors.success}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Notification Sound
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {SOUND_OPTIONS.find((o) => o.value === settings.sound)
                    ?.label || "Default"}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Option Modals */}
      <OptionModal
        visible={showRemindBeforeModal}
        onClose={() => setShowRemindBeforeModal(false)}
        title="Remind Before Dose"
        options={REMIND_BEFORE_OPTIONS}
        selectedValue={settings.remind_before_minutes}
        onSelect={(value) => {
          handleUpdateSetting({ remind_before_minutes: value as number });
          setShowRemindBeforeModal(false);
        }}
      />

      <OptionModal
        visible={showRemindAfterModal}
        onClose={() => setShowRemindAfterModal(false)}
        title="Remind After Missed"
        options={REMIND_AFTER_OPTIONS}
        selectedValue={settings.remind_after_missed_minutes}
        onSelect={(value) => {
          handleUpdateSetting({ remind_after_missed_minutes: value as number });
          setShowRemindAfterModal(false);
        }}
      />

      <OptionModal
        visible={showSnoozeModal}
        onClose={() => setShowSnoozeModal(false)}
        title="Snooze Duration"
        options={SNOOZE_OPTIONS}
        selectedValue={settings.snooze_duration_minutes}
        onSelect={(value) => {
          handleUpdateSetting({ snooze_duration_minutes: value as number });
          setShowSnoozeModal(false);
        }}
      />

      <OptionModal
        visible={showSoundModal}
        onClose={() => setShowSoundModal(false)}
        title="Notification Sound"
        options={SOUND_OPTIONS}
        selectedValue={settings.sound}
        onSelect={(value) => {
          handleUpdateSetting({ sound: value as string });
          setShowSoundModal(false);
        }}
      />

      <TimePicker
        visible={showDndStartModal}
        onClose={() => setShowDndStartModal(false)}
        onSelect={(time) => handleUpdateSetting({ dnd_start_time: time })}
        initialTime={settings.dnd_start_time}
        title="DND Start Time"
      />

      <TimePicker
        visible={showDndEndModal}
        onClose={() => setShowDndEndModal(false)}
        onSelect={(time) => handleUpdateSetting({ dnd_end_time: time })}
        initialTime={settings.dnd_end_time}
        title="DND End Time"
      />
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
    paddingBottom: Spacing.xl,
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  bannerIcon: {
    marginRight: Spacing.md,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  bannerDescription: {
    fontSize: Typography.fontSize.sm,
  },
  permissionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  permissionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  permissionCardText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  testButton: {
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: Spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
  },
});
