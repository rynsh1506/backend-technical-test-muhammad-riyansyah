import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { inventoryBalances } from "./entities/inventory_balances.schema";
import { inventoryMovements } from "./entities/inventory_movements.schema";

/**
 * ==========================================
 * 2. BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertInventoryBalanceSchema =
  createInsertSchema(inventoryBalances);
export const selectInventoryBalanceSchema =
  createSelectSchema(inventoryBalances);
export const insertInventoryMovementSchema =
  createInsertSchema(inventoryMovements);
export const selectInventoryMovementSchema =
  createSelectSchema(inventoryMovements);

const balanceSelect = spread(inventoryBalances, "select");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const inventoryBalanceResponseDto = t.Object({
  id: t.Optional(balanceSelect.id),
  warehouseId: balanceSelect.warehouseId,
  productId: balanceSelect.productId,
  stock: balanceSelect.stock,
  updatedAt: t.Optional(balanceSelect.updatedAt),
});

export const inventoryMovementResponseDto = selectInventoryMovementSchema;
export const inventoryMovementListResponseDto = t.Array(
  selectInventoryMovementSchema,
);
