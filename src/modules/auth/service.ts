import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { users } from "@/modules/auth/model";
import type { AuthModelTypes } from "@/modules/auth/model";

export abstract class AuthService {
  static async login({ username, password }: AuthModelTypes["loginBody"]) {
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    const user = userList[0];

    if (!user) {
      throw status(401, {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        },
      });
    }

    const isMatch = await Bun.password.verify(password, user.password);
    if (!isMatch) {
      throw status(401, {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        },
      });
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }
}
