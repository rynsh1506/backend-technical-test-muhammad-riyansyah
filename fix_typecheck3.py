with open("src/modules/audit/model.ts", "r") as f:
    audit_model = f.read()

audit_model = audit_model.replace(
    "export const auditLogListResponseDto = t.Array(selectAuditLogSchema);",
    "export const auditLogListResponseDto = t.Array(auditLogResponseDto);"
)

with open("src/modules/audit/model.ts", "w") as f:
    f.write(audit_model)
