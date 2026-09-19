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
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
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
export const insertSupplierSchema = createInsertSchema(suppliers);
export const selectSupplierSchema = createSelectSchema(suppliers);

const supplierInsert = spread(suppliers, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const supplierCreateDto = t.Object({
  name: supplierInsert.name,
  email: supplierInsert.email,
  phone: supplierInsert.phone,
  isActive: supplierInsert.isActive,
});

export const supplierUpdateDto = t.Partial(
  t.Object({
    name: supplierInsert.name,
    email: supplierInsert.email,
    phone: supplierInsert.phone,
    isActive: supplierInsert.isActive,
  }),
);

export const supplierResponseDto = selectSupplierSchema;
export const supplierListResponseDto = createPaginatedDto(selectSupplierSchema);
