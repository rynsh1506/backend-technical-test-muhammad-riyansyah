import Elysia, { t } from "elysia";
import { GoodsReceiptService } from "@/modules/goods-receipt/service";
import { grCreateDto } from "@/modules/goods-receipt/model";
import { isAuthenticated } from "@/utils/auth";
import { idempotencyPlugin, IdempotencyService } from "@/utils/idempotency";

export const goodsReceiptController = new Elysia({
  prefix: "/goods-receipts",
})
  .use(isAuthenticated)
  .use(idempotencyPlugin)
  .post(
    "/",
    async ({ body, user, request, headers }) => {
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
      body: grCreateDto,
      headers: t.Object({
        "idempotency-key": t.Optional(t.String()),
        cookie: t.Optional(t.String()),
      }),
    },
  )
  .get("/:id", async ({ params: { id } }) => {
    return await GoodsReceiptService.getDetail(Number(id));
  });
