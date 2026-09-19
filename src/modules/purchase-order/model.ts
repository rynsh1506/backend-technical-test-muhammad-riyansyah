import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { purchaseRequests } from "@/modules/purchase-request/model";
import { suppliers } from "@/modules/supplier/model";
import { products } from "@/modules/product/model";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "DRAFT",
  "ORDERED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
]);

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: varchar("po_number", { length: 50 }).notNull().unique(),
  purchaseRequestId: integer("purchase_request_id")
    .notNull()
    .references(() => purchaseRequests.id, { onDelete: "restrict" })
    .unique(),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "restrict" }),
  status: purchaseOrderStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

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
  (table) => ({
    quantityCheck: check("po_item_quantity_check", sql`${table.quantity} > 0`),
  }),
);

/** TypeBox Schemas */
export const purchaseOrderSelectSchema = createSelectSchema(purchaseOrders);
export const purchaseOrderInsertSchema = createInsertSchema(purchaseOrders);

export const poCreateDto = t.Object({
  purchaseRequestId: t.Number(),
  supplierId: t.Number(),
});
