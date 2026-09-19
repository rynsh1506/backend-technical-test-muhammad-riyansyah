import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

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
