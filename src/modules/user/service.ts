import { eq, desc, ilike, sql } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { users } from "@/modules/user/entities/users.schema";

export class UserService {
  /**
   * Fetch a single user by their CUID2 ID.
   *
   * @param id - The CUID2 ID of the user.
   * @returns The matching user record, excluding the password hash.
   * @throws {404} If no user with the given ID exists.
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
   * Retrieves a paginated list of users.
   *
   * @param search - Optional search string for username.
   * @param limit - The maximum number of records per page.
   * @param offset - The offset for pagination.
   * @returns Paginated user records, excluding password hashes.
   */
  static async list(search?: string, limit: number = 10, offset: number = 0) {
    let query = db.select().from(users).$dynamic();

    if (search) {
      query = query.where(ilike(users.username, `%${search}%`));
    }

    query = query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);

    const results = await query;
    const countResult = await db.select({ count: sql`count(*)` }).from(users);
    const total = Number(countResult[0]?.count || 0);
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
