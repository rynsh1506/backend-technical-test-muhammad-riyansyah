import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * Integration tests for the Inventory Module.
 * Covers querying inventory levels and movements.
 */
describe("Inventory Module", () => {
  let userCookie: Record<string, string> = {};
  let warehouseId: string;
  let productId: string;

  beforeAll(async () => {
    const { response: userRes } = await api.auth.login.post({
      username: "staff_user",
      password: "password123",
    });
    userCookie = {
      Cookie: userRes?.headers.get("Set-Cookie")?.split(";")[0] ?? "",
    };

    const randomSuffix = Math.floor(Math.random() * 1000000);
    const whRes = await api.warehouses.post(
      { code: `WH-INV-${randomSuffix}`, name: "WH INV", location: "Loc" },
      { headers: userCookie },
    );
    warehouseId = (whRes.data as { id: string }).id;

    const prodRes = await api.products.post(
      { sku: `INV-${randomSuffix}`, name: "PROD INV", unit: "PCS" },
      { headers: userCookie },
    );
    productId = (prodRes.data as { id: string }).id;
  });

  it("should return zero quantity for item with no inventory", async () => {
    const { data, status } = await api.inventory.levels.get({
      query: { warehouseId, productId },
      headers: userCookie,
    });
    expect(status).toBe(200);
    expect((data as { stock: number }).stock).toBe(0);
  });

  it("should return empty array for movements", async () => {
    const { data, status } = await api.inventory.movements.get({
      query: { warehouseId, productId },
      headers: userCookie,
    });
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect((data as unknown[]).length).toBe(0);
  });
});
