import { EmergencyContact } from "../../../types/database";
import { deleteRecord, findAll, findById, insert, update } from "../operations";

const TABLE_NAME = "emergency_contacts";

export const createEmergencyContact = async (
  contactData: Omit<EmergencyContact, "id" | "created_at">
): Promise<string> => {
  return await insert<EmergencyContact>(TABLE_NAME, contactData);
};

export const updateEmergencyContact = async (
  id: string,
  contactData: Partial<EmergencyContact>
): Promise<void> => {
  await update<EmergencyContact>(TABLE_NAME, id, contactData);
};

export const deleteEmergencyContact = async (id: string): Promise<void> => {
  await deleteRecord(TABLE_NAME, id);
};

export const getEmergencyContactById = async (
  id: string
): Promise<EmergencyContact | null> => {
  return await findById<EmergencyContact>(TABLE_NAME, id);
};

export const getEmergencyContactsByUserId = async (
  userId: string
): Promise<EmergencyContact[]> => {
  return await findAll<EmergencyContact>(
    TABLE_NAME,
    "user_id = ?",
    [userId],
    "priority DESC, name ASC"
  );
};

export const getPrimaryContact = async (
  userId: string
): Promise<EmergencyContact | null> => {
  const contacts = await findAll<EmergencyContact>(
    TABLE_NAME,
    "user_id = ?",
    [userId],
    "priority DESC"
  );
  return contacts.length > 0 ? contacts[0] : null;
};
