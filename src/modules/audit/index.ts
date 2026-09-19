import { Elysia } from "elysia";
import { AuditService } from "@/modules/audit/service";
import { isAuthenticated } from "@/utils/auth";
import { auditLogListResponseDto } from "@/modules/audit/model";

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
      response: { 200: auditLogListResponseDto },
      detail: {
        tags: ["Audit Trail"],
        summary: "Get all audit logs",
        description:
          "Retrieves a history of critical actions performed in the system.",
      },
    },
  );
