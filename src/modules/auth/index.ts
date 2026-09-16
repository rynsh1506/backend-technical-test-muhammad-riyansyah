import { Elysia } from "elysia";
import { loginService, logoutService, getMeService, LoginSchema } from "./service";
import { authSetup } from "../../utils/auth";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authSetup)
  .post(
    "/login",
    ({ body, jwt, cookie, set }) => loginService(body, jwt, cookie, set),
    {
      body: LoginSchema,
      detail: { tags: ["Authentication"] },
    }
  )
  .post(
    "/logout",
    ({ cookie }) => logoutService(cookie),
    {
      detail: { tags: ["Authentication"] },
    }
  )
  .get(
    "/me",
    async ({ getCurrentUser, set }) => getMeService(await getCurrentUser(), set),
    {
      detail: { tags: ["Authentication"] },
    }
  );
