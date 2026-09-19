import Elysia, { t } from "elysia";
import { PurchaseRequestService } from "@/modules/purchase-request/service";
import {
  purchaseRequestCreateDto,
  purchaseRequestUpdateDraftDto,
  purchaseRequestItemAddDto,
  purchaseRequestItemUpdateDto,
} from "@/modules/purchase-request/dto";
import { isAuthenticated } from "@/utils/auth";
import { idempotencyPlugin, IdempotencyService } from "@/utils/idempotency";
import { status } from "elysia";

export const purchaseRequestController = new Elysia({
  prefix: "/purchase-requests",
})
  .use(isAuthenticated)
  .use(idempotencyPlugin)

  /**
   * Creates a draft purchase request.
   * Requires USER role.
   */
  .post(
    "/",
    async ({ body, user, request, headers }) => {
      if (user.role !== "USER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only USER can create PR" },
        });
      }

      await IdempotencyService.check(user.id, headers["idempotency-key"]);

      const pr = await PurchaseRequestService.createDraft(
        user.id,
        body.warehouseId,
      );

      await IdempotencyService.save(
        user.id,
        "idempotency-key" in headers ? headers["idempotency-key"] : undefined,
        new URL(request.url).pathname,
        request.method,
        pr,
      );
      return pr;
    },
    {
      body: purchaseRequestCreateDto,
      detail: { tags: ["Purchase Request"], summary: "Create Draft PR" },
    },
  )

  /**
   * Retrieves a paginated list of purchase requests.
   */
  .get(
    "/",
    async ({ query }) => {
      const page = query.page ? parseInt(query.page as string, 10) : 1;
      const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
      return await PurchaseRequestService.getList(
        page,
        limit,
        query.status as string | undefined,
      );
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Purchase Request"],
        summary: "List PRs with Pagination & Filter",
      },
    },
  )

  /**
   * Retrieves the details of a specific purchase request including its items.
   */
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await PurchaseRequestService.getDetail(id);
    },
    {
      detail: { tags: ["Purchase Request"], summary: "Get PR Detail" },
    },
  )

  /**
   * Updates the warehouse of a draft purchase request.
   * Requires USER role.
   */
  .patch(
    "/:id/draft",
    async ({ params: { id }, body, user }) => {
      if (user.role !== "USER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only USER can update PR" },
        });
      }
      return await PurchaseRequestService.updateDraft(
        id,
        body.warehouseId!,
        user.id,
      );
    },
    {
      body: purchaseRequestUpdateDraftDto,
      detail: { tags: ["Purchase Request"], summary: "Update Draft PR" },
    },
  )

  /**
   * Adds an item to a draft purchase request.
   * Requires USER role.
   */
  .post(
    "/:id/items",
    async ({ params: { id }, body, user }) => {
      if (user.role !== "USER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only USER can add PR items" },
        });
      }
      return await PurchaseRequestService.addItem(
        id,
        body.productId,
        body.quantity,
        user.id,
      );
    },
    {
      body: purchaseRequestItemAddDto,
      detail: { tags: ["Purchase Request"], summary: "Add Item to PR" },
    },
  )

  /**
   * Updates the quantity of an item in a draft purchase request.
   * Requires USER role.
   */
  .patch(
    "/items/:itemId",
    async ({ params: { itemId }, body, user }) => {
      if (user.role !== "USER") {
        throw status(403, {
          error: {
            code: "FORBIDDEN",
            message: "Only USER can update PR items",
          },
        });
      }
      return await PurchaseRequestService.updateItem(
        itemId,
        body.quantity,
        user.id,
      );
    },
    {
      body: purchaseRequestItemUpdateDto,
      detail: { tags: ["Purchase Request"], summary: "Update Item Quantity" },
    },
  )

  /**
   * Removes an item from a draft purchase request.
   * Requires USER role.
   */
  .delete(
    "/items/:itemId",
    async ({ params: { itemId }, user }) => {
      if (user.role !== "USER") {
        throw status(403, {
          error: {
            code: "FORBIDDEN",
            message: "Only USER can remove PR items",
          },
        });
      }
      return await PurchaseRequestService.removeItem(itemId, user.id);
    },
    {
      detail: { tags: ["Purchase Request"], summary: "Remove Item from PR" },
    },
  )

  /**
   * Submits a draft purchase request for approval.
   * Requires USER role.
   */
  .post(
    "/:id/submit",
    async ({ params: { id }, user, request, headers }) => {
      if (user.role !== "USER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only USER can submit PR" },
        });
      }

      await IdempotencyService.check(user.id, headers["idempotency-key"]);

      const pr = await PurchaseRequestService.submit(id, user.id);

      await IdempotencyService.save(
        user.id,
        "idempotency-key" in headers ? headers["idempotency-key"] : undefined,
        new URL(request.url).pathname,
        request.method,
        pr,
      );
      return pr;
    },
    {
      detail: { tags: ["Purchase Request"], summary: "Submit PR" },
    },
  )

  /**
   * Approves a submitted purchase request.
   * Requires APPROVER role.
   */
  .post(
    "/:id/approve",
    async ({ params: { id }, user, request, headers }) => {
      if (user.role !== "APPROVER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only APPROVER can approve PR" },
        });
      }

      await IdempotencyService.check(user.id, headers["idempotency-key"]);

      const pr = await PurchaseRequestService.approve(id, user.id);

      await IdempotencyService.save(
        user.id,
        "idempotency-key" in headers ? headers["idempotency-key"] : undefined,
        new URL(request.url).pathname,
        request.method,
        pr,
      );
      return pr;
    },
    {
      detail: { tags: ["Purchase Request"], summary: "Approve PR" },
    },
  )

  /**
   * Rejects a submitted purchase request.
   * Requires APPROVER role.
   */
  .post(
    "/:id/reject",
    async ({ params: { id }, user, request, headers }) => {
      if (user.role !== "APPROVER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only APPROVER can reject PR" },
        });
      }

      await IdempotencyService.check(user.id, headers["idempotency-key"]);

      const pr = await PurchaseRequestService.reject(id, user.id);

      await IdempotencyService.save(
        user.id,
        "idempotency-key" in headers ? headers["idempotency-key"] : undefined,
        new URL(request.url).pathname,
        request.method,
        pr,
      );
      return pr;
    },
    {
      detail: { tags: ["Purchase Request"], summary: "Reject PR" },
    },
  );
