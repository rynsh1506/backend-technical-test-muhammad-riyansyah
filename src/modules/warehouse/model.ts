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
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
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
export const insertWarehouseSchema = createInsertSchema(warehouses);
export const selectWarehouseSchema = createSelectSchema(warehouses);

const warehouseInsert = spread(warehouses, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const warehouseCreateDto = t.Object({
  code: warehouseInsert.code,
  name: warehouseInsert.name,
  location: warehouseInsert.location,
  isActive: warehouseInsert.isActive,
});

export const warehouseUpdateDto = t.Partial(
  t.Object({
    name: warehouseInsert.name,
    location: warehouseInsert.location,
    isActive: warehouseInsert.isActive,
  }),
);

export const warehouseResponseDto = selectWarehouseSchema;
export const warehouseListResponseDto = createPaginatedDto(
  selectWarehouseSchema,
);
