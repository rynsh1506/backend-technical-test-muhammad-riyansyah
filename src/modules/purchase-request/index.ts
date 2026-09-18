import Elysia, { t } from "elysia";
import { purchaseRequestService } from "@/modules/purchase-request/service";
import {
  prCreateDto,
  prUpdateDraftDto,
  prItemAddDto,
  prItemUpdateDto,
} from "@/modules/purchase-request/model";
import { isAuthenticated } from "@/utils/auth";
import { idempotencyPlugin } from "@/utils/idempotency";
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
    async ({
      body,
      user,
      request,
      idempotencyKey,
      checkIdempotency,
      saveIdempotency,
    }) => {
      if (user.role !== "USER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only USER can create PR" },
        });
      }

      if (checkIdempotency) {
        await checkIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
        );
      }

      const pr = await purchaseRequestService.createDraft(
        user.id,
        body.warehouseId,
      );

      if (saveIdempotency) {
        await saveIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
          pr,
        );
      }
      return pr;
    },
    {
      body: prCreateDto,
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
      return await purchaseRequestService.getList(
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
      return await purchaseRequestService.getDetail(Number(id));
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
      return await purchaseRequestService.updateDraft(
        Number(id),
        user.id,
        body.warehouseId!,
      );
    },
    {
      body: prUpdateDraftDto,
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
      return await purchaseRequestService.addItem(
        Number(id),
        user.id,
        body.productId,
        body.quantity,
      );
    },
    {
      body: prItemAddDto,
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
      return await purchaseRequestService.updateItem(
        Number(itemId),
        user.id,
        body.quantity,
      );
    },
    {
      body: prItemUpdateDto,
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
      return await purchaseRequestService.removeItem(Number(itemId), user.id);
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
    async ({
      params: { id },
      user,
      request,
      checkIdempotency,
      saveIdempotency,
    }) => {
      if (user.role !== "USER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only USER can submit PR" },
        });
      }

      if (checkIdempotency) {
        await checkIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
        );
      }

      const pr = await purchaseRequestService.submit(Number(id), user.id);

      if (saveIdempotency) {
        await saveIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
          pr,
        );
      }
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
    async ({
      params: { id },
      user,
      request,
      checkIdempotency,
      saveIdempotency,
    }) => {
      if (user.role !== "APPROVER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only APPROVER can approve PR" },
        });
      }

      if (checkIdempotency) {
        await checkIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
        );
      }

      const pr = await purchaseRequestService.approve(Number(id), user.id);

      if (saveIdempotency) {
        await saveIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
          pr,
        );
      }
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
    async ({
      params: { id },
      user,
      request,
      checkIdempotency,
      saveIdempotency,
    }) => {
      if (user.role !== "APPROVER") {
        throw status(403, {
          error: { code: "FORBIDDEN", message: "Only APPROVER can reject PR" },
        });
      }

      if (checkIdempotency) {
        await checkIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
        );
      }

      const pr = await purchaseRequestService.reject(Number(id), user.id);

      if (saveIdempotency) {
        await saveIdempotency(
          user.id,
          new URL(request.url).pathname,
          request.method,
          pr,
        );
      }
      return pr;
    },
    {
      detail: { tags: ["Purchase Request"], summary: "Reject PR" },
    },
  );
