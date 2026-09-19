import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { purchaseOrders } from "@/modules/purchase-order/model";
import { products } from "@/modules/product/model";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

/**
 * ==========================================
 * 1. DATABASE SCHEMA (Drizzle ORM)
 * ==========================================
 * Defines the PostgreSQL tables, columns, and relations.
 */
export const goodsReceipts = pgTable("goods_receipts", {
  id: serial("id").primaryKey(),
  grNumber: varchar("gr_number", { length: 50 }).notNull().unique(),
  purchaseOrderId: integer("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "restrict" }),
  receivedBy: integer("received_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goodsReceiptItems = pgTable(
  "goods_receipt_items",
  {
    id: serial("id").primaryKey(),
    goodsReceiptId: integer("goods_receipt_id")
      .notNull()
      .references(() => goodsReceipts.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [check("gr_item_quantity_check", sql`${table.quantity} > 0`)],
);

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
  {
    quantity: t.Number({ minimum: 1 }),
  },
);
export const selectGoodsReceiptItemSchema =
  createSelectSchema(goodsReceiptItems);

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const goodsReceiptItemDto = t.Pick(insertGoodsReceiptItemSchema, [
  "productId",
  "quantity",
]);

export const goodsReceiptCreateDto = t.Intersect([
  t.Pick(insertGoodsReceiptSchema, ["purchaseOrderId"]),
  t.Object({
    items: t.Array(goodsReceiptItemDto, { minItems: 1 }),
  }),
]);
