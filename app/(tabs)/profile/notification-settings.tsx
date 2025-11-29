import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { Card } from "../../../components/ui/Card";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Modal } from "../../../components/ui/Modal";
import { TimePicker } from "../../../components/ui/TimePicker";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../../constants/design";
import {
  ensureNotificationSettings,
  updateNotificationSettings,
} from "../../../lib/database/models/notification-settings";
import { ensureUserExists } from "../../../lib/database/models/user";
import { NotificationSettings } from "../../../types/database";

const REMIND_BEFORE_OPTIONS = [0, 5, 10, 15, 30];
const REMIND_AFTER_OPTIONS = [0, 15, 30, 60];
const SNOOZE_OPTIONS = [5, 10, 15, 30];
const SOUND_OPTIONS = ["default", "gentle", "loud", "vibrate"];

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showRemindBeforeModal, setShowRemindBeforeModal] = useState(false);
  const [showRemindAfterModal, setShowRemindAfterModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showDndStartModal, setShowDndStartModal] = useState(false);
  const [showDndEndModal, setShowDndEndModal] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const user = await ensureUserExists();
      const notifSettings = await ensureNotificationSettings(user.id);
      setSettings(notifSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
      Alert.alert("Error", "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  }, []);

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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!settings) {
    return null;
  }

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
            disabled={saving}
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
                  {settings.remind_before_minutes === 0
                    ? "Disabled"
                    : `${settings.remind_before_minutes} minutes before`}
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
            disabled={saving}
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
                  {settings.remind_after_missed_minutes === 0
                    ? "Disabled"
                    : `${settings.remind_after_missed_minutes} minutes after`}
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
            disabled={saving}
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
                  {settings.snooze_duration_minutes} minutes
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
            disabled={saving}
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
                  {settings.sound.charAt(0).toUpperCase() +
                    settings.sound.slice(1)}
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

      {/* Modals */}
      <Modal
        visible={showRemindBeforeModal}
        onClose={() => setShowRemindBeforeModal(false)}
        title="Remind Before Dose"
      >
        <View style={styles.modalContent}>
          {REMIND_BEFORE_OPTIONS.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    settings.remind_before_minutes === minutes
                      ? `${colors.primary}20`
                      : colors.surfaceSecondary,
                  borderColor:
                    settings.remind_before_minutes === minutes
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => {
                handleUpdateSetting({ remind_before_minutes: minutes });
                setShowRemindBeforeModal(false);
              }}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {minutes === 0 ? "Disabled" : `${minutes} minutes before`}
              </Text>
              {settings.remind_before_minutes === minutes && (
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal
        visible={showRemindAfterModal}
        onClose={() => setShowRemindAfterModal(false)}
        title="Remind After Missed"
      >
        <View style={styles.modalContent}>
          {REMIND_AFTER_OPTIONS.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    settings.remind_after_missed_minutes === minutes
                      ? `${colors.primary}20`
                      : colors.surfaceSecondary,
                  borderColor:
                    settings.remind_after_missed_minutes === minutes
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => {
                handleUpdateSetting({ remind_after_missed_minutes: minutes });
                setShowRemindAfterModal(false);
              }}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {minutes === 0 ? "Disabled" : `${minutes} minutes after`}
              </Text>
              {settings.remind_after_missed_minutes === minutes && (
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal
        visible={showSnoozeModal}
        onClose={() => setShowSnoozeModal(false)}
        title="Snooze Duration"
      >
        <View style={styles.modalContent}>
          {SNOOZE_OPTIONS.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    settings.snooze_duration_minutes === minutes
                      ? `${colors.primary}20`
                      : colors.surfaceSecondary,
                  borderColor:
                    settings.snooze_duration_minutes === minutes
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => {
                handleUpdateSetting({ snooze_duration_minutes: minutes });
                setShowSnoozeModal(false);
              }}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {minutes} minutes
              </Text>
              {settings.snooze_duration_minutes === minutes && (
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal
        visible={showSoundModal}
        onClose={() => setShowSoundModal(false)}
        title="Notification Sound"
      >
        <View style={styles.modalContent}>
          {SOUND_OPTIONS.map((sound) => (
            <TouchableOpacity
              key={sound}
              style={[
                styles.optionItem,
                {
                  backgroundColor:
                    settings.sound === sound
                      ? `${colors.primary}20`
                      : colors.surfaceSecondary,
                  borderColor:
                    settings.sound === sound ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                handleUpdateSetting({ sound });
                setShowSoundModal(false);
              }}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {sound.charAt(0).toUpperCase() + sound.slice(1)}
              </Text>
              {settings.sound === sound && (
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

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
  modalContent: {
    gap: Spacing.sm,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});

