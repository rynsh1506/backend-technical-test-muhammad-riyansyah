import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const productCreateDto = t.Omit(insertProductSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);
export const productUpdateDto = t.Partial(
  t.Omit(insertProductSchema, ["id", "sku", "createdAt", "updatedAt"]),
);
export const productResponseDto = selectProductSchema;
export const productListResponseDto = t.Object({
  data: t.Array(selectProductSchema),
  meta: t.Object({
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
    totalRecords: t.Number(),
  }),
});
