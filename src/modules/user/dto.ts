import { t } from "elysia";
import { createSelectSchema } from "drizzle-typebox";
import { users } from "@/modules/auth/entities/users.schema";
import { createPaginatedDto } from "@/utils/dto";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 */
export const selectUserSchema = createSelectSchema(users, {
  passwordHash: t.Optional(t.String()),
});

/**
 * ==========================================
 * API DTOs (Elysia TypeBox)
 * ==========================================
 */
// Omit sensitive data like password hash from API responses
export const userResponseDto = t.Omit(selectUserSchema, ["passwordHash"]);
export const userListResponseDto = createPaginatedDto(userResponseDto);
