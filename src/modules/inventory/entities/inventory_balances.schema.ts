import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  uniqueIndex,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { warehouses } from "@/modules/warehouse/entities/warehouses.schema";
import { products } from "@/modules/product/entities/products.schema";

export const inventoryBalances = pgTable(
  "inventory_balances",
  {
    id: varchar("id", { length: 24 })
      .$defaultFn(() => createId())
      .primaryKey(),
    warehouseId: varchar("warehouse_id", { length: 24 })
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    productId: varchar("product_id", { length: 24 })
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
