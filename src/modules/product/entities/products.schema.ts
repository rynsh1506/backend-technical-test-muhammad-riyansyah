import { createId } from "@paralleldrive/cuid2";
import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: varchar("id", { length: 24 })
    .$defaultFn(() => createId())
    .primaryKey(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
