import { goodsReceipts } from "./goods_receipts.schema";
import { pgTable, pgEnum, serial, varchar, timestamp, integer, boolean, unique, check, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "@/modules/product/entities/products.schema";

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
