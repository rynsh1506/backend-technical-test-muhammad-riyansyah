import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * End-to-end test suite for the Supplier module.
 */
describe("Supplier Module (Eden Treaty E2E Type-Safe)", () => {
  let validCookie: string = "";
  let createdSupplierId: string;

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
      const { status } = await api.suppliers.get();
      expect(status).toBe(401);
    });

    it("should block creation with missing required fields", async () => {
      const payload = { email: "test@example.com" } as unknown as Parameters<
        typeof api.suppliers.post
      >[0];
      const { status } = await api.suppliers.post(payload, {
        headers: { cookie: validCookie },
      });
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("CRUD Operations", () => {
    it("should create a new supplier", async () => {
      const { status, data } = await api.suppliers.post(
        {
          name: `PT Supplier Test ${Date.now()}`,
          email: "test@supplier.com",
          phone: "08123456789",
        },
        { headers: { cookie: validCookie } },
      );

      expect(status).toBe(200);
      expect(data).toHaveProperty("id");
      expect(data?.email).toBe("test@supplier.com");

      if (data?.id) createdSupplierId = data.id;
    });

    it("should list all suppliers including the newly created one", async () => {
      const { status, data } = await api.suppliers.get({
        headers: { cookie: validCookie },
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("meta");
      expect(Array.isArray(data?.data)).toBe(true);
      expect(data?.data.length).toBeGreaterThan(0);
    });

    it("should retrieve a supplier by its ID", async () => {
      expect(createdSupplierId).toBeDefined();
      const { status, data } = await api
        .suppliers({ id: createdSupplierId })
        .get({
          headers: { cookie: validCookie },
        });

      expect(status).toBe(200);
      expect(data?.id).toBe(createdSupplierId);
    });

    it("should update the existing supplier", async () => {
      expect(createdSupplierId).toBeDefined();
      const { status, data } = await api
        .suppliers({ id: createdSupplierId })
        .put(
          {
            name: "Updated Supplier Name",
            isActive: false,
          },
          { headers: { cookie: validCookie } },
        );

      expect(status).toBe(200);
      expect(data?.name).toBe("Updated Supplier Name");
      expect(data?.isActive).toBe(false);
    });

    it("should return 404 for non-existent supplier", async () => {
      const { status } = await api.suppliers({ id: "999999" }).get({
        headers: { cookie: validCookie },
      });
      expect(status).toBe(404);
    });
  });
});
