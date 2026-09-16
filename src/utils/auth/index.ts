import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { APP_CONFIG } from "../../config";

export const authSetup = (app: Elysia) =>
  app
    .use(
      jwt({
        name: "jwt",
        secret: APP_CONFIG.JWT.SECRET,
      })
    )
    .derive(({ jwt, cookie }) => {
      return {
        getCurrentUser: async () => {
          const authToken = cookie[APP_CONFIG.COOKIE.NAME];
          if (!authToken || !authToken.value) {
            return null;
          }

          const payload = await jwt.verify(authToken.value);
          if (!payload || !payload.id) {
            return null;
          }

          return payload as { id: number; role: string; username: string };
        },
      };
    });
