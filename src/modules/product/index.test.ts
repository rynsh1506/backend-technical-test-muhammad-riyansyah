import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * End-to-end test suite for the Product module.
 */
describe("Product Module (Eden Treaty E2E Type-Safe)", () => {
  let validCookie: string = "";
  let createdProductId: number;

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
      const { status } = await api.products.get();
      expect(status).toBe(401);
    });

    it("should block creation with missing required fields", async () => {
      const payload = { name: "Incomplete Product" } as unknown as Parameters<
        typeof api.products.post
      >[0];
      const { status } = await api.products.post(payload, {
        headers: { cookie: validCookie },
      });
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("CRUD Operations", () => {
    it("should create a new product", async () => {
      const { status, data } = await api.products.post(
        {
          sku: `TEST-PRD-${Date.now()}`,
          name: "Test Product",
          unit: "PCS",
        },
        { headers: { cookie: validCookie } },
      );

      expect(status).toBe(200);
      expect(data).toHaveProperty("id");
      expect(data?.name).toBe("Test Product");

      if (data?.id) createdProductId = data.id;
    });

    it("should list all products including the newly created one", async () => {
      const { status, data } = await api.products.get({
        headers: { cookie: validCookie },
      });

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThan(0);
    });

    it("should retrieve a product by its ID", async () => {
      expect(createdProductId).toBeDefined();
      const { status, data } = await api
        .products({ id: createdProductId })
        .get({
          headers: { cookie: validCookie },
        });

      expect(status).toBe(200);
      expect(data?.id).toBe(createdProductId);
    });

    it("should update the existing product", async () => {
      expect(createdProductId).toBeDefined();
      const { status, data } = await api.products({ id: createdProductId }).put(
        {
          name: "Updated Test Product",
          isActive: false,
        },
        { headers: { cookie: validCookie } },
      );

      expect(status).toBe(200);
      expect(data?.name).toBe("Updated Test Product");
      expect(data?.isActive).toBe(false);
    });

    it("should return 404 for non-existent product", async () => {
      const { status } = await api.products({ id: 999999 }).get({
        headers: { cookie: validCookie },
      });
      expect(status).toBe(404);
    });
  });
});
