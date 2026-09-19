import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { users } from "@/modules/user/entities/users.schema";
import { createPaginatedDto } from "@/utils/dto";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const userInsert = spread(users, "insert");
export const userSelect = spread(users, "select");

/**
 * ==========================================
 * API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 * Explicitly excluding the 'password' field.
 */
export const userResponseDto = t.Object({
  id: userSelect.id,
  username: userSelect.username,
  role: userSelect.role,
  createdAt: userSelect.createdAt,
  updatedAt: userSelect.updatedAt,
});

export const userListResponseDto = createPaginatedDto(userResponseDto);
