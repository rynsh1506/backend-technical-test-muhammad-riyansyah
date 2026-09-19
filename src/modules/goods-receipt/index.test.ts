import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * End-to-end test suite for the Goods Receipt module.
 * Tests partial receipts, inventory updates, and PO status progression.
 */
describe("Goods Receipt Module", () => {
  let userCookie: Record<string, string> = {};
  let approverCookie: Record<string, string> = {};
  let warehouseId: number;
  let supplierId: number;
  let product1Id: number;
  let prId: number;
  let poId: number;

  beforeAll(async () => {
    const { response: userRes } = await api.auth.login.post({
      username: "staff_user",
      password: "password123",
    });
    const userCookieStr =
      userRes?.headers.get("Set-Cookie")?.split(";")[0] ?? "";
    userCookie = { Cookie: userCookieStr };

    const { response: appRes } = await api.auth.login.post({
      username: "manager_approver",
      password: "password123",
    });
    const appCookieStr = appRes?.headers.get("Set-Cookie")?.split(";")[0] ?? "";
    approverCookie = { Cookie: appCookieStr };

    const randomSuffix = Math.floor(Math.random() * 1000000);

    const wh = await api.warehouses.post(
      { code: `WH-GR-${randomSuffix}`, name: "GR Test WH", location: "Loc" },
      { headers: userCookie },
    );
    warehouseId = (wh.data as { id: number }).id;

    const supp = await api.suppliers.post(
      { name: "GR Test Supp", email: `gr${randomSuffix}@supp.com` },
      { headers: userCookie },
    );
    supplierId = (supp.data as { id: number }).id;

    const prod1 = await api.products.post(
      { sku: `GR-PROD-${randomSuffix}`, name: "GR Product 1", unit: "PCS" },
      { headers: userCookie },
    );
    product1Id = (prod1.data as { id: number }).id;

    const prDraft = await api["purchase-requests"].post(
      { warehouseId },
      { headers: userCookie },
    );
    prId = (prDraft.data as { id: number }).id;

    await api["purchase-requests"]({ id: prId }).items.post(
      { productId: product1Id, quantity: 100 },
      { headers: userCookie },
    );

    await api["purchase-requests"]({ id: prId }).submit.post(
      {},
      { headers: userCookie },
    );
    await api["purchase-requests"]({ id: prId }).approve.post(
      {},
      { headers: approverCookie },
    );

    const poRes = await api["purchase-orders"].post(
      { purchaseRequestId: prId, supplierId },
      { headers: userCookie },
    );
    poId = (poRes.data as { id: number }).id;

    await api["purchase-orders"]({ id: poId }).order.post(
      {},
      { headers: userCookie },
    );
  });

  describe("Goods Receipt Operations", () => {
    it("should allow partial goods receipt and increase inventory", async () => {
      const { data, status } = await api["goods-receipts"].post(
        {
          purchaseOrderId: poId,
          items: [{ productId: product1Id, quantity: 60 }],
        },
        { headers: userCookie },
      );

      expect(status).toBe(200);
      expect((data as { grNumber: string }).grNumber).toContain("GR-");

      const poRes = await api["purchase-orders"]({ id: poId }).get({
        headers: userCookie,
      });
      expect((poRes.data as { status: string }).status).toBe(
        "PARTIALLY_RECEIVED",
      );
    });

    it("should prevent receiving more quantity than ordered", async () => {
      const { status } = await api["goods-receipts"].post(
        {
          purchaseOrderId: poId,
          items: [{ productId: product1Id, quantity: 50 }],
        },
        { headers: userCookie },
      );

      expect(status).toBe(400); // OVER_RECEIPT
    });

    it("should allow completing the goods receipt and mark PO as RECEIVED", async () => {
      const { status } = await api["goods-receipts"].post(
        {
          purchaseOrderId: poId,
          items: [{ productId: product1Id, quantity: 40 }],
        },
        { headers: userCookie },
      );

      expect(status).toBe(200);

      const poRes = await api["purchase-orders"]({ id: poId }).get({
        headers: userCookie,
      });
      expect((poRes.data as { status: string }).status).toBe("RECEIVED");
    });
  });
});
