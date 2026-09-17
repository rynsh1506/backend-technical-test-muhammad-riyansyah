import { Elysia } from "elysia";

export const logger = new Elysia({ name: "logger" })
  .onRequest(({ request }) => {
    const url = new URL(request.url).pathname;
    console.log(`[${new Date().toISOString()}] ➡️ ${request.method} ${url}`);
  })
  .onAfterHandle(({ request, set }) => {
    const url = new URL(request.url).pathname;
    const status = set.status || 200;
    
    // Convert status to number if it's a string somehow
    const statusCode = typeof status === "number" ? status : 200;
    
    let icon = "✅";
    if (statusCode >= 400 && statusCode < 500) icon = "⚠️";
    if (statusCode >= 500) icon = "❌";

    console.log(`[${new Date().toISOString()}] ${icon} ${request.method} ${url} - Status: ${statusCode}`);
  })
  .onError(({ request, error }) => {
    const url = new URL(request.url).pathname;
    console.error(`[${new Date().toISOString()}] ❌ ERROR on ${request.method} ${url}:`, (error as Error).message || String(error));
  });
