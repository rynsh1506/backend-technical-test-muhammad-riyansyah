import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * Integration tests for the Purchase Order Module.
 * Covers creation from approved PRs and status updates.
 */
describe("Purchase Order Module", () => {
  let userCookie: Record<string, string> = {};
  let approverCookie: Record<string, string> = {};
  let warehouseId: number;
  let supplierId: number;
  let inactiveSupplierId: number;
  let product1Id: number;
  let prId: number;
  let poId: number;

  beforeAll(async () => {
    const { response: userRes } = await api.auth.login.post({
      username: "staff_user",
      password: "password123",
    });
    userCookie = {
      Cookie: userRes?.headers.get("Set-Cookie")?.split(";")[0] ?? "",
    };

    const { response: appRes } = await api.auth.login.post({
      username: "manager_approver",
      password: "password123",
    });
    approverCookie = {
      Cookie: appRes?.headers.get("Set-Cookie")?.split(";")[0] ?? "",
    };

    const randomSuffix = Math.floor(Math.random() * 1000000);

    const whRes = await api.warehouses.post(
      { code: `WH-PO-${randomSuffix}`, name: "PO WH", location: "Loc" },
      { headers: userCookie },
    );
    warehouseId = (whRes.data as { id: number }).id;

    const prodRes = await api.products.post(
      { sku: `PROD-PO-${randomSuffix}`, name: "PO Prod", unit: "PCS" },
      { headers: userCookie },
    );
    product1Id = (prodRes.data as { id: number }).id;

    const suppRes = await api.suppliers.post(
      { name: "PO Supp", email: "po@test.com", phone: "123" },
      { headers: userCookie },
    );
    supplierId = (suppRes.data as { id: number }).id;

    const suppInactiveRes = await api.suppliers.post(
      { name: "Inactive Supplier", email: "off@test.com", phone: "123" },
      { headers: userCookie },
    );
    inactiveSupplierId = (suppInactiveRes.data as { id: number }).id;
    await api
      .suppliers({ id: inactiveSupplierId })
      .put({ isActive: false }, { headers: userCookie });

    const prRes = await api["purchase-requests"].post(
      { warehouseId },
      { headers: userCookie },
    );
    prId = (prRes.data as { id: number }).id;

    await api["purchase-requests"]({ id: prId }).items.post(
      { productId: product1Id, quantity: 10 },
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
  });

  describe("Creation Logic", () => {
    it("should prevent USER from creating a PO", async () => {
      const { status, error } = await api["purchase-orders"].post(
        { purchaseRequestId: prId, supplierId },
        { headers: userCookie },
      );
      expect(status).toBe(403);
      expect(
        (error?.value as unknown as { error: { code: string } }).error.code,
      ).toBe("FORBIDDEN");
    });

    it("should prevent creating PO with inactive supplier", async () => {
      const { status, error } = await api["purchase-orders"].post(
        { purchaseRequestId: prId, supplierId: inactiveSupplierId },
        { headers: approverCookie },
      );
      expect(status).toBe(400);
      expect(
        (error?.value as unknown as { error: { code: string } }).error.code,
      ).toBe("INVALID_SUPPLIER");
    });

    it("should allow APPROVER to create PO from APPROVED PR", async () => {
      const { data, status } = await api["purchase-orders"].post(
        { purchaseRequestId: prId, supplierId },
        { headers: approverCookie },
      );
      expect(status).toBe(200);
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("poNumber");
      poId = (data as { id: number }).id;
    });

    it("should prevent creating multiple POs for the same PR", async () => {
      const { status } = await api["purchase-orders"].post(
        { purchaseRequestId: prId, supplierId },
        { headers: approverCookie },
      );
      expect(status).toBe(400);
    });
  });

  describe("Retrieval and Status Updates", () => {
    it("should retrieve PO details and include items exactly matching PR", async () => {
      const { data, status } = await api["purchase-orders"]({ id: poId }).get({
        headers: userCookie,
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty("items");
      const items = (data as { items: unknown[] }).items;
      expect(items.length).toBe(1);
      expect((items[0] as { productId: number }).productId).toBe(product1Id);
    });

    it("should mark the PO as ORDERED", async () => {
      const { data, status } = await api["purchase-orders"]({
        id: poId,
      }).order.post({}, { headers: approverCookie });
      expect(status).toBe(200);
      expect((data as { status: string }).status).toBe("ORDERED");
    });
  });
});
