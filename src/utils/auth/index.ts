import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authSetup = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "default_secret",
    })
  )
  .derive(async ({ jwt, cookie: { auth_token } }) => {
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
