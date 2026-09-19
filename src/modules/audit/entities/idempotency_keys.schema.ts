import {
  pgTable,
  varchar,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const idempotencyKeys = pgTable("idempotency_keys", {
  key: varchar("key", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  response: jsonb("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
