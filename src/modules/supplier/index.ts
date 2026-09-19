import { Elysia, t } from "elysia";
import { SupplierService } from "@/modules/supplier/service";
import { SupplierModel } from "@/modules/supplier/model";
import { isAuthenticated } from "@/utils/auth";

export const supplierController = new Elysia({ prefix: "/suppliers" })
  .use(isAuthenticated)
  .post(
    "/",
    async ({ body }) => {
      return await SupplierService.create(body);
    },
    {
      body: SupplierModel.create,
      response: SupplierModel.response,
      detail: {
        tags: ["Master Data: Supplier"],
        summary: "Create Supplier",
      },
    },
  )
  .get(
    "/",
    async ({ query }) => {
      const page = query.page ? parseInt(query.page as string, 10) : 1;
      const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
      return await SupplierService.list(
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
      response: SupplierModel.listResponse,
      detail: {
        tags: ["Master Data: Supplier"],
        summary: "List all Suppliers",
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await SupplierService.getById(id);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      response: SupplierModel.response,
      detail: {
        tags: ["Master Data: Supplier"],
        summary: "Get Supplier by ID",
      },
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      return await SupplierService.update(id, body);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: SupplierModel.update,
      response: SupplierModel.response,
      detail: {
        tags: ["Master Data: Supplier"],
        summary: "Update Supplier",
      },
    },
  );
