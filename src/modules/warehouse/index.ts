import { Elysia, t } from "elysia";
import { WarehouseService } from "./service";
import { WarehouseModel } from "./model";
import { isAuthenticated } from "@/utils/auth";

export const warehouseController = new Elysia({ prefix: "/warehouses" })
  .use(isAuthenticated)
  .post(
    "/",
    async ({ body }) => {
      return await WarehouseService.create(body);
    },
    {
      body: WarehouseModel.create,
      response: WarehouseModel.response,
      detail: {
        tags: ["Master Data: Warehouse"],
        summary: "Create Warehouse",
      },
    },
  )
  .get(
    "/",
    async () => {
      return await WarehouseService.list();
    },
    {
      response: WarehouseModel.listResponse,
      detail: {
        tags: ["Master Data: Warehouse"],
        summary: "List all Warehouses",
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await WarehouseService.getById(id);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      response: WarehouseModel.response,
      detail: {
        tags: ["Master Data: Warehouse"],
        summary: "Get Warehouse by ID",
      },
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      return await WarehouseService.update(id, body);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: WarehouseModel.update,
      response: WarehouseModel.response,
      detail: {
        tags: ["Master Data: Warehouse"],
        summary: "Update Warehouse",
      },
    },
  );
