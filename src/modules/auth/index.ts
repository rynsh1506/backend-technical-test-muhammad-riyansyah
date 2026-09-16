import { Elysia } from "elysia";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { authSetup, isAuthenticated, setAuthCookie, clearAuthCookie } from "../../utils/auth";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authSetup)
  .post(
    "/login",
    async ({ body, jwt, cookie }) => {
      const user = await AuthService.login(body);
      const token = await jwt.sign(user);
      
      setAuthCookie(cookie, token);

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
      clearAuthCookie(cookie);
      return { message: "Logout successful" };
    },
    {
      detail: { tags: ["Authentication"] },
    }
  )
  // === PRIVATE ROUTES START HERE ===
  .use(isAuthenticated)
  .get(
    "/me",
    ({ user }) => {
      return { user };
    },
    {
      detail: { tags: ["Authentication"] },
    }
  );
