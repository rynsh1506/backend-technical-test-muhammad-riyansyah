import { Elysia, t } from "elysia";
import { AuditService } from "@/modules/audit/service";
import { isAuthenticated } from "@/utils/auth";
import { auditLogListResponseDto } from "@/modules/audit/dto";

export const auditController = new Elysia({ prefix: "/audit" })
  .use(isAuthenticated)
  .get(
    "/logs",
    async ({ user, set }) => {
      if (user.role !== "APPROVER") {
        set.status = 403;
        return {
          error: {
            code: "FORBIDDEN",
            message: "Only APPROVER can view audit logs",
          },
        };
      }
      return await AuditService.getLogs();
    },
    {
      response: {
        200: auditLogListResponseDto,
        403: t.Object({
          error: t.Object({ code: t.String(), message: t.String() }),
        }),
      },
      detail: {
        tags: ["Audit Trail"],
        summary: "Get all audit logs",
        description:
          "Retrieves a history of critical actions performed in the system.",
      },
    },
  );
