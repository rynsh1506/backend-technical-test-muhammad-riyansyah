import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { suppliers } from "@/modules/supplier/model";
import type { SupplierModelTypes } from "@/modules/supplier/model";

export abstract class SupplierService {
  /**
   * Creates a new supplier record.
   *
   * @param data - The supplier creation payload.
   * @returns The newly created supplier.
   * @throws {500} If the database insert unexpectedly returns no data.
   */
  static async create(data: SupplierModelTypes["create"]) {
    const result = await db.insert(suppliers).values(data).returning();
    if (!result[0]) {
      throw status(500, {
        error: { code: "INTERNAL_ERROR", message: "Failed to create Supplier" },
      });
    }
    return result[0];
  }

  /**
   * Retrieves all suppliers ordered by ID (ascending).
   *
   * @returns An array of all supplier records.
   */
  static async list() {
    return await db.select().from(suppliers).orderBy(suppliers.id);
  }

  /**
   * Retrieves a single supplier by its primary key.
   *
   * @param id - The numeric ID of the supplier.
   * @returns The matching supplier record.
   * @throws {404} If no supplier with the given ID exists.
   */
  static async getById(id: number) {
    const result = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);
    if (!result[0]) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "Supplier not found" },
      });
    }
    return result[0];
  }

  /**
   * Updates an existing supplier by its primary key.
   *
   * @param id - The numeric ID of the supplier to update.
   * @param data - The partial update payload.
   * @returns The updated supplier record.
   * @throws {404} If no supplier with the given ID exists.
   * @throws {500} If the database update unexpectedly returns no data.
   */
  static async update(id: number, data: SupplierModelTypes["update"]) {
    await this.getById(id);
    const result = await db
      .update(suppliers)
      .set(data)
      .where(eq(suppliers.id, id))
      .returning();
    if (!result[0]) {
      throw status(500, {
        error: { code: "INTERNAL_ERROR", message: "Failed to update Supplier" },
      });
    }
    return result[0];
  }
}
