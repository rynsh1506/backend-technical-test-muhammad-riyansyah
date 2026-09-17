import { Elysia, t } from "elysia";
import { ProductService } from "@/modules/product/service";
import { ProductModel } from "@/modules/product/model";
import { isAuthenticated } from "@/utils/auth";

export const productController = new Elysia({ prefix: "/products" })
  .use(isAuthenticated)
  .post(
    "/",
    async ({ body }) => {
      return await ProductService.create(body);
    },
    {
      body: ProductModel.create,
      response: ProductModel.response,
      detail: {
        tags: ["Master Data: Product"],
        summary: "Create Product",
      },
    },
  )
  .get(
    "/",
    async () => {
      return await ProductService.list();
    },
    {
      response: ProductModel.listResponse,
      detail: {
        tags: ["Master Data: Product"],
        summary: "List all Products",
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await ProductService.getById(id);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      response: ProductModel.response,
      detail: {
        tags: ["Master Data: Product"],
        summary: "Get Product by ID",
      },
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      return await ProductService.update(id, body);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: ProductModel.update,
      response: ProductModel.response,
      detail: {
        tags: ["Master Data: Product"],
        summary: "Update Product",
      },
    },
  );
