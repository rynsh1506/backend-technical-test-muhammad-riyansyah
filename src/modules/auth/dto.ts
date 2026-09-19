import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { users } from "./entities/users.schema";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

const userInsert = spread(users, "insert");
const userSelect = spread(users, "select");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const loginBodyDto = t.Object({
  username: userInsert.username,
  password: userInsert.password,
});

export const loginResponseDto = t.Object({
  message: t.String(),
  user: t.Object({
    id: userSelect.id,
    username: userSelect.username,
    role: userSelect.role,
  }),
});

export const loginInvalidDto = t.Object({
  error: t.Object({ code: t.String(), message: t.String() }),
});
