import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

export const app = new Elysia()
  .use(swagger())
  .get("/", () => "Inventory Procurement API is running!")
  .listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
