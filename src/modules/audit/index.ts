import { Elysia, t } from "elysia";
import { AuditService } from "@/modules/audit/service";
import { isAuthenticated } from "@/utils/auth";
import { auditLogListResponseDto } from "@/modules/audit/dto";

export const auditController = new Elysia({ prefix: "/audit" })
  .use(isAuthenticated)
  .get(
    "/logs",
    async ({ user, query, set }) => {
      if (user.role !== "APPROVER") {
        set.status = 403;
        return {
          error: {
            code: "FORBIDDEN",
            message: "Only APPROVER can view audit logs",
          },
        };
      }

      const limit = query.limit ? parseInt(query.limit) : 20;
      const offset = query.offset ? parseInt(query.offset) : 0;

      return await AuditService.getLogs(
        limit,
        offset,
        query.entityName,
        query.action,
      );
    },
    {
      query: t.Optional(
        t.Object({
          limit: t.Optional(t.String()),
          offset: t.Optional(t.String()),
          entityName: t.Optional(t.String()),
          action: t.Optional(t.String()),
        }),
      ),
      response: {
        200: auditLogListResponseDto,
        403: t.Object({
          error: t.Object({ code: t.String(), message: t.String() }),
        }),
      },
      detail: {
        tags: ["Audit Trail"],
        summary: "Get audit logs",
        description:
          "Retrieves a paginated history of critical actions. Filter by entity type (e.g. 'purchase_requests') or action (e.g. 'APPROVE', 'SUBMIT').",
      },
    },
  );
