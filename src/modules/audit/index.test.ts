import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "@/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

/**
 * End-to-end test suite for the Audit module.
 */
describe("Audit Module (Eden Treaty E2E Type-Safe)", () => {
  let userCookie: Record<string, string> = {};
  let approverCookie: Record<string, string> = {};

  beforeAll(async () => {
    const { response: userRes } = await api.auth.login.post({
      username: "staff_user",
      password: "password123",
    });
    const { response: approverRes } = await api.auth.login.post({
      username: "manager_approver",
      password: "password123",
    });

    const userCookieStr = userRes.headers.get("set-cookie") || "";
    const approverCookieStr = approverRes.headers.get("set-cookie") || "";
    userCookie = { Cookie: userCookieStr.split(";")[0]! };
    approverCookie = { Cookie: approverCookieStr.split(";")[0]! };
  });

  it("should prevent USER from accessing audit logs", async () => {
    const { status } = await api.audit.logs.get({ headers: userCookie });
    expect(status).toBe(403);
  });

  it("should allow APPROVER to access audit logs", async () => {
    const { data, status } = await api.audit.logs.get({
      headers: approverCookie,
    });
    expect(status).toBe(200);
    if (!data || typeof data !== "object" || !("data" in data)) {
      throw new Error("Invalid response format");
    }
    expect(Array.isArray(data.data)).toBe(true);
    expect(data).toHaveProperty("meta");
  });
});
