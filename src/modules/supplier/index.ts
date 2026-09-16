import { Elysia, t } from "elysia";
import { SupplierService } from "./service";
import { SupplierModel } from "./model";
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
    async () => {
      return await SupplierService.list();
    },
    {
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
