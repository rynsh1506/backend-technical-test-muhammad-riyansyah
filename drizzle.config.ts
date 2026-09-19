import { defineConfig } from "drizzle-kit";
import { APP_CONFIG } from "@/config";

export default defineConfig({
  schema: "./src/entities/*.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: APP_CONFIG.DB.URL,
  },
});
