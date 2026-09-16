import { eq } from "drizzle-orm";
import { error } from "elysia";
import { db } from "../../utils/db";
import { users } from "./model";
import type { AuthModelTypes } from "./model";

// If a class doesn't need to store a property,
// you can use an `abstract class` to avoid class allocation
export abstract class AuthService {
  static async login({ username, password }: AuthModelTypes["loginBody"]) {
    const userList = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = userList[0];

    if (!user) {
      // You can throw an HTTP error directly
      throw error(401, { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } });
    }

    const isMatch = await Bun.password.verify(password, user.password);
    if (!isMatch) {
      // You can throw an HTTP error directly
      throw error(401, { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } });
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  static async getMe(user: { id: number; role: string; username: string } | null) {
    if (!user) {
      throw error(401, { error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }
    return { user };
  }
}
