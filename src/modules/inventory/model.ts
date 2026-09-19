import { t } from "elysia";
import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { warehouses } from "@/modules/warehouse/model";
import { products } from "@/modules/product/model";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

/**
 * ==========================================
 * 1. DATABASE SCHEMA (Drizzle ORM)
 * ==========================================
 * Defines the PostgreSQL tables, columns, and relations.
 */
export const inventoryBalances = pgTable(
  "inventory_balances",
  {
    id: serial("id").primaryKey(),
    warehouseId: integer("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    stock: integer("stock").notNull().default(0),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("warehouse_product_idx").on(table.warehouseId, table.productId),
  ],
);

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id")
    .notNull()
    .references(() => warehouses.id, { onDelete: "restrict" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  referenceType: varchar("reference_type", { length: 50 }).notNull(),
  referenceId: varchar("reference_id", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * ==========================================
 * 2. BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertInventoryBalanceSchema =
  createInsertSchema(inventoryBalances);
export const selectInventoryBalanceSchema =
  createSelectSchema(inventoryBalances);
export const insertInventoryMovementSchema =
  createInsertSchema(inventoryMovements);
export const selectInventoryMovementSchema =
  createSelectSchema(inventoryMovements);

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const inventoryBalanceResponseDto = t.Intersect([
  t.Pick(selectInventoryBalanceSchema, ["warehouseId", "productId", "stock"]),
  t.Partial(t.Pick(selectInventoryBalanceSchema, ["id", "updatedAt"])),
]);
export const inventoryMovementResponseDto = selectInventoryMovementSchema;
export const inventoryMovementListResponseDto = t.Array(
  selectInventoryMovementSchema,
);
