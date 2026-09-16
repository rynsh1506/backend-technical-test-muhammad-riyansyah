import { Elysia } from "elysia";
import { openapi } from "@elysia/openapi";
import { cors } from "@elysiajs/cors";
import { APP_CONFIG } from "./src/config";
import { authController } from "./src/modules/auth";

export const app = new Elysia()
  .use(cors())
  .use(
    openapi({
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

// Only listen if this file is run directly (not imported by tests)
if (import.meta.main) {
  app.listen(APP_CONFIG.PORT, () => {
    console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
  });
}
