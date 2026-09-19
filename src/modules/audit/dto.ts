import { users } from "@/modules/user/entities/users.schema";
import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { auditLogs } from "@/modules/audit/entities/audit_logs.schema";
import { idempotencyKeys } from "@/modules/audit/entities/idempotency_keys.schema";
import { createPaginatedDto } from "@/utils/dto";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
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
 * API DTOs (Elysia TypeBox)
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
export const auditLogListResponseDto = createPaginatedDto(auditLogResponseDto);
