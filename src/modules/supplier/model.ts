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
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Auto-Generate Base Elysia Schemas
export const insertSupplierSchema = createInsertSchema(suppliers);
export const selectSupplierSchema = createSelectSchema(suppliers);

// 3. Compose Specific API Validation Models
export const SupplierModel = {
  create: t.Omit(insertSupplierSchema, ["id", "createdAt", "updatedAt"]),
  update: t.Partial(
    t.Omit(insertSupplierSchema, ["id", "createdAt", "updatedAt"]),
  ),
  response: selectSupplierSchema,
  listResponse: t.Array(selectSupplierSchema),
} as const;

export type SupplierModelTypes = {
  create: Static<typeof SupplierModel.create>;
  update: Static<typeof SupplierModel.update>;
};
