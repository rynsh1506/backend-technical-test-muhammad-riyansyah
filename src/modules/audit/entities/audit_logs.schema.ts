import { pgTable, pgEnum, serial, varchar, timestamp, integer, boolean, unique, check, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "@/modules/auth/entities/users.schema";

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
