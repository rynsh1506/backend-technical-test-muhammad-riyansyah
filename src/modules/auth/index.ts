import { Elysia, t } from "elysia";
import { authSetup } from "../../utils/auth";
import { loginHandler, logoutHandler, getMeHandler } from "./service";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authSetup)
  .post("/login", loginHandler, {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    detail: { tags: ["Authentication"] },
  })
  .post("/logout", logoutHandler, {
    detail: { tags: ["Authentication"] },
  })
  .get("/me", getMeHandler, {
    detail: { tags: ["Authentication"] },
  });
