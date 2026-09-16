import { describe, expect, it } from "bun:test";
import { app } from "../../../index"; // Import the main Elysia app

describe("Auth Module", () => {
  it("should fail login with non-existent username", async () => {
    const req = new Request("http://localhost/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "ghost", password: "123" }),
    });
    
    const res = await app.handle(req);
    expect(res.status).toBe(401);
    
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error.message).toBe("Invalid username or password");
  });

  it("should fail login with wrong password", async () => {
    // Note: 'staff_user' is created by our seeder
    const req = new Request("http://localhost/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "staff_user", password: "wrongpassword" }),
    });
    
    const res = await app.handle(req);
    expect(res.status).toBe(401);
  });

  it("should successfully login with correct credentials and return HttpOnly cookie", async () => {
    const req = new Request("http://localhost/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "staff_user", password: "password123" }), // Default seeder password
    });
    
    const res = await app.handle(req);
    expect(res.status).toBe(200);
    
    // Check if Set-Cookie header exists (HttpOnly JWT)
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("auth_token=");
    
    const body = await res.json();
    expect(body).toHaveProperty("message", "Login successful");
    expect(body.user).toHaveProperty("username", "staff_user");
  });
});
