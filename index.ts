import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { APP_CONFIG } from "./src/config";
import { authController } from "./src/modules/auth";

export const app = new Elysia()
  .use(cors()) // Enable CORS for frontend integration
  .use(
    swagger({
      documentation: {
        info: {
          title: "Backend Technical Test API",
          version: "1.0.0",
          description: "API Documentation for Master Data and Purchase Request System",
        },
      },
    })
  )
  .use(authController);

app.listen(APP_CONFIG.PORT, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
});
