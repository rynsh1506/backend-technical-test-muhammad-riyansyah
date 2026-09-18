import { db } from "@/utils/db";
import { purchaseOrders, purchaseOrderItems } from "@/modules/purchase-order/model";
import {
  purchaseRequests,
  purchaseRequestItems,
} from "@/modules/purchase-request/model";
import { suppliers } from "@/modules/supplier/model";
import { eq, desc, sql } from "drizzle-orm";
import { status } from "elysia";
import { auditLogs } from "@/modules/audit/model";

export abstract class PurchaseOrderService {
  /**
   * Generates a unique purchase order number in the format PO-YYYY-XXXXXX
   *
   * @returns {Promise<string>} The generated order number (e.g., "PO-2026-000001").
   */
  private static async generateOrderNumber() {
    const year = new Date().getFullYear();
    const latestPo = await db
      .select({ poNumber: purchaseOrders.poNumber })
      .from(purchaseOrders)
      .where(sql`${purchaseOrders.poNumber} LIKE ${`PO-${year}-%`}`)
      .orderBy(desc(purchaseOrders.poNumber))
      .limit(1);

    let sequence = 1;
    if (latestPo.length > 0) {
      const lastNum = parseInt(latestPo[0]!.poNumber.split("-")[2] ?? "0", 10);
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1;
      }
    }

    const paddedSequence = sequence.toString().padStart(6, "0");
    return `PO-${year}-${paddedSequence}`;
  }

  /**
   * Creates a Purchase Order from an APPROVED Purchase Request.
   *
   * @param prId - The ID of the approved Purchase Request.
   * @param supplierId - The ID of the supplier.
   * @returns The newly created Purchase Order.
   * @throws {400} If PR is not APPROVED or PO already exists.
   * @throws {404} If PR or Supplier is not found.
   */
  static async createFromPr(prId: number, supplierId: number, userId: number) {
    return await db.transaction(async (tx) => {
      // Check PR
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
      if (pr.status !== "APPROVED") {
        throw status(400, {
          error: {
            code: "INVALID_STATUS",
            message:
              "Purchase Request must be approved before creating Purchase Order",
          },
        });
      }

      // Check Supplier
      const supplierData = await tx
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, supplierId));

      if (supplierData.length === 0) {
        throw status(404, {
          error: { code: "NOT_FOUND", message: "Supplier not found" },
        });
      }

      // Check existing PO for this PR
      const existingPo = await tx
        .select()
        .from(purchaseOrders)
        .where(eq(purchaseOrders.purchaseRequestId, prId));

      if (existingPo.length > 0) {
        throw status(400, {
          error: {
            code: "DUPLICATE_PO",
            message: "Purchase Order already exists for this Purchase Request",
          },
        });
      }

      // Fetch PR items
      const prItems = await tx
        .select()
        .from(purchaseRequestItems)
        .where(eq(purchaseRequestItems.purchaseRequestId, prId));

      if (prItems.length === 0) {
        throw status(400, {
          error: {
            code: "EMPTY_REQUEST",
            message: "Cannot create PO from PR with no items",
          },
        });
      }

      // Create PO
      const poNumber = await this.generateOrderNumber();
      const [newPo] = await tx
        .insert(purchaseOrders)
        .values({
          poNumber,
          purchaseRequestId: prId,
          supplierId,
          status: "PENDING",
        })
        .returning();

      // Insert PO Items matching PR Items
      const poItemsData = prItems.map((item) => ({
        purchaseOrderId: newPo!.id,
        productId: item.productId,
        quantity: item.quantity,
      }));

      await tx.insert(purchaseOrderItems).values(poItemsData);

      await tx.insert(auditLogs).values({
        entityName: "purchase_orders",
        entityId: newPo!.id,
        action: "CREATE",
        performedBy: userId,
      });

      return newPo;
    });
  }

  /**
   * Retrieves a paginated list of purchase orders.
   *
   * @param page - The page number to retrieve.
   * @param limit - The maximum number of records per page.
   * @param filterStatus - Optional status filter.
   * @returns Paginated purchase orders.
   */
  static async getList(page = 1, limit = 10, filterStatus?: string) {
    const offset = (page - 1) * limit;

    let whereCondition = undefined;
    if (filterStatus) {
      whereCondition = eq(purchaseOrders.status, filterStatus as any);
    }

    const data = await db
      .select()
      .from(purchaseOrders)
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(purchaseOrders.createdAt));

    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(purchaseOrders)
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
   * Retrieves the details of a specific purchase order including its items.
   *
   * @param poId - The purchase order ID.
   * @returns The purchase order and its items.
   * @throws {404} If the purchase order is not found.
   */
  static async getDetail(poId: number) {
    const poData = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, poId));

    if (poData.length === 0) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "Purchase Order not found" },
      });
    }

    const items = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, poId));

    return { ...poData[0], items };
  }

  /**
   * Marks a Purchase Order as ORDERED.
   *
   * @param poId - The purchase order ID.
   * @returns The updated purchase order.
   * @throws {404} If the purchase order is not found.
   * @throws {400} If the request is not in PENDING status.
   */
  static async markAsOrdered(poId: number, userId: number) {
    const poData = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, poId));

    if (poData.length === 0) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "Purchase Order not found" },
      });
    }

    const po = poData[0]!;
    if (po.status !== "PENDING") {
      throw status(400, {
        error: {
          code: "INVALID_STATUS",
          message: "Only PENDING Purchase Order can be marked as ORDERED",
        },
      });
    }

    const [updated] = await db
      .update(purchaseOrders)
      .set({ status: "ORDERED" })
      .where(eq(purchaseOrders.id, poId))
      .returning();

    await db.insert(auditLogs).values({
      entityName: "purchase_orders",
      entityId: poId,
      action: "ORDERED",
      performedBy: userId,
    });

    return updated;
  }
}
