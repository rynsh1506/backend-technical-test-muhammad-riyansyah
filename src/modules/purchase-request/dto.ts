import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { purchaseRequests } from "./entities/purchase_requests.schema";
import { purchaseRequestItems } from "./entities/purchase_request_items.schema";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertPurchaseRequestSchema = createInsertSchema(purchaseRequests);
export const selectPurchaseRequestSchema = createSelectSchema(purchaseRequests);

export const insertPurchaseRequestItemSchema = createInsertSchema(
  purchaseRequestItems,
  { quantity: t.Number({ minimum: 1 }) },
);
export const selectPurchaseRequestItemSchema =
  createSelectSchema(purchaseRequestItems);

const prInsert = spread(insertPurchaseRequestSchema, "insert");
const prItemInsert = spread(insertPurchaseRequestItemSchema, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const purchaseRequestCreateDto = t.Object({
  warehouseId: prInsert.warehouseId,
});

export const purchaseRequestUpdateDraftDto = t.Partial(
  t.Object({
    warehouseId: prInsert.warehouseId,
  }),
);

export const purchaseRequestItemAddDto = t.Object({
  productId: prItemInsert.productId,
  quantity: prItemInsert.quantity,
});

export const purchaseRequestItemUpdateDto = t.Object({
  quantity: prItemInsert.quantity,
});
