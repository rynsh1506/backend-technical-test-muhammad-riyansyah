import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { warehouses } from "@/modules/warehouse/entities/warehouses.schema";
import { products } from "@/modules/product/entities/products.schema";

export const inventoryMovements = pgTable("inventory_movements", {
  id: varchar("id", { length: 24 }).$defaultFn(() => createId()).primaryKey(),
  warehouseId: varchar("warehouse_id", { length: 24 })
    .notNull()
    .references(() => warehouses.id, { onDelete: "restrict" }),
  productId: varchar("product_id", { length: 24 })
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  referenceType: varchar("reference_type", { length: 50 }).notNull(),
  referenceId: varchar("reference_id", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
