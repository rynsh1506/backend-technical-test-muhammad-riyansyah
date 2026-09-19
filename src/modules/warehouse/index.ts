import { Elysia, t } from "elysia";
import { WarehouseService } from "@/modules/warehouse/service";
import {
  warehouseCreateDto,
  warehouseUpdateDto,
  warehouseResponseDto,
  warehouseListResponseDto,
} from "@/modules/warehouse/model";
import { isAuthenticated } from "@/utils/auth";

export const warehouseController = new Elysia({ prefix: "/warehouses" })
  .use(isAuthenticated)
  .post(
    "/",
    async ({ body }) => {
      return await WarehouseService.create(body);
    },
    {
      body: warehouseCreateDto,
      response: warehouseResponseDto,
      detail: {
        tags: ["Master Data: Warehouse"],
        summary: "Create Warehouse",
      },
    },
  )
  .get(
    "/",
    async ({ query }) => {
      const page = query.page ? parseInt(query.page as string, 10) : 1;
      const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
      return await WarehouseService.list(
        page,
        limit,
        query.search as string | undefined,
      );
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      response: warehouseListResponseDto,
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
      response: warehouseResponseDto,
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
      body: warehouseUpdateDto,
      response: warehouseResponseDto,
      detail: {
        tags: ["Master Data: Warehouse"],
        summary: "Update Warehouse",
      },
    },
  );
