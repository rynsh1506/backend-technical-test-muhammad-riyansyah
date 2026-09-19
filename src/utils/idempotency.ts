import { db } from "@/utils/db";
import { idempotencyKeys } from "@/entities/audit.schema";
import { eq, and } from "drizzle-orm";
import { status } from "elysia";
import Elysia from "elysia";

export class IdempotencyService {
  /**
   * Check if the request with this Idempotency Key has already been successfully processed.
   * If yes, return the cached response (preventing duplicate processing).
   */
  static async check(userId: number, idempotencyKey: string | undefined) {
    if (!idempotencyKey) return;

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
      throw status(200, existing[0]!.response);
    }
  }

  /**
   * Store the successful response so it can be returned
   * if a duplicate request arrives in the future.
   */
  static async save(
    userId: number,
    idempotencyKey: string | undefined,
    requestPath: string,
    method: string,
    response: unknown,
  ) {
    if (!idempotencyKey) return;

    await db
      .insert(idempotencyKeys)
      .values({
        key: idempotencyKey,
        userId,
        path: requestPath,
        method,
        response,
      })
      .onConflictDoNothing();
  }
}

/** A very simple middleware to extract the key from headers so controllers can access it. */
export const idempotencyPlugin = new Elysia({
  name: "IdempotencyPlugin",
}).derive(({ headers }) => {
  return {
    idempotencyKey: headers["idempotency-key"],
  };
});
