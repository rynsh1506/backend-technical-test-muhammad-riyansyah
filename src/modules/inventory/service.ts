import { db } from "@/utils/db";
import {
  inventoryBalances,
  inventoryMovements,
} from "@/modules/inventory/model";
import { eq, and, desc } from "drizzle-orm";

export abstract class InventoryService {
  static async getLevel(warehouseId: number, productId: number) {
    const level = await db
      .select()
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.warehouseId, warehouseId),
          eq(inventoryBalances.productId, productId),
        ),
      );
    if (level.length === 0) {
      return { warehouseId, productId, stock: 0 };
    }
    return level[0];
  }

  static async getMovements(warehouseId: number, productId: number) {
    return await db
      .select()
      .from(inventoryMovements)
      .where(
        and(
          eq(inventoryMovements.warehouseId, warehouseId),
          eq(inventoryMovements.productId, productId),
        ),
      )
      .orderBy(desc(inventoryMovements.createdAt));
  }
}
