import { t } from "elysia";

import { userInsert, userSelect } from "@/modules/user/dto";

/**
 * ==========================================
 * API DTOs (Elysia TypeBox)
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
