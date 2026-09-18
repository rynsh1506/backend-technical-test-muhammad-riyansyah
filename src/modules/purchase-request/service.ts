import { db } from "@/utils/db";
import {
  purchaseRequests,
  purchaseRequestItems,
} from "@/modules/purchase-request/model";
import { auditLogs } from "@/modules/audit/model";
import { eq, desc, and, sql } from "drizzle-orm";
import { status } from "elysia";

const generateRequestNumber = async () => {
  /**
   * Generates a unique purchase request number in the format PR-YYYY-XXXXXX
   */
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
};

export const purchaseRequestService = {
  createDraft: async (userId: number, warehouseId: number) => {
    return await db.transaction(async (tx) => {
      const requestNumber = await generateRequestNumber();
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
  },

  getList: async (page = 1, limit = 10, filterStatus?: string) => {
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
  },

  getDetail: async (prId: number) => {
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
  },

  updateDraft: async (prId: number, userId: number, warehouseId: number) => {
    const pr = await purchaseRequestService.getDetail(prId);
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
  },

  addItem: async (
    prId: number,
    userId: number,
    productId: number,
    quantity: number,
  ) => {
    const pr = await purchaseRequestService.getDetail(prId);
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
  },

  updateItem: async (itemId: number, userId: number, quantity: number) => {
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
    const pr = await purchaseRequestService.getDetail(prId);
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
  },

  removeItem: async (itemId: number, userId: number) => {
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
    const pr = await purchaseRequestService.getDetail(prId);
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
  },

  submit: async (prId: number, userId: number) => {
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
  },

  approve: async (prId: number, approverId: number) => {
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
  },

  reject: async (prId: number, approverId: number) => {
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
  },
};
