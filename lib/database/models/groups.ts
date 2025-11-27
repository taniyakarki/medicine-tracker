import { MedicineGroup, MedicineGroupMember } from "../../../types/database";
import {
  deleteRecord,
  executeQuery,
  executeQueryFirst,
  findAll,
  findById,
  insert,
  update,
} from "../operations";

const GROUPS_TABLE = "medicine_groups";
const MEMBERS_TABLE = "medicine_group_members";

// Medicine Groups
export const createMedicineGroup = async (
  groupData: Omit<MedicineGroup, "id" | "created_at">
): Promise<string> => {
  return await insert<MedicineGroup>(GROUPS_TABLE, groupData);
};

export const updateMedicineGroup = async (
  id: string,
  groupData: Partial<MedicineGroup>
): Promise<void> => {
  await update<MedicineGroup>(GROUPS_TABLE, id, groupData);
};

export const deleteMedicineGroup = async (id: string): Promise<void> => {
  await deleteRecord(GROUPS_TABLE, id);
};

export const getMedicineGroupById = async (
  id: string
): Promise<MedicineGroup | null> => {
  return await findById<MedicineGroup>(GROUPS_TABLE, id);
};

export const getAllMedicineGroups = async (): Promise<MedicineGroup[]> => {
  return await findAll<MedicineGroup>(
    GROUPS_TABLE,
    undefined,
    undefined,
    "created_at DESC"
  );
};

// Medicine Group Members
export const addMedicineToGroup = async (
  groupId: string,
  medicineId: string
): Promise<string> => {
  return await insert<MedicineGroupMember>(MEMBERS_TABLE, {
    group_id: groupId,
    medicine_id: medicineId,
  });
};

export const removeMedicineFromGroup = async (
  groupId: string,
  medicineId: string
): Promise<void> => {
  await executeQuery(
    `DELETE FROM ${MEMBERS_TABLE} WHERE group_id = ? AND medicine_id = ?`,
    [groupId, medicineId]
  );
};

export const getMedicinesByGroupId = async (groupId: string) => {
  return await executeQuery(
    `SELECT m.* FROM medicines m
     JOIN ${MEMBERS_TABLE} mgm ON m.id = mgm.medicine_id
     WHERE mgm.group_id = ?
     ORDER BY m.name ASC`,
    [groupId]
  );
};

export const getGroupsByMedicineId = async (
  medicineId: string
): Promise<MedicineGroup[]> => {
  return await executeQuery<MedicineGroup>(
    `SELECT g.* FROM ${GROUPS_TABLE} g
     JOIN ${MEMBERS_TABLE} mgm ON g.id = mgm.group_id
     WHERE mgm.medicine_id = ?
     ORDER BY g.name ASC`,
    [medicineId]
  );
};

export const getGroupMemberCount = async (groupId: string): Promise<number> => {
  const result = await executeQueryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${MEMBERS_TABLE} WHERE group_id = ?`,
    [groupId]
  );
  return result?.count || 0;
};
