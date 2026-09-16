import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { APP_CONFIG } from "../../config";

// Construct connection from centralized config
const connectionString = APP_CONFIG.DB.URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const queryClient = postgres(connectionString, { prepare: false });
export const db = drizzle(queryClient);
