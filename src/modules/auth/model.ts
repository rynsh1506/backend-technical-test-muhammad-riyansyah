import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
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
export const roleEnum = pgEnum("role", ["USER", "APPROVER"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * ==========================================
 * 2. BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

const userInsert = spread(users, "insert");
const userSelect = spread(users, "select");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const loginBodyDto = t.Object({
  username: userInsert.username,
  password: userInsert.password,
});

export const loginResponseDto = t.Object({
  message: t.String(),
  user: t.Object({
    id: userSelect.id,
    username: userSelect.username,
    role: userSelect.role,
  }),
});

export const loginInvalidDto = t.Object({
  error: t.Object({ code: t.String(), message: t.String() }),
});
