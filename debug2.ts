import { app } from "./index";

async function run() {
  const req = new Request("http://localhost/auth/me", { method: "GET" });
  const res = await app.handle(req);
  console.log("STATUS:", res.status);
  console.log("BODY:", await res.text());
}
run();
