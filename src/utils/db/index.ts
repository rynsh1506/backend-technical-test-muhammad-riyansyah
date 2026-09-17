import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { APP_CONFIG } from "@/config";

const connectionString = APP_CONFIG.DB.URL;

/**
 * Disable prefetch — not supported in "Transaction" pool mode (e.g., PgBouncer).
 * Required when using Drizzle with a connection pooler.
 */
const queryClient = postgres(connectionString, { prepare: false });

export const db = drizzle(queryClient);
export { queryClient };
