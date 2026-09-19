import os

# Fix audit/index.ts (add 403 response)
with open("src/modules/audit/index.ts", "r") as f:
    audit_idx = f.read()

audit_idx = audit_idx.replace(
    "response: { 200: auditLogListResponseDto },",
    "response: { 200: auditLogListResponseDto, 403: t.Object({ error: t.Object({ code: t.String(), message: t.String() }) }) },"
)
if "import { t } from" not in audit_idx:
    audit_idx = audit_idx.replace("import { Elysia } from \"elysia\";", "import { Elysia, t } from \"elysia\";")

with open("src/modules/audit/index.ts", "w") as f:
    f.write(audit_idx)


# Fix inventory/service.ts (add ! for noUncheckedIndexedAccess)
with open("src/modules/inventory/service.ts", "r") as f:
    inv_srv = f.read()

inv_srv = inv_srv.replace("return level[0];", "return level[0]!;")

with open("src/modules/inventory/service.ts", "w") as f:
    f.write(inv_srv)

