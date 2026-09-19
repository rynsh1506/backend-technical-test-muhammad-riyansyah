import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * End-to-end test suite for the Purchase Order module.
 * Tests creation from APPROVED PR, validation rules, and marking as ordered.
 */
describe("Purchase Order Module", () => {
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
      { code: `WH-PO-${randomSuffix}`, name: "PO Test WH", location: "PO Loc" },
      { headers: userCookie },
    );
    warehouseId = (wh.data as any).id;

    const supp = await api.suppliers.post(
      { name: "PO Test Supp", email: `po${randomSuffix}@supp.com` },
      { headers: userCookie },
    );
    supplierId = (supp.data as any).id;

    const prod1 = await api.products.post(
      { sku: `PO-PROD-${randomSuffix}`, name: "PO Product 1", unit: "PCS" },
      { headers: userCookie },
    );
    product1Id = (prod1.data as any).id;

    const prDraft = await api["purchase-requests"].post(
      { warehouseId },
      { headers: userCookie },
    );
    prId = (prDraft.data as any).id;

    await api["purchase-requests"]({ id: prId }).items.post(
      { productId: product1Id, quantity: 15 },
      { headers: userCookie },
    );
  });

  describe("Creation Logic", () => {
    it("should prevent creating PO if PR is not APPROVED", async () => {
      const { status } = await api["purchase-orders"].post(
        { purchaseRequestId: prId, supplierId },
        { headers: userCookie },
      );
      expect(status).toBe(400); // INVALID_STATUS
    });

    it("should allow creating PO after PR is APPROVED", async () => {
      await api["purchase-requests"]({ id: prId }).submit.post(
        {},
        { headers: userCookie },
      );

      await api["purchase-requests"]({ id: prId }).approve.post(
        {},
        { headers: approverCookie },
      );

      const { data, status } = await api["purchase-orders"].post(
        { purchaseRequestId: prId, supplierId },
        { headers: userCookie },
      );

      expect(status).toBe(200);
      expect((data as any).status).toBe("PENDING");
      expect((data as any).poNumber).toContain("PO-");
      poId = (data as any).id;
    });

    it("should prevent creating multiple POs for the same PR", async () => {
      const { status } = await api["purchase-orders"].post(
        { purchaseRequestId: prId, supplierId },
        { headers: userCookie },
      );
      expect(status).toBe(400); // DUPLICATE_PO
    });
  });

  describe("Retrieval and Status Updates", () => {
    it("should retrieve PO details and include items exactly matching PR", async () => {
      const { data, status } = await api["purchase-orders"]({ id: poId }).get({
        headers: userCookie,
      });

      expect(status).toBe(200);
      expect((data as any).items.length).toBe(1);
      expect((data as any).items[0].quantity).toBe(15);
      expect((data as any).items[0].productId).toBe(product1Id);
    });

    it("should mark the PO as ORDERED", async () => {
      const { data, status } = await api["purchase-orders"]({
        id: poId,
      }).order.post({}, { headers: userCookie });
      expect(status).toBe(200);
      expect((data as any).status).toBe("ORDERED");
    });
  });
});
