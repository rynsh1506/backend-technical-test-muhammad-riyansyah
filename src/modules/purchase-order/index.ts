import Elysia, { t } from "elysia";
import { PurchaseOrderService } from "@/modules/purchase-order/service";
import { poCreateDto } from "@/modules/purchase-order/model";
import { isAuthenticated } from "@/utils/auth";
import { status } from "elysia";
import { idempotencyPlugin, IdempotencyService } from "@/utils/idempotency";

export const purchaseOrderController = new Elysia({
  prefix: "/purchase-orders",
})
  .use(isAuthenticated)
  .use(idempotencyPlugin)
  .post(
    "/",
    async ({ body, user, request, headers }) => {
      if (user.role !== "APPROVER") {
        throw status(403, {
          error: {
            code: "FORBIDDEN",
            message: "Only APPROVER can perform this action",
          },
        });
      }
      await IdempotencyService.check(user.id, headers["idempotency-key"]);

      const result = await PurchaseOrderService.createFromPr(
        body.purchaseRequestId,
        body.supplierId,
        user.id,
      );

      await IdempotencyService.save(
        user.id,
        "idempotency-key" in headers ? headers["idempotency-key"] : undefined,
        new URL(request.url).pathname,
        request.method,
        result,
      );

      return result;
    },
    {
      body: poCreateDto,
      headers: t.Object({
        "idempotency-key": t.Optional(t.String()),
        cookie: t.Optional(t.String()),
      }),
      detail: { tags: ["Purchase Order"], summary: "Create Purchase Order" },
    },
  )
  .get(
    "/",
    async ({ query }) => {
      const page = query.page ? Number(query.page) : 1;
      const limit = query.limit ? Number(query.limit) : 10;
      return await PurchaseOrderService.getList(page, limit, query.status);
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        status: t.Optional(t.String()),
      }),
      detail: { tags: ["Purchase Order"], summary: "List Purchase Orders" },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await PurchaseOrderService.getDetail(Number(id));
    },
    {
      detail: { tags: ["Purchase Order"], summary: "Get PO Details" },
    },
  )
  .post(
    "/:id/order",
    async ({ params: { id }, user, request, headers }) => {
      if (user.role !== "APPROVER") {
        throw status(403, {
          error: {
            code: "FORBIDDEN",
            message: "Only APPROVER can perform this action",
          },
        });
      }
      await IdempotencyService.check(user.id, headers["idempotency-key"]);

      const result = await PurchaseOrderService.markAsOrdered(
        Number(id),
        user.id,
      );

      await IdempotencyService.save(
        user.id,
        "idempotency-key" in headers ? headers["idempotency-key"] : undefined,
        new URL(request.url).pathname,
        request.method,
        result,
      );

      return result;
    },
    {
      headers: t.Object({
        "idempotency-key": t.Optional(t.String()),
        cookie: t.Optional(t.String()),
      }),
      detail: { tags: ["Purchase Order"], summary: "Mark PO as Ordered" },
    },
  );
