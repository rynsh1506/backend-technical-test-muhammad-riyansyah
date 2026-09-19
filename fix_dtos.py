import os
import re

# 1. Update audit/model.ts
with open("src/modules/audit/model.ts", "r") as f:
    audit_model = f.read()
    
audit_model = audit_model.replace(
    "// (No API DTOs defined yet for this module)",
    """export const auditLogResponseDto = selectAuditLogSchema;
export const auditLogListResponseDto = t.Array(selectAuditLogSchema);"""
)
# Make sure `t` is imported in audit
if "import { t } from" not in audit_model:
    audit_model = "import { t } from \"elysia\";\n" + audit_model
    
with open("src/modules/audit/model.ts", "w") as f:
    f.write(audit_model)


# 2. Update inventory/model.ts
with open("src/modules/inventory/model.ts", "r") as f:
    inv_model = f.read()

inv_model = inv_model.replace(
    "// (No API DTOs defined yet for this module)",
    """export const inventoryBalanceResponseDto = selectInventoryBalanceSchema;
export const inventoryMovementResponseDto = selectInventoryMovementSchema;
export const inventoryMovementListResponseDto = t.Array(selectInventoryMovementSchema);"""
)
# Make sure `t` is imported
if "import { t } from" not in inv_model:
    inv_model = "import { t } from \"elysia\";\n" + inv_model

with open("src/modules/inventory/model.ts", "w") as f:
    f.write(inv_model)


# 3. Update audit/index.ts
with open("src/modules/audit/index.ts", "r") as f:
    audit_idx = f.read()

# We need to import the DTOs
if "import { auditLogListResponseDto } from" not in audit_idx:
    audit_idx = audit_idx.replace("import { isAuthenticated } from \"@/utils/auth\";", "import { isAuthenticated } from \"@/utils/auth\";\nimport { auditLogListResponseDto } from \"@/modules/audit/model\";")

# Add response to GET /logs
# replace detail: { tags: ["Audit Trail"], ... } with response: { 200: auditLogListResponseDto }, detail: ...
audit_idx = audit_idx.replace(
    "detail: {",
    "response: { 200: auditLogListResponseDto },\n      detail: {"
)

with open("src/modules/audit/index.ts", "w") as f:
    f.write(audit_idx)


# 4. Update inventory/index.ts
with open("src/modules/inventory/index.ts", "r") as f:
    inv_idx = f.read()

if "import { inventoryBalanceResponseDto, inventoryMovementListResponseDto }" not in inv_idx:
    inv_idx = inv_idx.replace("import { isAuthenticated } from \"@/utils/auth\";", "import { isAuthenticated } from \"@/utils/auth\";\nimport { inventoryBalanceResponseDto, inventoryMovementListResponseDto } from \"@/modules/inventory/model\";")

# update levels endpoint
inv_idx = inv_idx.replace(
    "detail: { tags: [\"Inventory\"], summary: \"Get Inventory Level\" }",
    "response: { 200: t.Object({ stock: t.Number() }) },\n      detail: { tags: [\"Inventory\"], summary: \"Get Inventory Level\" }"
)

# wait, inventory levels endpoint returns `{ stock: balance?.stock ?? 0 }` right now?
# Let's check what it returns!

