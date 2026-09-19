import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { goodsReceipts } from "./entities/goods_receipts.schema";
import { goodsReceiptItems } from "./entities/goods_receipt_items.schema";

/**
 * ==========================================
 * 2. BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertGoodsReceiptSchema = createInsertSchema(goodsReceipts);
export const selectGoodsReceiptSchema = createSelectSchema(goodsReceipts);

export const insertGoodsReceiptItemSchema = createInsertSchema(
  goodsReceiptItems,
  { quantity: t.Number({ minimum: 1 }) },
);
export const selectGoodsReceiptItemSchema =
  createSelectSchema(goodsReceiptItems);

const grInsert = spread(goodsReceipts, "insert");
const grItemInsert = spread(insertGoodsReceiptItemSchema, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const goodsReceiptItemDto = t.Object({
  productId: grItemInsert.productId,
  quantity: grItemInsert.quantity,
});

export const goodsReceiptCreateDto = t.Object({
  purchaseOrderId: grInsert.purchaseOrderId,
  items: t.Array(goodsReceiptItemDto, { minItems: 1 }),
});
