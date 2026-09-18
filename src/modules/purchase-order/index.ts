import Elysia, { t } from "elysia";
import { PurchaseOrderService } from "@/modules/purchase-order/service";
import { poCreateDto } from "@/modules/purchase-order/model";
import { isAuthenticated } from "@/utils/auth";
import { idempotencyPlugin } from "@/utils/idempotency";

export const purchaseOrderController = new Elysia({
  prefix: "/purchase-orders",
})
  .use(isAuthenticated)
  .use(idempotencyPlugin)
  .post(
    "/",
    async ({ body, user, request, checkIdempotency, saveIdempotency }) => {
      if (checkIdempotency) {
        await checkIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
        );
      }

      const result = await PurchaseOrderService.createFromPr(
        body.purchaseRequestId,
        body.supplierId,
        user.id,
      );

      if (saveIdempotency) {
        await saveIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
          result,
        );
      }

      return result;
    },
    {
      body: poCreateDto,
      headers: t.Object({
        "idempotency-key": t.Optional(t.String()),
        cookie: t.Optional(t.String()),
      }),
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
    },
  )
  .get("/:id", async ({ params: { id } }) => {
    return await PurchaseOrderService.getDetail(Number(id));
  })
  .post(
    "/:id/order",
    async ({
      params: { id },
      user,
      request,
      checkIdempotency,
      saveIdempotency,
    }) => {
      if (checkIdempotency) {
        await checkIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
        );
      }

      const result = await PurchaseOrderService.markAsOrdered(
        Number(id),
        user.id,
      );

      if (saveIdempotency) {
        await saveIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
          result,
        );
      }

      return result;
    },
    {
      headers: t.Object({
        "idempotency-key": t.Optional(t.String()),
        cookie: t.Optional(t.String()),
      }),
    },
  );
