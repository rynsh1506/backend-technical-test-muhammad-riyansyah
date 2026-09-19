import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { purchaseOrders } from "./entities/purchase_orders.schema";
import { purchaseOrderItems } from "./entities/purchase_order_items.schema";

/**
 * ==========================================
 * 2. BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders);
export const selectPurchaseOrderSchema = createSelectSchema(purchaseOrders);
export const insertPurchaseOrderItemSchema =
  createInsertSchema(purchaseOrderItems);
export const selectPurchaseOrderItemSchema =
  createSelectSchema(purchaseOrderItems);

const poInsert = spread(purchaseOrders, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const purchaseOrderCreateDto = t.Object({
  purchaseRequestId: poInsert.purchaseRequestId,
  supplierId: poInsert.supplierId,
});
