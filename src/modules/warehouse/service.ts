import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { warehouses } from "./model";
import type { WarehouseModelTypes } from "./model";

export abstract class WarehouseService {
  static async create(data: WarehouseModelTypes["create"]) {
    const result = await db.insert(warehouses).values(data).returning();
    return result[0];
  }

  static async list() {
    return await db.select().from(warehouses).orderBy(warehouses.id);
  }

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

  static async update(id: number, data: WarehouseModelTypes["update"]) {
    const existing = await this.getById(id);
    const result = await db
      .update(warehouses)
      .set(data)
      .where(eq(warehouses.id, id))
      .returning();
    return result[0];
  }
}
