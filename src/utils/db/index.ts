import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const queryClient = postgres(connectionString, { prepare: false });
export const db = drizzle(queryClient);
