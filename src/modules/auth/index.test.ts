import { describe, expect, it } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";
import { APP_CONFIG } from "@/config";

const api = treaty(app);

/**
 * End-to-end test suite for the Auth module.
 * Uses Eden Treaty for fully type-safe HTTP assertions against the live Elysia app instance.
 */
describe("Auth Module (Eden Treaty E2E Type-Safe)", () => {
  let validCookie: string | null = null;

  describe("Validation & Bad Requests", () => {
    it("should block login attempt with missing body", async () => {
      const payload1 = undefined as unknown as Parameters<
        typeof api.auth.login.post
      >[0];
      const { status } = await api.auth.login.post(payload1);
      expect(status).toBeGreaterThanOrEqual(400);
    });

    it("should block login attempt with incomplete payload (missing password)", async () => {
      const payload2 = { username: "staff_user" } as unknown as Parameters<
        typeof api.auth.login.post
      >[0];
      const { status } = await api.auth.login.post(payload2);
      expect(status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Database Rejections", () => {
    it("should fail login with non-existent username", async () => {
      const { status } = await api.auth.login.post({
        username: "ghost_user",
        password: "123",
      });
      expect(status).toBe(401);
    });

    it("should fail login with correct username but wrong password", async () => {
      const { status } = await api.auth.login.post({
        username: "staff_user",
        password: "wrongpassword",
      });
      expect(status).toBe(401);
    });
  });

  describe("Authentication Flow", () => {
    it("should successfully login with correct credentials and return HttpOnly cookie", async () => {
      const { status, response } = await api.auth.login.post({
        username: "staff_user",
        password: "password123",
      });
      expect(status).toBe(200);

      const setCookie = response?.headers.get("Set-Cookie");
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain(APP_CONFIG.COOKIE.NAME);

      if (setCookie) {
        validCookie = setCookie.split(";")[0] || null;
      }
    });
  });

  describe("Guard & Middleware Protections", () => {
    it("should block access to /me without any authentication cookie", async () => {
      const { status } = await api.auth.me.get();
      expect(status).toBe(401);
    });

    it("should block access to /me with a forged/fake JWT cookie", async () => {
      const { status } = await api.auth.me.get({
        headers: {
          cookie: `${APP_CONFIG.COOKIE.NAME}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_payload.fake_signature`,
        },
      });
      expect(status).toBe(401);
    });

    it("should successfully access /me with the valid cookie", async () => {
      expect(validCookie).toBeTruthy();

      const { status, data } = await api.auth.me.get({
        headers: { cookie: validCookie as string },
      });
      expect(status).toBe(200);
      expect(data?.user?.username).toBe("staff_user");
      expect(typeof data?.user?.role).toBe("string");
    });
  });

  describe("Logout & Session Clearing", () => {
    it("should safely process logout even if user is not logged in (idempotency)", async () => {
      const { status } = await api.auth.logout.post();
      expect(status).toBe(200);
    });

    it("should successfully logout and clear the cookie of a logged-in user", async () => {
      expect(validCookie).toBeTruthy();

      const { status, response } = await api.auth.logout.post(null, {
        headers: { cookie: validCookie as string },
      });
      expect(status).toBe(200);

      const setCookie = response?.headers.get("Set-Cookie");
      expect(String(setCookie)).toContain(`${APP_CONFIG.COOKIE.NAME}=`);
      expect(String(setCookie)).toContain("Max-Age=0");
    });
  });
});
