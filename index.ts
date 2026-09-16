import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { authController } from "./src/modules/auth";

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: "Inventory Procurement API",
        version: "1.0.0"
      }
    }
  }))
  .use(authController)
  .get("/", () => "Inventory Procurement API is running!")
  .listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
