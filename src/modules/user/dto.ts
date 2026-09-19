import { t } from "elysia";
import { createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { users } from "@/modules/user/entities/users.schema";
import { createPaginatedDto } from "@/utils/dto";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 */
export const selectUserSchema = createSelectSchema(users);
const userSelect = spread(users, "select");

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
