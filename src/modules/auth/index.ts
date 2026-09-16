import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { eq } from "drizzle-orm";
import { db } from "../../utils/db";
import { users } from "./model";

// Define the JWT payload type
export const authSetup = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "default_secret",
    })
  )
  .derive(async ({ jwt, cookie: { auth_token }, set }) => {
    // Middleware to extract and verify the JWT from HttpOnly Cookie
    return {
      getCurrentUser: async () => {
        if (!auth_token.value) {
          return null;
        }

        const payload = await jwt.verify(auth_token.value);
        if (!payload || !payload.id) {
          return null;
        }

        return payload as { id: number; role: string; username: string };
      },
    };
  });

export const authController = new Elysia({ prefix: "/auth" })
  .use(authSetup)
  .post(
    "/login",
    async ({ body, jwt, cookie: { auth_token }, set }) => {
      const { username, password } = body;

      // Find user
      const userList = await db.select().from(users).where(eq(users.username, username)).limit(1);
      const user = userList[0];

      if (!user) {
        set.status = 401;
        return { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } };
      }

      // Verify password
      const isMatch = await Bun.password.verify(password, user.password);
      if (!isMatch) {
        set.status = 401;
        return { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } };
      }

      // Generate JWT
      const token = await jwt.sign({
        id: user.id,
        role: user.role,
        username: user.username,
      });

      // Set HttpOnly Cookie
      auth_token.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400, // 7 days
        path: "/",
        sameSite: "lax",
      });

      return {
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
      detail: { tags: ["Authentication"] },
    }
  )
  .post(
    "/logout",
    async ({ cookie: { auth_token } }) => {
      // Clear the cookie
      auth_token.remove();
      return { message: "Logout successful" };
    },
    {
      detail: { tags: ["Authentication"] },
    }
  )
  .get(
    "/me",
    async ({ getCurrentUser, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
      }

      return { user };
    },
    {
      detail: { tags: ["Authentication"] },
    }
  );
