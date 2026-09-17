import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";

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

export const AuthModel = {
  loginBody: t.Pick(insertUserSchema, ["username", "password"]),
  loginResponse: t.Object({
    message: t.String(),
    user: t.Pick(selectUserSchema, ["id", "username", "role"]),
  }),
  loginInvalid: t.Object({
    error: t.Object({ code: t.String(), message: t.String() }),
  }),
};

export type AuthModelTypes = {
  loginBody: Static<typeof AuthModel.loginBody>;
};
