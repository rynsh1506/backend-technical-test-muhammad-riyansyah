import { db } from "@/utils/db";
import { goodsReceipts } from "@/modules/goods-receipt/entities/goods_receipts.schema";
import { goodsReceiptItems } from "@/modules/goods-receipt/entities/goods_receipt_items.schema";
import { purchaseOrders } from "@/modules/purchase-order/entities/purchase_orders.schema";
import { purchaseOrderItems } from "@/modules/purchase-order/entities/purchase_order_items.schema";
import { inventoryBalances } from "@/modules/inventory/entities/inventory_balances.schema";
import { inventoryMovements } from "@/modules/inventory/entities/inventory_movements.schema";
import { auditLogs } from "@/modules/audit/entities/audit_logs.schema";
import { eq, sql } from "drizzle-orm";
import { status as elysiaStatus } from "elysia";
import { generateDocumentNumber } from "@/utils/generator";
import { purchaseRequests } from "@/modules/purchase-request/entities/purchase_requests.schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export abstract class GoodsReceiptService {
  /**
   * Creates a Goods Receipt (GR) for a Purchase Order.
   * Handles partial receipts, validates quantities, updates inventory, and updates PO status.
   *
   * @param poId - The ID of the purchase order being received.
   * @param userId - The ID of the user performing the receipt.
   * @param items - An array of incoming items with their product IDs and quantities.
   * @returns The newly created goods receipt record.
   * @throws {404} If the purchase order is not found.
   * @throws {400} If the purchase order status is invalid or if there is an over-receipt attempt.
   */
  static async create(
    poId: string,
    userId: string,
    items: { productId: string; quantity: number }[],
  ) {
    return await db.transaction(async (tx) => {
      const po = await this.getValidPurchaseOrder(tx, poId);
      const poItemsList = await this.getPurchaseOrderItems(tx, poId);
      const receivedMap = await this.getPreviousReceiptQuantities(tx, poId);

      const groupedIncoming = this.groupIncomingItems(items);

      this.validateIncomingQuantities(
        groupedIncoming,
        poItemsList,
        receivedMap,
        po.poNumber,
      );

      const isFullyReceived = this.checkIfFullyReceived(
        poItemsList,
        receivedMap,
        groupedIncoming,
      );

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

      await this.processInventoryUpdates(
        tx,
        po.purchaseRequestId,
        newGr!.id,
        grNumber,
        groupedIncoming,
      );

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
   *
   * @param grId - The ID of the goods receipt to retrieve.
   * @returns The goods receipt record populated with its items array.
   * @throws {404} If the goods receipt is not found.
   */
  static async getDetail(grId: string) {
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

  /**
   * Retrieves a purchase order and validates if it can receive goods.
   *
   * @param tx - The database transaction context.
   * @param poId - The ID of the purchase order.
   * @returns The valid purchase order record.
   * @throws {404} If the purchase order does not exist.
   * @throws {400} If the purchase order status is not ORDERED or PARTIALLY_RECEIVED.
   */
  private static async getValidPurchaseOrder(tx: Tx, poId: string) {
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
    return po;
  }

  /**
   * Retrieves all items belonging to a purchase order.
   *
   * @param tx - The database transaction context.
   * @param poId - The ID of the purchase order.
   * @returns An array of purchase order items.
   */
  private static async getPurchaseOrderItems(tx: Tx, poId: string) {
    return await tx
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, poId));
  }

  /**
   * Calculates the total quantities of items previously received for a purchase order.
   *
   * @param tx - The database transaction context.
   * @param poId - The ID of the purchase order.
   * @returns A map of product IDs to their total previously received quantities.
   */
  private static async getPreviousReceiptQuantities(
    tx: Tx,
    poId: string,
  ): Promise<Map<string, number>> {
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

    return new Map(
      previousReceipts.map((pr) => [pr.productId, pr.totalReceived]),
    );
  }

  /**
   * Groups a list of incoming items by product ID and sums their quantities.
   *
   * @param items - An array of incoming item payloads.
   * @returns A map of product IDs to their total incoming quantities.
   */
  private static groupIncomingItems(
    items: { productId: string; quantity: number }[],
  ): Map<string, number> {
    const grouped = new Map<string, number>();
    for (const item of items) {
      grouped.set(
        item.productId,
        (grouped.get(item.productId) || 0) + item.quantity,
      );
    }
    return grouped;
  }

  /**
   * Validates that incoming quantities do not exceed the remaining requested quantities on the PO.
   *
   * @param groupedIncoming - A map of incoming product IDs to their total quantities.
   * @param poItemsList - The original list of items on the purchase order.
   * @param receivedMap - A map of previously received product quantities.
   * @param poNumber - The purchase order string identifier for error messaging.
   * @returns void
   * @throws {400} If a product is not on the PO, or if the incoming quantity exceeds the remainder.
   */
  private static validateIncomingQuantities(
    groupedIncoming: Map<string, number>,
    poItemsList: { productId: string; quantity: number }[],
    receivedMap: Map<string, number>,
    poNumber: string,
  ) {
    const poItemsMap = new Map(
      poItemsList.map((item) => [item.productId, item]),
    );

    for (const [productId, incomingQty] of groupedIncoming.entries()) {
      const poItem = poItemsMap.get(productId);
      if (!poItem) {
        throw elysiaStatus(400, {
          error: {
            code: "INVALID_PRODUCT",
            message: `Product ID ${productId} is not part of Purchase Order ${poNumber}`,
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
  }

  /**
   * Checks whether the current receipt fullfills the entire purchase order.
   *
   * @param poItemsList - The original list of items on the purchase order.
   * @param receivedMap - A map of previously received product quantities.
   * @param groupedIncoming - A map of current incoming product quantities.
   * @returns True if all PO items have been completely received, false otherwise.
   */
  private static checkIfFullyReceived(
    poItemsList: { productId: string; quantity: number }[],
    receivedMap: Map<string, number>,
    groupedIncoming: Map<string, number>,
  ): boolean {
    for (const poItem of poItemsList) {
      const previouslyReceived = receivedMap.get(poItem.productId) || 0;
      const incomingQty = groupedIncoming.get(poItem.productId) || 0;
      const finalQty = previouslyReceived + incomingQty;

      if (finalQty < poItem.quantity) {
        return false;
      }
    }
    return true;
  }

  /**
   * Processes the insertion of goods receipt items and records inventory movements/balances.
   *
   * @param tx - The database transaction context.
   * @param purchaseRequestId - The ID of the underlying purchase request to resolve the warehouse.
   * @param grId - The ID of the newly created goods receipt.
   * @param grNumber - The goods receipt string identifier for inventory movement reference.
   * @param groupedIncoming - A map of incoming product IDs to their quantities.
   * @returns void
   */
  private static async processInventoryUpdates(
    tx: Tx,
    purchaseRequestId: string,
    grId: string,
    grNumber: string,
    groupedIncoming: Map<string, number>,
  ) {
    const prList = await tx
      .select({ warehouseId: purchaseRequests.warehouseId })
      .from(purchaseRequests)
      .where(eq(purchaseRequests.id, purchaseRequestId))
      .limit(1);

    const warehouseId = prList[0]!.warehouseId;

    const grItemsToInsert = [];
    const inventoryMovementsToInsert = [];

    for (const [productId, incomingQty] of groupedIncoming.entries()) {
      grItemsToInsert.push({
        goodsReceiptId: grId,
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
          target: [inventoryBalances.warehouseId, inventoryBalances.productId],
          set: { stock: sql`${inventoryBalances.stock} + ${incomingQty}` },
        });
    }

    await tx.insert(goodsReceiptItems).values(grItemsToInsert);
    await tx.insert(inventoryMovements).values(inventoryMovementsToInsert);
  }
}
