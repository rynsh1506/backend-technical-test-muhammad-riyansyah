import { Elysia, t } from "elysia";
import { validateUserCredentials } from "./service";
import { authSetup } from "../../utils/auth";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authSetup)
  .post(
    "/login",
    async ({ body, jwt, cookie: { auth_token }, set }) => {
      const user = await validateUserCredentials(body.username, body.password);

      if (!user) {
        set.status = 401;
        return { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } };
      }

      const token = await jwt.sign({
        id: user.id,
        role: user.role,
        username: user.username,
      });

      auth_token.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
        sameSite: "lax",
      });

      return { message: "Login successful", user };
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
