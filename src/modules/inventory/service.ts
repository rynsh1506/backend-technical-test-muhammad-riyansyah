import { db } from "@/utils/db";
import {
  inventoryBalances,
  inventoryMovements,
} from "@/modules/inventory/model";
import { eq, and, desc } from "drizzle-orm";

export abstract class InventoryService {
  /**
   * Retrieves the current stock level for a specific product in a specific warehouse.
   *
   * @param warehouseId - The ID of the warehouse.
   * @param productId - The ID of the product.
   * @returns The current inventory balance record or a default zero-stock record if none exists.
   */
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
    return level[0]!;
  }

  /**
   * Retrieves the historical inventory movements for a specific product in a specific warehouse.
   *
   * @param warehouseId - The ID of the warehouse.
   * @param productId - The ID of the product.
   * @returns An array of inventory movement records ordered by descending creation time.
   */
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
