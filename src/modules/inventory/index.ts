import Elysia, { t } from "elysia";
import { InventoryService } from "@/modules/inventory/service";
import { isAuthenticated } from "@/utils/auth";
import {
  inventoryBalanceResponseDto,
  inventoryMovementListResponseDto,
} from "@/modules/inventory/dto";

export const inventoryController = new Elysia({ prefix: "/inventory" })
  .use(isAuthenticated)
  .get(
    "/levels",
    async ({ query }) => {
      return await InventoryService.getLevel(
        query.warehouseId,
        query.productId,
      );
    },
    {
      query: t.Object({
        warehouseId: t.String(),
        productId: t.String(),
      }),
      response: { 200: inventoryBalanceResponseDto },
      detail: { tags: ["Inventory"], summary: "Get Inventory Level" },
    },
  )
  .get(
    "/movements",
    async ({ query }) => {
      return await InventoryService.getMovements(
        query.warehouseId,
        query.productId,
      );
    },
    {
      query: t.Object({
        warehouseId: t.String(),
        productId: t.String(),
      }),
      response: { 200: inventoryMovementListResponseDto },
      detail: { tags: ["Inventory"], summary: "Get Inventory Movements" },
    },
  );
