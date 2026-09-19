import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  timestamp,
  integer,
  boolean,
  unique,
  check,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "@/modules/product/entities/products.schema";
import { purchaseOrders } from "@/modules/purchase-order/entities/purchase_orders.schema";

export const purchaseOrderItems = pgTable(
  "purchase_order_items",
  {
    id: serial("id").primaryKey(),
    purchaseOrderId: integer("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [check("po_item_quantity_check", sql`${table.quantity} > 0`)],
);
