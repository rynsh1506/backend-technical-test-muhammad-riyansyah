import { pgTable, pgEnum, serial, varchar, timestamp, integer, boolean, unique, check, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { purchaseOrders } from "@/modules/purchase-order/entities/purchase_orders.schema";

export const goodsReceipts = pgTable("goods_receipts", {
  id: serial("id").primaryKey(),
  grNumber: varchar("gr_number", { length: 50 }).notNull().unique(),
  purchaseOrderId: integer("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "restrict" }),
  receivedBy: integer("received_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
