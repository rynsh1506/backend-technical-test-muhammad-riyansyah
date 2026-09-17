import { eq } from "drizzle-orm";
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
   */
  static async create(data: WarehouseModelTypes["create"]) {
    const result = await db.insert(warehouses).values(data).returning();
    return result[0];
  }

  /**
   * Retrieves all warehouses ordered by ID (ascending).
   *
   * @returns An array of all warehouse records.
   */
  static async list() {
    return await db.select().from(warehouses).orderBy(warehouses.id);
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
   */
  static async update(id: number, data: WarehouseModelTypes["update"]) {
    await this.getById(id);
    const result = await db
      .update(warehouses)
      .set(data)
      .where(eq(warehouses.id, id))
      .returning();
    return result[0];
  }
}
