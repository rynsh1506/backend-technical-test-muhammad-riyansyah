import { desc, eq, and, ilike, sql } from "drizzle-orm";
import { db } from "@/utils/db";
import { auditLogs } from "@/modules/audit/entities/audit_logs.schema";
import { users } from "@/modules/user/entities/users.schema";
import type { SQL } from "drizzle-orm";

export abstract class AuditService {
  /**
   * Retrieves a paginated and filterable list of audit logs, joined with user information.
   *
   * @param limit - The maximum number of records per page.
   * @param offset - The number of records to skip.
   * @param entityName - Optional filter by the entity type (e.g., "purchase_requests").
   * @param action - Optional filter by the action type (e.g., "APPROVE", "SUBMIT").
   * @returns A paginated list of audit logs ordered by creation date descending.
   */
  static async getLogs(
    limit: number = 20,
    offset: number = 0,
    entityName?: string,
    action?: string,
  ) {
    const conditions: SQL[] = [];

    if (entityName) {
      conditions.push(ilike(auditLogs.entityName, `%${entityName}%`));
    }
    if (action) {
      conditions.push(ilike(auditLogs.action, `%${action}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const selectedFields = {
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
    };

    const [data, totalRes] = await Promise.all([
      db
        .select(selectedFields)
        .from(auditLogs)
        .innerJoin(users, eq(auditLogs.performedBy, users.id))
        .where(whereClause)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .innerJoin(users, eq(auditLogs.performedBy, users.id))
        .where(whereClause),
    ]);

    const total = Number(totalRes[0]?.count ?? 0);
    const page = Math.floor(offset / limit) + 1;

    return {
      data,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    };
  }
}
