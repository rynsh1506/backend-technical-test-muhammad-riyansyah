import { db } from "@/utils/db";
import { auditLogs } from "@/modules/audit/model";
import { users } from "@/modules/auth/model";
import { desc, eq } from "drizzle-orm";

/**
 * Audit Trail Service
 */
export class AuditService {
  /**
   * Retrieves all audit logs, joined with user information.
   */
  static async getLogs() {
    const logs = await db
      .select({
        id: auditLogs.id,
        entityName: auditLogs.entityName,
        entityId: auditLogs.entityId,
        action: auditLogs.action,
        changes: auditLogs.changes,
        createdAt: auditLogs.createdAt,
        performedBy: {
          id: users.id,
          username: users.username,
          role: users.role,
        },
      })
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.performedBy, users.id))
      .orderBy(desc(auditLogs.createdAt));

    return logs;
  }
}
