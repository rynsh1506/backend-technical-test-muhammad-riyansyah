import { eq } from "drizzle-orm";
import type { Cookie } from "elysia";
import { db } from "../../utils/db";
import { users } from "./model";
import { APP_CONFIG } from "../../config";
import type { Static } from "elysia";
import { t } from "elysia";

export const LoginSchema = t.Object({
  username: t.String(),
  password: t.String(),
});

type LoginBody = Static<typeof LoginSchema>;

type AllowClaimValue = string | number | boolean | null;

export interface JwtPlugin {
  // Only define what the service actually uses from the JWT plugin!
  sign: (payload: Record<string, AllowClaimValue>) => Promise<string>;
}

export async function loginService(
  body: LoginBody,
  jwt: JwtPlugin,
  cookie: Record<string, Cookie<unknown> | undefined>,
  set: { status?: number | string }
) {
  const authToken = cookie[APP_CONFIG.COOKIE.NAME];

  if (!authToken) {
    set.status = 500;
    return { error: { code: "INTERNAL_ERROR", message: "Cookie system is missing" } };
  }

  const userList = await db.select().from(users).where(eq(users.username, body.username)).limit(1);
  const user = userList[0];

  if (!user) {
    set.status = 401;
    return { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } };
  }

  const isMatch = await Bun.password.verify(body.password, user.password);
  if (!isMatch) {
    set.status = 401;
    return { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } };
  }

  const token = await jwt.sign({
    id: user.id,
    role: user.role,
    username: user.username,
  });

  authToken.set({
    value: token,
    httpOnly: APP_CONFIG.COOKIE.HTTP_ONLY,
    maxAge: APP_CONFIG.COOKIE.MAX_AGE,
    path: APP_CONFIG.COOKIE.PATH,
    sameSite: APP_CONFIG.COOKIE.SAME_SITE,
  });

  return {
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}

export async function logoutService(cookie: Record<string, Cookie<unknown> | undefined>) {
  const authToken = cookie[APP_CONFIG.COOKIE.NAME];
  if (authToken) {
    authToken.remove();
  }
  return { message: "Logout successful" };
}

export async function getMeService(
  user: { id: number; role: string; username: string } | null,
  set: { status?: number | string }
) {
  if (!user) {
    set.status = 401;
    return { error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  return { user };
}
