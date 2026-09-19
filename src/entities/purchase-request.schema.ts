import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  pgEnum,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "@/entities/auth.schema";
import { warehouses } from "@/entities/warehouse.schema";
import { products } from "@/entities/product.schema";

/**
 * ==========================================
 * 1. DATABASE SCHEMA (Drizzle ORM)
 * ==========================================
 * Defines the PostgreSQL tables, columns, and relations.
 */
export const purchaseRequestStatusEnum = pgEnum("purchase_request_status", [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
]);

export const purchaseRequests = pgTable("purchase_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),
  warehouseId: integer("warehouse_id")
    .references(() => warehouses.id)
    .notNull(),
  requestedBy: integer("requested_by")
    .references(() => users.id)
    .notNull(),
  status: purchaseRequestStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const purchaseRequestItems = pgTable(
  "purchase_request_items",
  {
    id: serial("id").primaryKey(),
    purchaseRequestId: integer("purchase_request_id")
      .references(() => purchaseRequests.id, { onDelete: "cascade" })
      .notNull(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    unique("unq_pr_product").on(table.purchaseRequestId, table.productId),
    check("chk_quantity_gt_zero", sql`${table.quantity} > 0`),
  ],
);
