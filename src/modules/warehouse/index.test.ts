import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * End-to-end test suite for the Warehouse module.
 */
describe("Warehouse Module (Eden Treaty E2E Type-Safe)", () => {
  let validCookie: string = "";
  let createdWarehouseId: number;

  beforeAll(async () => {
    const { response } = await api.auth.login.post({
      username: "staff_user",
      password: "password123",
    });
    const setCookie = response?.headers.get("Set-Cookie");
    if (setCookie) {
      validCookie = setCookie.split(";")[0] ?? "";
    }
  });

  describe("Validation Protections", () => {
    it("should block unauthenticated access", async () => {
      const { status } = await api.warehouses.get();
      expect(status).toBe(401);
    });

    it("should block creation with missing required fields", async () => {
      const { status } = await api.warehouses.post(
        // @ts-expect-error intentionally missing fields
        { location: "Jakarta" },
        { headers: { cookie: validCookie } },
      );
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("CRUD Operations", () => {
    it("should create a new warehouse", async () => {
      const { status, data } = await api.warehouses.post(
        {
          code: `WH-TEST-${Date.now()}`.substring(0, 50),
          name: "Test Warehouse",
          location: "Bandung",
        },
        { headers: { cookie: validCookie } },
      );

      expect(status).toBe(200);
      expect(data).toHaveProperty("id");
      expect(data?.name).toBe("Test Warehouse");

      if (data?.id) createdWarehouseId = data.id;
    });

    it("should list all warehouses including the newly created one", async () => {
      const { status, data } = await api.warehouses.get({
        headers: { cookie: validCookie },
      });

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThan(0);
    });

    it("should retrieve a warehouse by its ID", async () => {
      expect(createdWarehouseId).toBeDefined();
      const { status, data } = await api
        .warehouses({ id: createdWarehouseId })
        .get({
          headers: { cookie: validCookie },
        });

      expect(status).toBe(200);
      expect(data?.id).toBe(createdWarehouseId);
    });

    it("should update the existing warehouse", async () => {
      expect(createdWarehouseId).toBeDefined();
      const { status, data } = await api
        .warehouses({ id: createdWarehouseId })
        .put(
          {
            name: "Updated Test Warehouse",
            isActive: false,
          },
          { headers: { cookie: validCookie } },
        );

      expect(status).toBe(200);
      expect(data?.name).toBe("Updated Test Warehouse");
      expect(data?.isActive).toBe(false);
    });

    it("should return 404 for non-existent warehouse", async () => {
      const { status } = await api.warehouses({ id: 999999 }).get({
        headers: { cookie: validCookie },
      });
      expect(status).toBe(404);
    });
  });
});
