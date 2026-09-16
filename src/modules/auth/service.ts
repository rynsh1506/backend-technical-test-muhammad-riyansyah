import { eq } from "drizzle-orm";
import { db } from "../../utils/db";
import { users } from "./model";
import { APP_CONFIG } from "../../config";

export async function loginHandler(context: any) {
  const { body, jwt, cookie, set } = context;
  const authToken = cookie[APP_CONFIG.COOKIE.NAME];

  // 1. Find user by username
  const userList = await db.select().from(users).where(eq(users.username, body.username)).limit(1);
  const user = userList[0];

  if (!user) {
    set.status = 401;
    return { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } };
  }

  // 2. Verify password
  const isMatch = await Bun.password.verify(body.password, user.password);
  if (!isMatch) {
    set.status = 401;
    return { error: { code: "UNAUTHORIZED", message: "Invalid username or password" } };
  }

  // 3. Generate JWT
  const token = await jwt.sign({
    id: user.id,
    role: user.role,
    username: user.username,
  });

  // 4. Set Secure Cookie from Config
  authToken.set({
    value: token,
    httpOnly: APP_CONFIG.COOKIE.HTTP_ONLY,
    maxAge: APP_CONFIG.COOKIE.MAX_AGE,
    path: APP_CONFIG.COOKIE.PATH,
    sameSite: APP_CONFIG.COOKIE.SAME_SITE,
  });

  return {
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}

export async function logoutHandler(context: any) {
  context.cookie[APP_CONFIG.COOKIE.NAME].remove();
  return { message: "Logout successful" };
}

export async function getMeHandler(context: any) {
  const user = await context.getCurrentUser();
  if (!user) {
    context.set.status = 401;
    return { error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  return { user };
}
