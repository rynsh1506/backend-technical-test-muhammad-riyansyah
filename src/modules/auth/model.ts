import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { t, type Static } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

// 1. Drizzle Database Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("staff"), // e.g., 'staff', 'approver', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Auto-Generate Base Elysia Schemas from Drizzle
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// 3. Compose Specific API Validation Models
export const AuthModel = {
  // Directly extract 'username' and 'password' requirements from the database schema!
  loginBody: t.Pick(insertUserSchema, ["username", "password"]),

  loginResponse: t.Object({
    message: t.String(),
    // Directly extract safe fields from the select schema to return to the user
    user: t.Pick(selectUserSchema, ["id", "username", "role"]),
  }),

  loginInvalid: t.Object({
    error: t.Object({
      code: t.String(),
      message: t.String(),
    }),
  }),
} as const;

// 4. TypeScript Type Extraction
export type AuthModelTypes = {
  loginBody: Static<typeof AuthModel.loginBody>;
};
