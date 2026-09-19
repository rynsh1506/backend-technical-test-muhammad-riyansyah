import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { auditLogs } from "./entities/audit_logs.schema";
import { idempotencyKeys } from "./entities/idempotency_keys.schema";
import { selectUserSchema } from "@/modules/auth/dto";

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

const auditSelect = spread(auditLogs, "select");
const userSelect = spread(users, "select");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const auditLogResponseDto = t.Object({
  id: auditSelect.id,
  entityName: auditSelect.entityName,
  entityId: auditSelect.entityId,
  action: auditSelect.action,
  changes: t.Unknown(),
  createdAt: auditSelect.createdAt,
  performedBy: t.Object({
    id: userSelect.id,
    username: userSelect.username,
    role: t.String(),
  }),
});
export const auditLogListResponseDto = t.Array(auditLogResponseDto);
import { users } from "@/modules/auth/entities/users.schema";
