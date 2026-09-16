import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";

// 1. Drizzle Database Schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Auto-Generate Base Elysia Schemas
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

// 3. Compose Specific API Validation Models
export const ProductModel = {
  create: t.Omit(insertProductSchema, ["id", "createdAt", "updatedAt"]),
  update: t.Partial(
    t.Omit(insertProductSchema, ["id", "sku", "createdAt", "updatedAt"]),
  ),
  response: selectProductSchema,
  listResponse: t.Array(selectProductSchema),
} as const;

export type ProductModelTypes = {
  create: Static<typeof ProductModel.create>;
  update: Static<typeof ProductModel.update>;
};
