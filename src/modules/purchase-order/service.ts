import { db } from "@/utils/db";
import { purchaseOrders } from "@/modules/purchase-order/entities/purchase_orders.schema";
import { purchaseOrderItems } from "@/modules/purchase-order/entities/purchase_order_items.schema";
import { purchaseRequests } from "@/modules/purchase-request/entities/purchase_requests.schema";
import { purchaseRequestItems } from "@/modules/purchase-request/entities/purchase_request_items.schema";
import { suppliers } from "@/modules/supplier/entities/suppliers.schema";
import { eq, desc, sql } from "drizzle-orm";
import { generateDocumentNumber } from "@/utils/generator";
import { status } from "elysia";
import { auditLogs } from "@/modules/audit/entities/audit_logs.schema";

export abstract class PurchaseOrderService {
  /**
   * Creates a Purchase Order from an APPROVED Purchase Request.
   *
   * @param prId - The ID of the approved Purchase Request.
   * @param supplierId - The ID of the supplier.
   * @returns The newly created Purchase Order.
   * @throws {400} If PR is not APPROVED or PO already exists.
   * @throws {404} If PR or Supplier is not found.
   */
  static async createFromPr(prId: string, supplierId: string, userId: string) {
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
      if (pr.status !== "APPROVED") {
        throw status(400, {
          error: {
            code: "INVALID_STATUS",
            message:
              "Purchase Request must be approved before creating Purchase Order",
          },
        });
      }

      const supplierData = await tx
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, supplierId));

      if (supplierData.length === 0 || !supplierData[0]!.isActive) {
        throw status(400, {
          error: {
            code: "INVALID_SUPPLIER",
            message: "Supplier is invalid or inactive",
          },
        });
      }

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

      const poNumber = await generateDocumentNumber(
        purchaseOrders,
        purchaseOrders.poNumber,
        "PO",
      );
      const [newPo] = await tx
        .insert(purchaseOrders)
        .values({
          poNumber,
          purchaseRequestId: prId,
          supplierId,
          status: "DRAFT",
        })
        .returning();

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
      whereCondition = eq(
        purchaseOrders.status,
        filterStatus as
          "DRAFT" | "ORDERED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED",
      );
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
  static async getDetail(poId: string) {
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
   * @throws {400} If the request is not in DRAFT status.
   */
  static async markAsOrdered(poId: string, userId: string) {
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
    if (po.status !== "DRAFT") {
      throw status(400, {
        error: {
          code: "INVALID_STATUS",
          message: "Only DRAFT Purchase Order can be marked as ORDERED",
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
