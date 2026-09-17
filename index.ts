import { app } from "@/app";
import { APP_CONFIG } from "@/config";

app.listen(APP_CONFIG.PORT, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  );
});
