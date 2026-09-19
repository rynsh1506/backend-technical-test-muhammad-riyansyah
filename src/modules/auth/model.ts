import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

export const roleEnum = pgEnum("role", ["USER", "APPROVER"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const loginBodyDto = t.Pick(insertUserSchema, ["username", "password"]);
export const loginResponseDto = t.Object({
  message: t.String(),
  user: t.Pick(selectUserSchema, ["id", "username", "role"]),
});
export const loginInvalidDto = t.Object({
  error: t.Object({ code: t.String(), message: t.String() }),
});
