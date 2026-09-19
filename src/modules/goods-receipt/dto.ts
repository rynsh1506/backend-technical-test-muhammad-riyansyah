import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { goodsReceipts } from "@/modules/goods-receipt/entities/goods_receipts.schema";
import { goodsReceiptItems } from "@/modules/goods-receipt/entities/goods_receipt_items.schema";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
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
 * API DTOs (Elysia TypeBox)
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
