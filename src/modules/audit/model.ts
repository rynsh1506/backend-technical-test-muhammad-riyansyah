import { t } from "elysia";
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/model";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

/**
 * ==========================================
 * 1. DATABASE SCHEMA (Drizzle ORM)
 * ==========================================
 * Defines the PostgreSQL tables, columns, and relations.
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  entityName: varchar("entity_name", { length: 50 }).notNull(),
  entityId: integer("entity_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  performedBy: integer("performed_by")
    .references(() => users.id)
    .notNull(),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const idempotencyKeys = pgTable("idempotency_keys", {
  key: varchar("key", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  response: jsonb("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * ==========================================
 * 2. BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const selectAuditLogSchema = createSelectSchema(auditLogs);
export const insertIdempotencyKeySchema = createInsertSchema(idempotencyKeys);
export const selectIdempotencyKeySchema = createSelectSchema(idempotencyKeys);

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const auditLogResponseDto = t.Object({
  id: t.Number(),
  entityName: t.String(),
  entityId: t.Number(),
  action: t.String(),
  changes: t.Unknown(),
  createdAt: t.Date(),
  performedBy: t.Object({
    id: t.Number(),
    username: t.String(),
    role: t.String(),
  }),
});
export const auditLogListResponseDto = t.Array(auditLogResponseDto);
