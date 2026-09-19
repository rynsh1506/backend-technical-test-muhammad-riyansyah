import { Elysia, t } from "elysia";
import { ProductService } from "@/modules/product/service";
import {
  productCreateDto,
  productUpdateDto,
  productResponseDto,
  productListResponseDto,
} from "@/modules/product/model";
import { isAuthenticated } from "@/utils/auth";

export const productController = new Elysia({ prefix: "/products" })
  .use(isAuthenticated)
  .post(
    "/",
    async ({ body }) => {
      return await ProductService.create(body);
    },
    {
      body: productCreateDto,
      response: productResponseDto,
      detail: {
        tags: ["Master Data: Product"],
        summary: "Create Product",
      },
    },
  )
  .get(
    "/",
    async ({ query }) => {
      const page = query.page ? parseInt(query.page as string, 10) : 1;
      const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
      return await ProductService.list(
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
      response: productListResponseDto,
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
      response: productResponseDto,
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
      body: productUpdateDto,
      response: productResponseDto,
      detail: {
        tags: ["Master Data: Product"],
        summary: "Update Product",
      },
    },
  );
