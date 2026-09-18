import { treaty } from "@elysiajs/eden";
import { app } from "./src/app";

const api = treaty(app);

async function run() {
  const userRes = await api.auth.login.post({
    username: "staff_user",
    password: "password123",
  });
  const userCookieStr = userRes.response?.headers.get("Set-Cookie")?.split(";")[0];
  const userCookie = { Cookie: userCookieStr };

  const res = await api["purchase-orders"]["3"].order.post({}, { headers: userCookie });
  console.log("Status:", res.status);
  console.log("Error:", res.error);
  process.exit(0);
}
run();
