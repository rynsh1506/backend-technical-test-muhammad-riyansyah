import { createId } from "@paralleldrive/cuid2";
import { goodsReceipts } from "@/modules/goods-receipt/entities/goods_receipts.schema";
import {
  pgTable,
  timestamp,
  varchar, integer,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "@/modules/product/entities/products.schema";

export const goodsReceiptItems = pgTable(
  "goods_receipt_items",
  {
    id: varchar("id", { length: 24 }).$defaultFn(() => createId()).primaryKey(),
    goodsReceiptId: varchar("goods_receipt_id", { length: 24 })
      .notNull()
      .references(() => goodsReceipts.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [check("gr_item_quantity_check", sql`${table.quantity} > 0`)],
);
