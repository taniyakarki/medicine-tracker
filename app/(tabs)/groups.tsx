import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../constants/design";
import {
  getAllMedicineGroups,
  getGroupMemberCount,
} from "../../lib/database/models/groups";
import { MedicineGroup } from "../../types/database";

interface GroupWithCount extends MedicineGroup {
  memberCount: number;
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await getAllMedicineGroups();

      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        groupsData.map(async (group) => {
          const count = await getGroupMemberCount(group.id);
          return { ...group, memberCount: count };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    Alert.alert("Create Group", "Group creation feature coming soon!");
  };

  const handleGroupPress = (group: GroupWithCount) => {
    Alert.alert(
      group.name,
      `${group.description || "No description"}\n\n${
        group.memberCount
      } medicine(s) in this group`,
      [
        { text: "OK" },
        {
          text: "Share",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "Sharing feature will be available soon"
            ),
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
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              About Medicine Groups
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Create groups to organize your medicines and share them with family
            members or caregivers. Sharing features will be available in a
            future update.
          </Text>
        </Card>

        {/* Groups List */}
        {groups.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Groups Yet"
            description="Create groups to organize and share your medicines with others"
            actionLabel="Create Group"
            onAction={handleCreateGroup}
          />
        ) : (
          <>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                onPress={() => handleGroupPress(group)}
                activeOpacity={0.7}
              >
                <Card style={styles.groupCard}>
                  <View style={styles.groupHeader}>
                    <View
                      style={[
                        styles.groupIcon,
                        { backgroundColor: colors.primary + "20" },
                      ]}
                    >
                      <Ionicons
                        name="people"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={[styles.groupName, { color: colors.text }]}>
                        {group.name}
                      </Text>
                      {group.description && (
                        <Text
                          style={[
                            styles.groupDescription,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={2}
                        >
                          {group.description}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.groupMeta,
                          { color: colors.textTertiary },
                        ]}
                      >
                        {group.memberCount} medicine
                        {group.memberCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}

            <Button
              title="Create New Group"
              onPress={handleCreateGroup}
              variant="ghost"
              style={styles.createButton}
            />
          </>
        )}

        {/* Sharing Feature Preview */}
        <Card style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Ionicons name="share-social" size={32} color={colors.secondary} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Sharing Coming Soon
            </Text>
          </View>
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Soon you&apos;ll be able to:
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text
                style={[
                  styles.featureItemText,
                  { color: colors.textSecondary },
                ]}
              >
                Share medicine schedules with family
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text
                style={[
                  styles.featureItemText,
                  { color: colors.textSecondary },
                ]}
              >
                Get notified when shared medicines are missed
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text
                style={[
                  styles.featureItemText,
                  { color: colors.textSecondary },
                ]}
              >
                Manage medicines for multiple people
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text
                style={[
                  styles.featureItemText,
                  { color: colors.textSecondary },
                ]}
              >
                Control who can view or edit schedules
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {groups.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleCreateGroup}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
    paddingBottom: 100,
  },
  infoCard: {
    marginBottom: Spacing.md,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  infoText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  groupCard: {
    marginBottom: Spacing.md,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  groupInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  groupName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  groupDescription: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  groupMeta: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  createButton: {
    marginTop: Spacing.md,
  },
  featureCard: {
    marginTop: Spacing.lg,
  },
  featureHeader: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  featureTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.md,
  },
  featureList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  featureItemText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
