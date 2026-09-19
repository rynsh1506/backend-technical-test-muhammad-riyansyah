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
import { users } from "@/modules/auth/model";
import { warehouses } from "@/modules/warehouse/model";
import { products } from "@/modules/product/model";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { spread } from "@/utils/drizzle";

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

/**
 * ==========================================
 * 2. BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertPurchaseRequestSchema = createInsertSchema(purchaseRequests);
export const selectPurchaseRequestSchema = createSelectSchema(purchaseRequests);

export const insertPurchaseRequestItemSchema = createInsertSchema(
  purchaseRequestItems,
  { quantity: t.Number({ minimum: 1 }) },
);
export const selectPurchaseRequestItemSchema =
  createSelectSchema(purchaseRequestItems);

const prInsert = spread(insertPurchaseRequestSchema, "insert");
const prItemInsert = spread(insertPurchaseRequestItemSchema, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const purchaseRequestCreateDto = t.Object({
  warehouseId: prInsert.warehouseId,
});

export const purchaseRequestUpdateDraftDto = t.Partial(
  t.Object({
    warehouseId: prInsert.warehouseId,
  }),
);

export const purchaseRequestItemAddDto = t.Object({
  productId: prItemInsert.productId,
  quantity: prItemInsert.quantity,
});

export const purchaseRequestItemUpdateDto = t.Object({
  quantity: prItemInsert.quantity,
});
