import { createId } from "@paralleldrive/cuid2";
import { pgTable, pgEnum, varchar, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "APPROVER"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 24 })
    .$defaultFn(() => createId())
    .primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
