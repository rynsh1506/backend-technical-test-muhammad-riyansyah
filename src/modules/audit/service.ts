import { desc, eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { auditLogs } from "@/entities/audit.schema";
import { users } from "@/entities/auth.schema";

export abstract class AuditService {
  /**
   * Retrieves all audit logs, joined with user information.
   *
   * @returns An array of audit logs ordered by creation date descending.
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
