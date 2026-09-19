import { auditLogListResponseDto } from "./src/modules/audit/model";
type AuditLog = typeof auditLogListResponseDto.static;
const dummy: AuditLog = null as any;
