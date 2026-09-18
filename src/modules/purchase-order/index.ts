import Elysia, { t } from "elysia";
import { PurchaseOrderService } from "./service";
import { poCreateDto } from "./model";
import { isAuthenticated } from "@/utils/auth";
import { idempotencyPlugin } from "@/utils/idempotency";

export const purchaseOrderController = new Elysia({
  prefix: "/purchase-orders",
})
  .use(isAuthenticated)
  .use(idempotencyPlugin)

  /**
   * Creates a Purchase Order from an APPROVED Purchase Request.
   */
  .post(
    "/",
    async ({
      body,
      user,
      idempotencyKey,
      checkIdempotency,
      saveIdempotency,
    }) => {
      if (idempotencyKey) {
        const cached = await checkIdempotency(idempotencyKey);
        if (cached) return cached;
      }

      const result = await PurchaseOrderService.createFromPr(
        body.purchaseRequestId,
        body.supplierId,
        user.id,
      );

      if (idempotencyKey) {
        await saveIdempotency(idempotencyKey, result);
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

  /**
   * Retrieves a paginated list of purchase orders.
   */
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

  /**
   * Retrieves the details of a specific purchase order including its items.
   */
  .get("/:id", async ({ params: { id } }) => {
    return await PurchaseOrderService.getDetail(Number(id));
  })

  /**
   * Marks a Purchase Order as ORDERED.
   */
  .post(
    "/:id/order",
    async ({
      params: { id },
      user,
      idempotencyKey,
      checkIdempotency,
      saveIdempotency,
    }) => {
      if (idempotencyKey) {
        const cached = await checkIdempotency(idempotencyKey);
        if (cached) return cached;
      }

      const result = await PurchaseOrderService.markAsOrdered(
        Number(id),
        user.id,
      );

      if (idempotencyKey) {
        await saveIdempotency(idempotencyKey, result);
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
