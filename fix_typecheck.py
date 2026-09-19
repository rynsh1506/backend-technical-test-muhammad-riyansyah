import os

# 1. Fix inventory/index.ts imports
with open("src/modules/inventory/index.ts", "r") as f:
    content = f.read()

content = content.replace(
    'import { isAuthenticated } from "@/utils/auth";',
    'import { isAuthenticated } from "@/utils/auth";\nimport { inventoryBalanceResponseDto, inventoryMovementListResponseDto } from "@/modules/inventory/model";'
)
# Fix levels endpoint to actually use the inventoryBalanceResponseDto (which it doesn't currently)
content = content.replace(
    'detail: { tags: ["Inventory"], summary: "Get Inventory Level" },',
    'response: { 200: inventoryBalanceResponseDto },\n      detail: { tags: ["Inventory"], summary: "Get Inventory Level" },'
)

with open("src/modules/inventory/index.ts", "w") as f:
    f.write(content)

# 2. Fix audit/model.ts DTO
with open("src/modules/audit/model.ts", "r") as f:
    audit_model = f.read()

audit_model = audit_model.replace(
    "export const auditLogResponseDto = selectAuditLogSchema;",
    """export const auditLogResponseDto = t.Intersect([
  t.Omit(selectAuditLogSchema, ["performedBy"]),
  t.Object({
    performedBy: t.Object({
      id: t.Number(),
      username: t.String(),
      role: t.String(),
    }),
  }),
]);"""
)

with open("src/modules/audit/model.ts", "w") as f:
    f.write(audit_model)
