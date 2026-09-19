import { pgTable, uniqueIndex, pgEnum, serial, varchar, timestamp, integer, boolean, unique, check, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { warehouses } from "@/modules/warehouse/entities/warehouses.schema";
import { products } from "@/modules/product/entities/products.schema";

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
