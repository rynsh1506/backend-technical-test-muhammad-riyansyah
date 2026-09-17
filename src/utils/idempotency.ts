import Elysia from "elysia";
import { db } from "@/utils/db";
import { idempotencyKeys } from "@/modules/audit/model";
import { eq, and } from "drizzle-orm";
import { status } from "elysia";

export const idempotencyPlugin = (app: Elysia) =>
  app.resolve(async ({ request, headers }) => {
    const idempotencyKey = headers["idempotency-key"];
    if (!idempotencyKey) {
      return { checkIdempotency: undefined };
    }

    // We provide a hook to verify if a key was already used,
    // or to record it once processing is done.
    return {
      idempotencyKey,
      checkIdempotency: async (
        userId: number,
        requestPath: string,
        method: string,
      ) => {
        const existing = await db
          .select()
          .from(idempotencyKeys)
          .where(
            and(
              eq(idempotencyKeys.key, idempotencyKey),
              eq(idempotencyKeys.userId, userId),
            ),
          );

        if (existing.length > 0) {
          // It was already processed, return the cached response
          throw status(200, existing[0].response);
        }
      },
      saveIdempotency: async (
        userId: number,
        requestPath: string,
        method: string,
        response: any,
      ) => {
        await db
          .insert(idempotencyKeys)
          .values({
            key: idempotencyKey,
            userId,
            path: requestPath,
            method,
            response,
          })
          .onConflictDoNothing(); // Prevent race conditions
      },
    };
  });
