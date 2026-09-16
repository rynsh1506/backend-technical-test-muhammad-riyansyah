import { app } from "./index";

async function run() {
  try {
    const req = new Request("http://localhost/auth/me", { method: "GET" });
    const res = await app.handle(req);
    console.log("STATUS:", res.status);
    console.log("BODY:", await res.text());
  } catch (e) {
    console.error("CRASH:", e);
  }
}
run();
