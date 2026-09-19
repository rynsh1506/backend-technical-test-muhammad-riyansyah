import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { warehouses } from "@/entities/warehouse.schema";
import { products } from "@/entities/product.schema";

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
