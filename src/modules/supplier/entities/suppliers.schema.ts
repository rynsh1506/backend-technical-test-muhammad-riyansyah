import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const suppliers = pgTable("suppliers", {
  id: varchar("id", { length: 24 }).$defaultFn(() => createId()).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
