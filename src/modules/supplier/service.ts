import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { suppliers } from "./model";
import type { SupplierModelTypes } from "./model";

export abstract class SupplierService {
  static async create(data: SupplierModelTypes["create"]) {
    const result = await db.insert(suppliers).values(data).returning();
    return result[0];
  }

  static async list() {
    return await db.select().from(suppliers).orderBy(suppliers.id);
  }

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

  static async update(id: number, data: SupplierModelTypes["update"]) {
    const existing = await this.getById(id);
    const result = await db
      .update(suppliers)
      .set(data)
      .where(eq(suppliers.id, id))
      .returning();
    return result[0];
  }
}
