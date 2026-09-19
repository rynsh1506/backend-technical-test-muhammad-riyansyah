import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  varchar,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/entities/users.schema";

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 24 }).$defaultFn(() => createId()).primaryKey(),
  entityName: varchar("entity_name", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 24 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  performedBy: varchar("performed_by", { length: 24 })
    .references(() => users.id)
    .notNull(),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
