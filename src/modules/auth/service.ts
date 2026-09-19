import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { users } from "@/modules/auth/model";
import { loginBodyDto } from "@/modules/auth/model";
import type { Static } from "elysia";

export abstract class AuthService {
  /**
   * Validates user credentials against the database.
   *
   * @param credentials - The login payload containing username and password.
   * @returns A safe user object (id, username, role) on successful authentication.
   * @throws {401} If the username does not exist or the password is incorrect.
   */
  static async login({ username, password }: Static<typeof loginBodyDto>) {
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
