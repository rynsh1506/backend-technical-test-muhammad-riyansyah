import { auditLogListResponseDto } from "./src/modules/audit/model";

type AuditLog = typeof auditLogListResponseDto.static;
type First = AuditLog[0];
