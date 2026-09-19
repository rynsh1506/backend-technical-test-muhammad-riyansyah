import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";
import { APP_CONFIG } from "@/config";

const api = treaty(app);

/**
 * ==========================================
 * User Module Tests
 * ==========================================
 * Verifies fetching users by ID and listing users.
 */
describe("User Module (Eden Treaty E2E)", () => {
  let validCookie: string | null = null;
  let loggedInUserId: string = "";

  beforeAll(async () => {
    // Login to get auth cookie and user ID
    const { status, response, data } = await api.auth.login.post({
      username: "staff_user",
      password: "password123",
    });

    if (status !== 200) {
      throw new Error(
        `Failed to login for User Module tests. Status: ${status}`,
      );
    }

    const setCookie = response?.headers.get("Set-Cookie");
    if (setCookie) {
      validCookie = setCookie.split(";")[0] || null;
    }

    if (data?.user?.id) {
      loggedInUserId = data.user.id;
    }
  });

  describe("GET /users", () => {
    it("should reject unauthorized access", async () => {
      const { status } = await api.users.get();
      expect(status).toBe(401);
    });

    it("should return a paginated list of users", async () => {
      expect(validCookie).toBeTruthy();
      const { status, data, error } = await api.users.get({
        headers: { cookie: validCookie as string },
      });

      expect(status).toBe(200);
      expect(data).toBeDefined();
      expect(data?.data).toBeInstanceOf(Array);
      expect(data?.meta?.totalRecords).toBeGreaterThan(0);
      // Ensure passwordHash is omitted
      expect(data?.data[0]).not.toHaveProperty("passwordHash");
    });

    it("should filter users by search query", async () => {
      expect(validCookie).toBeTruthy();
      const { status, data, error } = await api.users.get({
        query: { search: "staff" },
        headers: { cookie: validCookie as string },
      });

      expect(status).toBe(200);
      expect(data?.data?.length).toBeGreaterThan(0);
      expect(data?.data[0].username.toLowerCase()).toContain("staff");
    });
  });

  describe("GET /users/:id", () => {
    it("should return a user by ID", async () => {
      expect(validCookie).toBeTruthy();
      expect(loggedInUserId).toBeTruthy();
      const { status, data } = await api.users({ id: loggedInUserId }).get({
        headers: { cookie: validCookie as string },
      });

      expect(status).toBe(200);
      expect(data?.id).toBe(loggedInUserId);
      expect(data?.username).toBe("staff_user");
      expect(data).not.toHaveProperty("passwordHash");
    });

    it("should return 404 for non-existent user", async () => {
      expect(validCookie).toBeTruthy();
      const { status, error } = await api
        .users({ id: "nonexistentcuid2string" })
        .get({
          headers: { cookie: validCookie as string },
        });

      expect(status).toBe(404);
      expect((error?.value as any)?.error?.code).toBe("NOT_FOUND");
    });
  });
});
