import { User } from "../../../types/database";
import { deleteRecord, findAll, findById, insert, update } from "../operations";

const TABLE_NAME = "users";

export const createUser = async (
  userData: Omit<User, "id" | "created_at" | "updated_at">
): Promise<string> => {
  return await insert<User>(TABLE_NAME, userData);
};

export const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<void> => {
  await update<User>(TABLE_NAME, id, userData);
};

export const deleteUser = async (id: string): Promise<void> => {
  await deleteRecord(TABLE_NAME, id);
};

export const getUserById = async (id: string): Promise<User | null> => {
  return await findById<User>(TABLE_NAME, id);
};

export const getAllUsers = async (): Promise<User[]> => {
  return await findAll<User>(TABLE_NAME);
};

export const getCurrentUser = async (): Promise<User | null> => {
  // For single-user app, get the first user or create one if none exists
  const users = await findAll<User>(
    TABLE_NAME,
    undefined,
    undefined,
    "created_at ASC"
  );
  return users.length > 0 ? users[0] : null;
};

export const ensureUserExists = async (): Promise<User> => {
  let user = await getCurrentUser();

  if (!user) {
    // Create default user
    const userId = await createUser({
      name: "User",
      email: undefined,
      phone: undefined,
      profile_image: undefined,
    });

    user = await getUserById(userId);
    if (!user) {
      throw new Error("Failed to create user");
    }
  }

  return user;
};
