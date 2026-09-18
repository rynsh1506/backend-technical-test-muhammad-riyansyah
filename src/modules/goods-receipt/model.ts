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
import { t } from "elysia";

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
  (table) => ({
    quantityCheck: check("gr_item_quantity_check", sql`${table.quantity} > 0`),
  }),
);

export const grItemDto = t.Object({
  productId: t.Number(),
  quantity: t.Number({ minimum: 1 }),
});

export const grCreateDto = t.Object({
  purchaseOrderId: t.Number(),
  items: t.Array(grItemDto, { minItems: 1 }),
});
