import { eq, desc, ilike, or } from "drizzle-orm";
import { db } from "@/utils/db";
import { users } from "@/modules/auth/entities/users.schema";
import { status } from "@/utils/http";

export class UserService {
  /**
   * Fetch a single user by their CUID2 ID.
   */
  static async getById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id));

    if (!result[0]) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "User not found" },
      });
    }

    const { passwordHash, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
  }

  /**
   * Fetch a paginated list of users with optional search.
   */
  static async list(search?: string, limit: number = 10, offset: number = 0) {
    let query = db.select().from(users).$dynamic();

    if (search) {
      query = query.where(
        or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)),
      );
    }

    query = query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);

    const results = await query;
    const countResult = await db.select({ count: users.id }).from(users);
    const total = countResult.length;

    return {
      data: results.map(({ passwordHash, ...u }) => u),
      meta: { limit, offset, total },
    };
  }
}
