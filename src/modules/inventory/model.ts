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
  (table) => ({
    warehouseProductIdx: uniqueIndex("warehouse_product_idx").on(
      table.warehouseId,
      table.productId,
    ),
  }),
);

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id")
    .notNull()
    .references(() => warehouses.id, { onDelete: "restrict" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(), // positive for IN, negative for OUT
  referenceType: varchar("reference_type", { length: 50 }).notNull(), // e.g., 'GOODS_RECEIPT'
  referenceId: varchar("reference_id", { length: 100 }).notNull(), // e.g., GR number
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
