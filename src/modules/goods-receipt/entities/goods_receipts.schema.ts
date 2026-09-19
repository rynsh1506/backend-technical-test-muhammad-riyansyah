import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  varchar,
  timestamp,
  } from "drizzle-orm/pg-core";
import { purchaseOrders } from "@/modules/purchase-order/entities/purchase_orders.schema";

export const goodsReceipts = pgTable("goods_receipts", {
  id: varchar("id", { length: 24 }).$defaultFn(() => createId()).primaryKey(),
  grNumber: varchar("gr_number", { length: 50 }).notNull().unique(),
  purchaseOrderId: varchar("purchase_order_id", { length: 24 })
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "restrict" }),
  receivedBy: varchar("received_by", { length: 24 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
