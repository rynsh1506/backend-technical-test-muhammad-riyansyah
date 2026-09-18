import { db } from "@/utils/db";
import {
  purchaseRequests,
  purchaseRequestItems,
} from "@/modules/purchase-request/model";
import { auditLogs } from "@/modules/audit/model";
import { eq, desc, and, sql } from "drizzle-orm";
import { status } from "elysia";

export abstract class PurchaseRequestService {
  /**
   * Generates a unique purchase request number in the format PR-YYYY-XXXXXX
   */
  private static async generateRequestNumber() {
    const year = new Date().getFullYear();
    const latestPr = await db
      .select({ requestNumber: purchaseRequests.requestNumber })
      .from(purchaseRequests)
      .where(sql`${purchaseRequests.requestNumber} LIKE ${`PR-${year}-%`}`)
      .orderBy(desc(purchaseRequests.requestNumber))
      .limit(1);

    let sequence = 1;
    if (latestPr.length > 0) {
      const lastNum = parseInt(
        latestPr[0]!.requestNumber.split("-")[2] ?? "0",
        10,
      );
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1;
      }
    }

    const paddedSequence = sequence.toString().padStart(6, "0");
    return `PR-${year}-${paddedSequence}`;
  }

  /**
   * Creates a draft purchase request.
   *
   * @param userId - The ID of the user creating the request.
   * @param warehouseId - The warehouse ID for this purchase request.
   * @returns The newly created purchase request.
   */
  static async createDraft(userId: number, warehouseId: number) {
    return await db.transaction(async (tx) => {
      const requestNumber = await this.generateRequestNumber();
      const [newPr] = await tx
        .insert(purchaseRequests)
        .values({
          requestNumber,
          warehouseId,
          requestedBy: userId,
          status: "DRAFT",
        })
        .returning();
      return newPr;
    });
  }

  /**
   * Retrieves a paginated list of purchase requests.
   *
   * @param page - The page number to retrieve.
   * @param limit - The maximum number of records per page.
   * @param filterStatus - Optional status filter.
   * @returns Paginated purchase requests.
   */
  static async getList(page = 1, limit = 10, filterStatus?: string) {
    const offset = (page - 1) * limit;

    let whereCondition = undefined;
    if (filterStatus) {
      whereCondition = eq(purchaseRequests.status, filterStatus as any);
    }

    const data = await db
      .select()
      .from(purchaseRequests)
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(purchaseRequests.createdAt));

    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(purchaseRequests)
      .where(whereCondition);

    const total = Number(totalRes[0]!.count);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves the details of a specific purchase request including its items.
   *
   * @param prId - The purchase request ID.
   * @returns The purchase request and its items.
   * @throws {404} If the purchase request is not found.
   */
  static async getDetail(prId: number) {
    const pr = await db
      .select()
      .from(purchaseRequests)
      .where(eq(purchaseRequests.id, prId));

    if (pr.length === 0) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "Purchase Request not found" },
      });
    }

    const items = await db
      .select()
      .from(purchaseRequestItems)
      .where(eq(purchaseRequestItems.purchaseRequestId, prId));

    return { ...pr[0], items };
  }

  /**
   * Updates the warehouse of a draft purchase request.
   *
   * @param prId - The purchase request ID.
   *  @param warehouseId - The new warehouse ID.
   * @returns The updated purchase request.
   * @throws {400} If the request is not in DRAFT status.
   */
  static async updateDraft(prId: number, warehouseId: number) {
    const pr = await this.getDetail(prId);
    if (pr.status !== "DRAFT") {
      throw status(400, {
        error: {
          code: "INVALID_STATUS",
          message: "Can only update DRAFT Purchase Request",
        },
      });
    }

    const [updated] = await db
      .update(purchaseRequests)
      .set({ warehouseId })
      .where(eq(purchaseRequests.id, prId))
      .returning();

    return updated;
  }

  /**
   * Adds an item to a draft purchase request.
   *
   * @param prId - The purchase request ID.
   *  @param productId - The product ID to add.
   * @param quantity - The quantity of the product.
   * @returns The newly added item.
   * @throws {400} If the request is not in DRAFT status or product is duplicate.
   */
  static async addItem(prId: number, productId: number, quantity: number) {
    const pr = await this.getDetail(prId);
    if (pr.status !== "DRAFT") {
      throw status(400, {
        error: {
          code: "INVALID_STATUS",
          message: "Can only add items to DRAFT Purchase Request",
        },
      });
    }

    try {
      const [item] = await db
        .insert(purchaseRequestItems)
        .values({
          purchaseRequestId: prId,
          productId,
          quantity,
        })
        .returning();
      return item;
    } catch (error: any) {
      if (error.code === "23505" || error.cause?.code === "23505") {
        throw status(400, {
          error: {
            code: "DUPLICATE_PRODUCT",
            message: "Product already exists in this Purchase Request",
          },
        });
      }
      throw error;
    }
  }

  /**
   * Updates the quantity of an item in a draft purchase request.
   *
   * @param itemId - The ID of the item to update.
   *  @param quantity - The new quantity.
   * @returns The updated item.
   * @throws {404} If the item is not found.
   * @throws {400} If the purchase request is not in DRAFT status.
   */
  static async updateItem(itemId: number, quantity: number) {
    const items = await db
      .select()
      .from(purchaseRequestItems)
      .where(eq(purchaseRequestItems.id, itemId));
    if (items.length === 0) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "Item not found" },
      });
    }

    const prId = items[0]!.purchaseRequestId;
    const pr = await this.getDetail(prId);
    if (pr.status !== "DRAFT") {
      throw status(400, {
        error: {
          code: "INVALID_STATUS",
          message: "Can only update items in DRAFT Purchase Request",
        },
      });
    }

    const [updated] = await db
      .update(purchaseRequestItems)
      .set({ quantity })
      .where(eq(purchaseRequestItems.id, itemId))
      .returning();
    return updated;
  }

  /**
   * Removes an item from a draft purchase request.
   *
   * @param itemId - The ID of the item to remove.
   *  @returns A success status.
   * @throws {404} If the item is not found.
   * @throws {400} If the purchase request is not in DRAFT status.
   */
  static async removeItem(itemId: number) {
    const items = await db
      .select()
      .from(purchaseRequestItems)
      .where(eq(purchaseRequestItems.id, itemId));
    if (items.length === 0) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "Item not found" },
      });
    }

    const prId = items[0]!.purchaseRequestId;
    const pr = await this.getDetail(prId);
    if (pr.status !== "DRAFT") {
      throw status(400, {
        error: {
          code: "INVALID_STATUS",
          message: "Can only remove items in DRAFT Purchase Request",
        },
      });
    }

    await db
      .delete(purchaseRequestItems)
      .where(eq(purchaseRequestItems.id, itemId));
    return { success: true };
  }

  /**
   * Submits a draft purchase request for approval.
   *
   * @param prId - The purchase request ID.
   * @param userId - The user ID submitting the request.
   * @returns The updated purchase request.
   * @throws {404} If the purchase request is not found.
   * @throws {400} If the request is not in DRAFT status or has no items.
   */
  static async submit(prId: number, userId: number) {
    return await db.transaction(async (tx) => {
      const prData = await tx
        .select()
        .from(purchaseRequests)
        .where(eq(purchaseRequests.id, prId));
      if (prData.length === 0) {
        throw status(404, {
          error: { code: "NOT_FOUND", message: "Purchase Request not found" },
        });
      }

      const pr = prData[0]!;
      if (pr.status !== "DRAFT") {
        throw status(400, {
          error: {
            code: "INVALID_STATUS",
            message: "Purchase Request is not in DRAFT status",
          },
        });
      }

      const items = await tx
        .select()
        .from(purchaseRequestItems)
        .where(eq(purchaseRequestItems.purchaseRequestId, prId));
      if (items.length === 0) {
        throw status(400, {
          error: {
            code: "EMPTY_REQUEST",
            message: "Cannot submit Purchase Request without items",
          },
        });
      }

      const [updated] = await tx
        .update(purchaseRequests)
        .set({ status: "SUBMITTED" })
        .where(eq(purchaseRequests.id, prId))
        .returning();

      await tx.insert(auditLogs).values({
        entityName: "purchase_requests",
        entityId: prId,
        action: "SUBMIT",
        performedBy: userId,
      });

      return updated;
    });
  }

  /**
   * Approves a submitted purchase request.
   *
   * @param prId - The purchase request ID.
   * @param approverId - The user ID approving the request.
   * @returns The updated purchase request.
   * @throws {404} If the purchase request is not found.
   * @throws {400} If the request is not in SUBMITTED status.
   */
  static async approve(prId: number, approverId: number) {
    return await db.transaction(async (tx) => {
      const prData = await tx
        .select()
        .from(purchaseRequests)
        .where(eq(purchaseRequests.id, prId));
      if (prData.length === 0) {
        throw status(404, {
          error: { code: "NOT_FOUND", message: "Purchase Request not found" },
        });
      }

      const pr = prData[0]!;
      if (pr.status !== "SUBMITTED") {
        throw status(400, {
          error: {
            code: "INVALID_STATUS",
            message: "Only SUBMITTED Purchase Request can be approved",
          },
        });
      }

      const [updated] = await tx
        .update(purchaseRequests)
        .set({ status: "APPROVED" })
        .where(eq(purchaseRequests.id, prId))
        .returning();

      await tx.insert(auditLogs).values({
        entityName: "purchase_requests",
        entityId: prId,
        action: "APPROVE",
        performedBy: approverId,
      });

      return updated;
    });
  }

  /**
   * Rejects a submitted purchase request.
   *
   * @param prId - The purchase request ID.
   * @param approverId - The user ID rejecting the request.
   * @returns The updated purchase request.
   * @throws {404} If the purchase request is not found.
   * @throws {400} If the request is not in SUBMITTED status.
   */
  static async reject(prId: number, approverId: number) {
    return await db.transaction(async (tx) => {
      const prData = await tx
        .select()
        .from(purchaseRequests)
        .where(eq(purchaseRequests.id, prId));
      if (prData.length === 0) {
        throw status(404, {
          error: { code: "NOT_FOUND", message: "Purchase Request not found" },
        });
      }

      const pr = prData[0]!;
      if (pr.status !== "SUBMITTED") {
        throw status(400, {
          error: {
            code: "INVALID_STATUS",
            message: "Only SUBMITTED Purchase Request can be rejected",
          },
        });
      }

      const [updated] = await tx
        .update(purchaseRequests)
        .set({ status: "REJECTED" })
        .where(eq(purchaseRequests.id, prId))
        .returning();

      await tx.insert(auditLogs).values({
        entityName: "purchase_requests",
        entityId: prId,
        action: "REJECT",
        performedBy: approverId,
      });

      return updated;
    });
  }
}
