import Elysia, { t } from "elysia";
import { GoodsReceiptService } from "@/modules/goods-receipt/service";
import { goodsReceiptCreateDto } from "@/modules/goods-receipt/dto";
import { isAuthenticated } from "@/utils/auth";
import { status } from "elysia";
import { idempotencyPlugin, IdempotencyService } from "@/utils/idempotency";

export const goodsReceiptController = new Elysia({
  prefix: "/goods-receipts",
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

      const result = await GoodsReceiptService.create(
        body.purchaseOrderId,
        user.id,
        body.items,
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
      body: goodsReceiptCreateDto,
      headers: t.Object({
        "idempotency-key": t.Optional(t.String()),
        cookie: t.Optional(t.String()),
      }),
      detail: { tags: ["Goods Receipt"], summary: "Create Goods Receipt" },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await GoodsReceiptService.getDetail(id);
    },
    {
      detail: { tags: ["Goods Receipt"], summary: "Get GR Details" },
    },
  );
