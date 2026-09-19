with open("src/modules/audit/model.ts", "r") as f:
    audit_model = f.read()

import re

audit_model = re.sub(
    r'export const auditLogResponseDto = t.Intersect\(\[.*?\]\);',
    """export const auditLogResponseDto = t.Object({
  id: t.Number(),
  entityName: t.String(),
  entityId: t.Number(),
  action: t.String(),
  changes: t.Unknown(),
  createdAt: t.Date(),
  performedBy: t.Object({
    id: t.Number(),
    username: t.String(),
    role: t.String(),
  })
});""",
    audit_model,
    flags=re.DOTALL
)

with open("src/modules/audit/model.ts", "w") as f:
    f.write(audit_model)
