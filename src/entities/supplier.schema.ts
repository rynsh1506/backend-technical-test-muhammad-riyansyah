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
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
