import Elysia from "elysia";
import type { Cookie } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { status } from "elysia";
import { APP_CONFIG } from "@/config";

export const authSetup = (app: Elysia) =>
  app.use(
    jwt({
      name: "jwt",
      secret: APP_CONFIG.JWT.SECRET,
    }),
  );

export const isAuthenticated = (app: Elysia) =>
  app.use(authSetup).resolve(async ({ cookie, jwt }) => {
    const authToken = cookie[APP_CONFIG.COOKIE.NAME];

    if (!authToken || !authToken.value) {
      throw status(401, {
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
    }

    const payload = await jwt.verify(authToken.value as string);
    if (!payload || !payload.id) {
      throw status(401, {
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
    }

    return {
      user: payload as { id: number; role: string; username: string },
    };
  });

export const setAuthCookie = (
  cookie: Record<string, Cookie<unknown> | undefined>,
  token: string,
) => {
  const authToken = cookie[APP_CONFIG.COOKIE.NAME];
  authToken!.set({
    value: token,
    httpOnly: APP_CONFIG.COOKIE.HTTP_ONLY,
    maxAge: APP_CONFIG.COOKIE.MAX_AGE,
    path: APP_CONFIG.COOKIE.PATH,
    sameSite: APP_CONFIG.COOKIE.SAME_SITE,
  });
};

export const clearAuthCookie = (
  cookie: Record<string, Cookie<unknown> | undefined>,
) => {
  const authToken = cookie[APP_CONFIG.COOKIE.NAME];
  if (authToken) {
    authToken.remove();
  }
};
