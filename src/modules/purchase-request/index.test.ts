import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * End-to-end test suite for the Purchase Request module.
 * Tests draft creation, item management, submission, approval workflows, and idempotency.
 */
describe("Purchase Request Module", () => {
  let userCookie: Record<string, string> = {};
  let approverCookie: Record<string, string> = {};
  let warehouseId: string;
  let productId1: string;
  let productId2: string;
  let inactiveWarehouseId: string;
  let inactiveProductId: string;
  let otherUserCookie: Record<string, string> = {};

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

    const whRes = await api.warehouses.post(
      { code: `WH-PR-${randomSuffix}`, name: "PR Warehouse", location: "Loc" },
      { headers: userCookie },
    );
    warehouseId = (whRes.data as { id: string }).id;

    const p1Res = await api.products.post(
      { sku: `SKU-PR-1-${randomSuffix}`, name: "PR Prod 1", unit: "PCS" },
      { headers: userCookie },
    );
    productId1 = (p1Res.data as { id: string }).id;

    const p2Res = await api.products.post(
      { sku: `SKU-PR-2-${randomSuffix}`, name: "PR Prod 2", unit: "PCS" },
      { headers: userCookie },
    );
    productId2 = (p2Res.data as { id: string }).id;

    const whInactiveRes = await api.warehouses.post(
      {
        code: `WH-INACT-${randomSuffix}`,
        name: "Inactive WH",
        location: "Loc",
      },
      { headers: userCookie },
    );
    inactiveWarehouseId = (whInactiveRes.data as { id: string }).id;
    await api
      .warehouses({ id: inactiveWarehouseId })
      .put({ isActive: false }, { headers: userCookie });

    const prodInactiveRes = await api.products.post(
      { sku: `PROD-INACT-${randomSuffix}`, name: "Inactive Prod", unit: "PCS" },
      { headers: userCookie },
    );
    inactiveProductId = (prodInactiveRes.data as { id: string }).id;
    await api
      .products({ id: inactiveProductId })
      .put({ isActive: false }, { headers: userCookie });

    const { response: otherRes } = await api.auth.login.post({
      username: "staff_user_2",
      password: "password123",
    });
    const otherCookieStr =
      otherRes?.headers.get("Set-Cookie")?.split(";")[0] ?? "";
    otherUserCookie = { Cookie: otherCookieStr };
  });

  describe("Draft Creation and Updates", () => {
    it("should allow USER to create a DRAFT Purchase Request", async () => {
      const res = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      expect(res.status).toBe(200);
      expect((res.data as { status: string }).status).toBe("DRAFT");
      expect((res.data as { requestNumber: string }).requestNumber).toStartWith(
        "PR-",
      );
    });
    it("should prevent creating PR with inactive warehouse", async () => {
      const { status, error } = await api["purchase-requests"].post(
        { warehouseId: inactiveWarehouseId },
        { headers: userCookie },
      );
      expect(status).toBe(400);
      expect(
        (error?.value as unknown as { error: { code: string } }).error.code,
      ).toBe("INVALID_WAREHOUSE");
    });

    it("should prevent ownership violation when modifying another user's PR", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;

      const { status, error } = await api["purchase-requests"]({
        id: prId,
      }).items.post(
        { productId: productId1, quantity: 10 },
        { headers: otherUserCookie },
      );
      expect(status).toBe(403);
      expect(
        (error?.value as unknown as { error: { code: string } }).error.code,
      ).toBe("FORBIDDEN");
    });

    it("should allow USER to add items to DRAFT PR", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;

      const itemRes = await api["purchase-requests"]({ id: prId }).items.post(
        { productId: productId1, quantity: 10 },
        { headers: userCookie },
      );
      expect(itemRes.status).toBe(200);
      expect((itemRes.data as { quantity: number }).quantity).toBe(10);
    });
    it("should prevent adding inactive product to PR", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;

      const { status, error } = await api["purchase-requests"]({
        id: prId,
      }).items.post(
        { productId: inactiveProductId, quantity: 5 },
        { headers: userCookie },
      );
      expect(status).toBe(400);
      expect(
        (error?.value as unknown as { error: { code: string } }).error.code,
      ).toBe("INVALID_PRODUCT");
    });

    it("should prevent duplicate products in the same PR", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;

      await api["purchase-requests"]({ id: prId }).items.post(
        { productId: productId1, quantity: 10 },
        { headers: userCookie },
      );

      const dupRes = await api["purchase-requests"]({ id: prId }).items.post(
        { productId: productId1, quantity: 5 },
        { headers: userCookie },
      );
      expect(dupRes.status).toBe(400);
      expect(
        (
          dupRes.error?.value as unknown as unknown as {
            error: { code: string };
          }
        ).error.code,
      ).toBe("DUPLICATE_PRODUCT");
    });
  });

  describe("Submission and Approval Logic", () => {
    it("should reject SUBMIT if PR has no items", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;
      const submitRes = await api["purchase-requests"]({
        id: prId,
      }).submit.post({}, { headers: userCookie });
      expect(submitRes.status).toBe(400);
      expect(
        (
          submitRes.error?.value as unknown as unknown as {
            error: { code: string };
          }
        ).error.code,
      ).toBe("EMPTY_REQUEST");
    });

    it("should successfully SUBMIT a PR with items", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;
      await api["purchase-requests"]({ id: prId }).items.post(
        { productId: productId1, quantity: 10 },
        { headers: userCookie },
      );
      const submitRes = await api["purchase-requests"]({
        id: prId,
      }).submit.post({}, { headers: userCookie });
      expect(submitRes.status).toBe(200);
      expect((submitRes.data as { status: string }).status).toBe("SUBMITTED");
    });

    it("should reject APPROVE if PR is not SUBMITTED", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;
      const approveRes = await api["purchase-requests"]({
        id: prId,
      }).approve.post({}, { headers: approverCookie });
      expect(approveRes.status).toBe(400);
      expect(
        (
          approveRes.error?.value as unknown as unknown as {
            error: { code: string };
          }
        ).error.code,
      ).toBe("INVALID_STATUS");
    });

    it("should reject APPROVE if user is not APPROVER role", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;
      await api["purchase-requests"]({ id: prId }).items.post(
        { productId: productId1, quantity: 10 },
        { headers: userCookie },
      );
      await api["purchase-requests"]({ id: prId }).submit.post(
        {},
        { headers: userCookie },
      );

      const approveRes = await api["purchase-requests"]({
        id: prId,
      }).approve.post({}, { headers: userCookie });
      expect(approveRes.status).toBe(403);
      expect(
        (
          approveRes.error?.value as unknown as unknown as {
            error: { code: string };
          }
        ).error.code,
      ).toBe("FORBIDDEN");
    });

    it("should allow APPROVER to APPROVE a SUBMITTED PR", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;
      await api["purchase-requests"]({ id: prId }).items.post(
        { productId: productId1, quantity: 10 },
        { headers: userCookie },
      );
      await api["purchase-requests"]({ id: prId }).submit.post(
        {},
        { headers: userCookie },
      );

      const approveRes = await api["purchase-requests"]({
        id: prId,
      }).approve.post({}, { headers: approverCookie });
      expect(approveRes.status).toBe(200);
      expect((approveRes.data as { status: string }).status).toBe("APPROVED");
    });
  });

  describe("Idempotency", () => {
    it("should return the exact same response if Idempotency-Key is reused on submit", async () => {
      const draftRes = await api["purchase-requests"].post(
        { warehouseId },
        { headers: userCookie },
      );
      const prId = (draftRes.data as { id: string }).id;
      await api["purchase-requests"]({ id: prId }).items.post(
        { productId: productId1, quantity: 5 },
        { headers: userCookie },
      );

      const headersWithKey = {
        ...userCookie,
        "Idempotency-Key": "test-key-123",
      };
      const submit1 = await api["purchase-requests"]({ id: prId }).submit.post(
        {},
        { headers: headersWithKey },
      );
      expect(submit1.status).toBe(200);

      const submit2 = await api["purchase-requests"]({ id: prId }).submit.post(
        {},
        { headers: headersWithKey },
      );
      expect(submit2.status).toBe(200);
      expect(
        new Date(
          (submit2.data as { updatedAt: string }).updatedAt as string,
        ).toISOString(),
      ).toBe(
        new Date(
          (submit1.data as { updatedAt: string }).updatedAt as string,
        ).toISOString(),
      );
    });
  });
});
