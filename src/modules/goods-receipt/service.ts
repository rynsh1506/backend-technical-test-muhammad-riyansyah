import { db } from "@/utils/db";
import {
  goodsReceipts,
  goodsReceiptItems,
} from "@/modules/goods-receipt/model";
import {
  purchaseOrders,
  purchaseOrderItems,
} from "@/modules/purchase-order/model";
import {
  inventoryBalances,
  inventoryMovements,
} from "@/modules/inventory/model";
import { auditLogs } from "@/modules/audit/model";
import { eq, inArray, and, sql } from "drizzle-orm";
import { status as elysiaStatus } from "elysia";
import { generateDocumentNumber } from "@/utils/generator";
import { purchaseRequests } from "@/modules/purchase-request/model";

export abstract class GoodsReceiptService {
  /**
   * Creates a Goods Receipt (GR) for a Purchase Order.
   * Handles partial receipts, validates quantities, updates inventory, and updates PO status.
   */
  static async create(
    poId: number,
    userId: number,
    items: { productId: number; quantity: number }[],
  ) {
    return await db.transaction(async (tx) => {
      const poList = await tx
        .select()
        .from(purchaseOrders)
        .where(eq(purchaseOrders.id, poId))
        .limit(1);

      if (poList.length === 0) {
        throw elysiaStatus(404, {
          error: { code: "NOT_FOUND", message: "Purchase Order not found" },
        });
      }
      const po = poList[0]!;

      if (po.status !== "ORDERED" && po.status !== "PARTIALLY_RECEIVED") {
        throw elysiaStatus(400, {
          error: {
            code: "INVALID_STATUS",
            message: `Cannot receive goods for PO with status ${po.status}`,
          },
        });
      }

      const poItemsList = await tx
        .select()
        .from(purchaseOrderItems)
        .where(eq(purchaseOrderItems.purchaseOrderId, poId));

      const poItemsMap = new Map(
        poItemsList.map((item) => [item.productId, item]),
      );

      const previousReceipts = await tx
        .select({
          productId: goodsReceiptItems.productId,
          totalReceived: sql<number>`CAST(SUM(${goodsReceiptItems.quantity}) AS INTEGER)`,
        })
        .from(goodsReceiptItems)
        .innerJoin(
          goodsReceipts,
          eq(goodsReceipts.id, goodsReceiptItems.goodsReceiptId),
        )
        .where(eq(goodsReceipts.purchaseOrderId, poId))
        .groupBy(goodsReceiptItems.productId);

      const receivedMap = new Map(
        previousReceipts.map((pr) => [pr.productId, pr.totalReceived]),
      );

      let totalItemsOrdered = 0;
      let totalItemsReceivedAfterThis = 0;

      const groupedIncoming = new Map<number, number>();
      for (const item of items) {
        groupedIncoming.set(
          item.productId,
          (groupedIncoming.get(item.productId) || 0) + item.quantity,
        );
      }

      for (const [productId, incomingQty] of groupedIncoming.entries()) {
        const poItem = poItemsMap.get(productId);
        if (!poItem) {
          throw elysiaStatus(400, {
            error: {
              code: "INVALID_PRODUCT",
              message: `Product ID ${productId} is not part of Purchase Order ${po.poNumber}`,
            },
          });
        }

        const previouslyReceived = receivedMap.get(productId) || 0;
        const remaining = poItem.quantity - previouslyReceived;

        if (incomingQty > remaining) {
          throw elysiaStatus(400, {
            error: {
              code: "OVER_RECEIPT",
              message: `Cannot receive ${incomingQty} for product ${productId}. Only ${remaining} remaining.`,
            },
          });
        }
      }

      let isFullyReceived = true;
      for (const poItem of poItemsList) {
        const previouslyReceived = receivedMap.get(poItem.productId) || 0;
        const incomingQty = groupedIncoming.get(poItem.productId) || 0;
        const finalQty = previouslyReceived + incomingQty;
        if (finalQty < poItem.quantity) {
          isFullyReceived = false;
        }
      }

      const grNumber = await generateDocumentNumber(
        goodsReceipts,
        goodsReceipts.grNumber,
        "GR",
      );

      const [newGr] = await tx
        .insert(goodsReceipts)
        .values({
          grNumber,
          purchaseOrderId: poId,
          receivedBy: userId,
        })
        .returning();

      const prList = await tx
        .select({ warehouseId: purchaseRequests.warehouseId })
        .from(purchaseRequests)
        .where(eq(purchaseRequests.id, po.purchaseRequestId))
        .limit(1);

      const warehouseId = prList[0]!.warehouseId;

      const grItemsToInsert = [];
      const inventoryMovementsToInsert = [];

      for (const [productId, incomingQty] of groupedIncoming.entries()) {
        grItemsToInsert.push({
          goodsReceiptId: newGr!.id,
          productId,
          quantity: incomingQty,
        });

        inventoryMovementsToInsert.push({
          warehouseId,
          productId,
          quantity: incomingQty,
          referenceType: "GOODS_RECEIPT",
          referenceId: grNumber,
        });

        await tx
          .insert(inventoryBalances)
          .values({
            warehouseId,
            productId,
            stock: incomingQty,
          })
          .onConflictDoUpdate({
            target: [
              inventoryBalances.warehouseId,
              inventoryBalances.productId,
            ],
            set: { stock: sql`${inventoryBalances.stock} + ${incomingQty}` },
          });
      }

      await tx.insert(goodsReceiptItems).values(grItemsToInsert);
      await tx.insert(inventoryMovements).values(inventoryMovementsToInsert);

      const newStatus = isFullyReceived ? "RECEIVED" : "PARTIALLY_RECEIVED";
      if (po.status !== newStatus) {
        await tx
          .update(purchaseOrders)
          .set({ status: newStatus })
          .where(eq(purchaseOrders.id, poId));
      }

      await tx.insert(auditLogs).values({
        entityName: "goods_receipts",
        entityId: newGr!.id,
        action: "CREATE",
        performedBy: userId,
      });

      return await tx
        .select()
        .from(goodsReceipts)
        .where(eq(goodsReceipts.id, newGr!.id))
        .then((res) => res[0]);
    });
  }

  /**
   * Retrieves the details of a specific Goods Receipt including its items.
   */
  static async getDetail(grId: number) {
    const grList = await db
      .select()
      .from(goodsReceipts)
      .where(eq(goodsReceipts.id, grId))
      .limit(1);

    if (grList.length === 0) {
      throw elysiaStatus(404, {
        error: { code: "NOT_FOUND", message: "Goods Receipt not found" },
      });
    }

    const items = await db
      .select()
      .from(goodsReceiptItems)
      .where(eq(goodsReceiptItems.goodsReceiptId, grId));

    return { ...grList[0]!, items };
  }
}
