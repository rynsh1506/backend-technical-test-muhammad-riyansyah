import { Elysia } from "elysia";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { authSetup, isAuthenticated } from "../../utils/auth";
import { APP_CONFIG } from "../../config";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authSetup)
  .post(
    "/login",
    async ({ body, jwt, cookie }) => {
      const user = await AuthService.login(body);

      const token = await jwt.sign({
        id: user.id,
        role: user.role,
        username: user.username,
      });

      const authToken = cookie[APP_CONFIG.COOKIE.NAME];
      authToken!.set({
        value: token,
        httpOnly: APP_CONFIG.COOKIE.HTTP_ONLY,
        maxAge: APP_CONFIG.COOKIE.MAX_AGE,
        path: APP_CONFIG.COOKIE.PATH,
        sameSite: APP_CONFIG.COOKIE.SAME_SITE,
      });

      return { message: "Login successful", user };
    },
    {
      body: AuthModel.loginBody,
      response: {
        200: AuthModel.loginResponse,
        401: AuthModel.loginInvalid,
      },
      detail: { tags: ["Authentication"] },
    }
  )
  .post(
    "/logout",
    ({ cookie }) => {
      const authToken = cookie[APP_CONFIG.COOKIE.NAME];
      if (authToken) {
        authToken.remove();
      }
      return { message: "Logout successful" };
    },
    {
      detail: { tags: ["Authentication"] },
    }
  )
  // === PRIVATE ROUTES START HERE ===
  // Any route defined below .use(isAuthenticated) will be protected automatically!
  .use(isAuthenticated)
  .get(
    "/me",
    ({ user }) => {
      // The `user` is injected by the middleware. It is guaranteed to be valid and non-null!
      return { user };
    },
    {
      detail: { tags: ["Authentication"] },
    }
  );
