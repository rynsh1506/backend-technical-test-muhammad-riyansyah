import { eq } from "drizzle-orm";
import { db } from "../../utils/db";
import { users } from "./model";

/**
 * Validates user credentials against the database.
 * @param username The user's username
 * @param password The user's plain-text password
 * @returns The user object if valid, otherwise null
 */
export async function validateUserCredentials(username: string, password: string) {
  // 1. Find user by username
  const userList = await db.select().from(users).where(eq(users.username, username)).limit(1);
  const user = userList[0];

  if (!user) {
    return null;
  }

  // 2. Verify password
  const isMatch = await Bun.password.verify(password, user.password);
  if (!isMatch) {
    return null;
  }

  // 3. Return safe user data
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}
