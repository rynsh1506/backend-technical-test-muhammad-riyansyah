import { createPaginatedDto } from "@/utils/dto";
import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { spread } from "@/utils/drizzle";

/**
 * ==========================================
 * 1. DATABASE SCHEMA (Drizzle ORM)
 * ==========================================
 * Defines the PostgreSQL tables, columns, and relations.
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * ==========================================
 * 2. BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

const productInsert = spread(products, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const productCreateDto = t.Object({
  sku: productInsert.sku,
  name: productInsert.name,
  unit: productInsert.unit,
  isActive: productInsert.isActive,
});

export const productUpdateDto = t.Partial(
  t.Object({
    name: productInsert.name,
    unit: productInsert.unit,
    isActive: productInsert.isActive,
  }),
);

export const productResponseDto = selectProductSchema;
export const productListResponseDto = createPaginatedDto(selectProductSchema);
