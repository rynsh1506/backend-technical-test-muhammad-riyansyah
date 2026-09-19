import { eq, desc, ilike, sql } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { users } from "@/modules/user/entities/users.schema";

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

    const { password, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
  }

  /**
   * Fetch a paginated list of users with optional search.
   */
  static async list(search?: string, limit: number = 10, offset: number = 0) {
    let query = db.select().from(users).$dynamic();

    if (search) {
      query = query.where(ilike(users.username, `%${search}%`));
    }

    query = query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);

    const results = await query;
    const countResult = await db.select({ count: sql`count(*)` }).from(users);
    const total = Number(countResult[0].count);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: results.map(({ password, ...u }) => u),
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    };
  }
}
