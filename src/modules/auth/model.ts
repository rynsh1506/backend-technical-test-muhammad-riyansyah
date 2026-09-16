import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { t, type Static } from "elysia";

// 1. Drizzle Database Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("staff"), // e.g., 'staff', 'approver', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Elysia Request/Response Validation Schema
export const AuthModel = {
  loginBody: t.Object({
    username: t.String(),
    password: t.String(),
  }),
  loginResponse: t.Object({
    message: t.String(),
    user: t.Object({
      id: t.Number(),
      username: t.String(),
      role: t.String(),
    }),
  }),
  loginInvalid: t.Object({
    error: t.Object({
      code: t.String(),
      message: t.String(),
    }),
  }),
} as const;

// 3. TypeScript Type Extraction
export type AuthModelTypes = {
  loginBody: Static<typeof AuthModel.loginBody>;
};
