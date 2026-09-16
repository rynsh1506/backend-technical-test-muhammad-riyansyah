import { Elysia, t } from "elysia";
import { loginHandler, logoutHandler, getMeHandler } from "./service";
import { authSetup } from "../../utils/auth";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authSetup)
  .post(
    "/login",
    (ctx) => loginHandler(ctx as unknown as Parameters<typeof loginHandler>[0]),
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
    (ctx) => logoutHandler(ctx as unknown as Parameters<typeof logoutHandler>[0]),
    {
      detail: { tags: ["Authentication"] },
    }
  )
  .get(
    "/me",
    (ctx) => getMeHandler(ctx as unknown as Parameters<typeof getMeHandler>[0]),
    {
      detail: { tags: ["Authentication"] },
    }
  );
