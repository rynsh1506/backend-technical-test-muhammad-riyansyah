import { eq, ilike, or, sql, desc } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { warehouses } from "@/modules/warehouse/model";
import type { WarehouseModelTypes } from "@/modules/warehouse/model";

export abstract class WarehouseService {
  /**
   * Creates a new warehouse record.
   *
   * @param data - The warehouse creation payload.
   * @returns The newly created warehouse.
   * @throws {500} If the database insert unexpectedly returns no data.
   */
  static async create(data: WarehouseModelTypes["create"]) {
    const result = await db.insert(warehouses).values(data).returning();
    if (!result[0]) {
      throw status(500, {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create Warehouse",
        },
      });
    }
    return result[0];
  }

  /**
   * Retrieves a paginated list of warehouses.
   *
   * @param page - The page number to retrieve.
   * @param limit - The maximum number of records per page.
   * @param search - Optional search string for name or code.
   * @returns Paginated warehouse records.
   */
  static async list(page = 1, limit = 10, search?: string) {
    const offset = (page - 1) * limit;

    let whereCondition = undefined;
    if (search) {
      whereCondition = or(
        ilike(warehouses.name, `%${search}%`),
        ilike(warehouses.code, `%${search}%`),
      );
    }

    const data = await db
      .select()
      .from(warehouses)
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(warehouses.id));

    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(warehouses)
      .where(whereCondition);

    const total = Number(totalRes[0]!.count);

    return {
      data,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    };
  }

  /**
   * Retrieves a single warehouse by its primary key.
   *
   * @param id - The numeric ID of the warehouse.
   * @returns The matching warehouse record.
   * @throws {404} If no warehouse with the given ID exists.
   */
  static async getById(id: number) {
    const result = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, id))
      .limit(1);
    if (!result[0]) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "Warehouse not found" },
      });
    }
    return result[0];
  }

  /**
   * Updates an existing warehouse by its primary key.
   *
   * @param id - The numeric ID of the warehouse to update.
   * @param data - The partial update payload.
   * @returns The updated warehouse record.
   * @throws {404} If no warehouse with the given ID exists.
   * @throws {500} If the database update unexpectedly returns no data.
   */
  static async update(id: number, data: WarehouseModelTypes["update"]) {
    await this.getById(id);
    const result = await db
      .update(warehouses)
      .set(data)
      .where(eq(warehouses.id, id))
      .returning();
    if (!result[0]) {
      throw status(500, {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update Warehouse",
        },
      });
    }
    return result[0];
  }
}
