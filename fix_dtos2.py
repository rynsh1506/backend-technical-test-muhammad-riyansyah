with open("src/modules/inventory/model.ts", "r") as f:
    inv_model = f.read()

# Fix inventoryBalanceResponseDto to allow optional id and updatedAt
inv_model = inv_model.replace(
    "export const inventoryBalanceResponseDto = selectInventoryBalanceSchema;",
    "export const inventoryBalanceResponseDto = t.Intersect([\n  t.Pick(selectInventoryBalanceSchema, [\"warehouseId\", \"productId\", \"stock\"]),\n  t.Partial(t.Pick(selectInventoryBalanceSchema, [\"id\", \"updatedAt\"]))\n]);"
)

with open("src/modules/inventory/model.ts", "w") as f:
    f.write(inv_model)

with open("src/modules/inventory/index.ts", "r") as f:
    inv_idx = f.read()

# update levels endpoint
inv_idx = inv_idx.replace(
    "response: { 200: t.Object({ stock: t.Number() }) },",
    "response: { 200: inventoryBalanceResponseDto },"
)

inv_idx = inv_idx.replace(
    "detail: { tags: [\"Inventory\"], summary: \"Get Inventory Movements\" }",
    "response: { 200: inventoryMovementListResponseDto },\n      detail: { tags: [\"Inventory\"], summary: \"Get Inventory Movements\" }"
)

with open("src/modules/inventory/index.ts", "w") as f:
    f.write(inv_idx)
