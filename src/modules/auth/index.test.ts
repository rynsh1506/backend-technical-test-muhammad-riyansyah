import { describe, expect, it } from "bun:test";
import { app } from "../../../index";
import { APP_CONFIG } from "../../config";

const BASE = APP_CONFIG.BASE_URL;

describe("Auth Module (Full Coverage)", () => {
  let validCookie: string | null = null;

  it("should fail login with non-existent username", async () => {
    const req = new Request(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "ghost", password: "123" }),
    });
    
    const res = await app.handle(req);
    expect(res.status).toBe(401);
  });

  it("should fail login with wrong password", async () => {
    const req = new Request(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "staff_user", password: "wrongpassword" }),
    });
    
    const res = await app.handle(req);
    expect(res.status).toBe(401);
  });

  it("should fail to access /me without authentication cookie", async () => {
    const req = new Request(`${BASE}/auth/me`, { method: "GET" });
    const res = await app.handle(req);
    expect(res.status).toBe(401);
  });

  it("should successfully login with correct credentials and return HttpOnly cookie", async () => {
    const req = new Request(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "staff_user", password: "password123" }),
    });
    
    const res = await app.handle(req);
    expect(res.status).toBe(200);
    
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("HttpOnly");
    
    if (setCookie) {
      validCookie = setCookie.split(";")[0];
    }
  });

  it("should successfully access /me with the valid cookie", async () => {
    expect(validCookie).toBeTruthy();

    const req = new Request(`${BASE}/auth/me`, {
      method: "GET",
      headers: {
        "Cookie": validCookie as string,
      },
    });
    
    const res = await app.handle(req);
    expect(res.status).toBe(200);
    
    const body = await res.json();
    expect(body.user.username).toBe("staff_user");
  });

  it("should successfully logout and clear the cookie", async () => {
    expect(validCookie).toBeTruthy();

    const req = new Request(`${BASE}/auth/logout`, {
      method: "POST",
      headers: {
        "Cookie": validCookie as string,
      },
    });
    
    const res = await app.handle(req);
    expect(res.status).toBe(200);
    
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toContain(`${APP_CONFIG.COOKIE.NAME}=`);
    expect(setCookie).toContain("Max-Age=0");
  });
});
