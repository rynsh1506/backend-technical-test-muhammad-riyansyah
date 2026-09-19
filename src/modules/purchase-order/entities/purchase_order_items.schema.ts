import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  timestamp,
  varchar, integer,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "@/modules/product/entities/products.schema";
import { purchaseOrders } from "@/modules/purchase-order/entities/purchase_orders.schema";

export const purchaseOrderItems = pgTable(
  "purchase_order_items",
  {
    id: varchar("id", { length: 24 }).$defaultFn(() => createId()).primaryKey(),
    purchaseOrderId: varchar("purchase_order_id", { length: 24 })
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [check("po_item_quantity_check", sql`${table.quantity} > 0`)],
);
