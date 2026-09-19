import { Elysia } from "elysia";
import { AuthService } from "@/modules/auth/service";
import { loginBodyDto, loginResponseDto, loginInvalidDto } from "@/modules/auth/dto";
import {
  authSetup,
  isAuthenticated,
  setAuthCookie,
  clearAuthCookie,
} from "@/utils/auth";

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
      body: loginBodyDto,
      response: {
        200: loginResponseDto,
        401: loginInvalidDto,
      },
      detail: {
        tags: ["Authentication"],
        summary: "User Login",
        description:
          "Authenticates a user using their username and password. Upon successful authentication, an HttpOnly cookie containing a JWT is set in the client's browser to maintain the session securely.",
      },
    },
  )
  .post(
    "/logout",
    ({ cookie }) => {
      clearAuthCookie(cookie);
      return { message: "Logout successful" };
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "User Logout",
        description:
          "Clears the authentication HttpOnly cookie, effectively ending the user's session. This operation is idempotent.",
      },
    },
  )
  .use(isAuthenticated)
  .get(
    "/me",
    ({ user }) => {
      return { user };
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "Get Current User",
        description:
          "Retrieves the profile information of the currently authenticated user based on the active JWT session cookie.",
      },
    },
  );
