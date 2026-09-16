import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { status } from "elysia";
import { APP_CONFIG } from "../../config";

export const authSetup = (app: Elysia) =>
  app.use(
    jwt({
      name: "jwt",
      secret: APP_CONFIG.JWT.SECRET,
    })
  );

export const isAuthenticated = (app: Elysia) =>
  app
    .use(authSetup)
    .resolve(async ({ cookie, jwt }) => {
      const authToken = cookie[APP_CONFIG.COOKIE.NAME];

      if (!authToken || !authToken.value) {
        throw status(401, { error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
      }

      const payload = await jwt.verify(authToken.value as string);
      if (!payload || !payload.id) {
        throw status(401, { error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
      }

      return {
        user: payload as { id: number; role: string; username: string },
      };
    });
