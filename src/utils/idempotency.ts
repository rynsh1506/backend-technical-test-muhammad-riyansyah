import { db } from "@/utils/db";
import { idempotencyKeys } from "@/modules/audit/model";
import { eq, and } from "drizzle-orm";
import { status } from "elysia";
import Elysia from "elysia";

export class IdempotencyService {
  /**
   * Cek apakah request dengan Idempotency Key ini sudah pernah berhasil diproses.
   * Jika sudah, kembalikan response lama (mencegah proses ulang).
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
   * Simpan response dari request yang berhasil diproses agar bisa dipakai
   * jika ada request duplikat di masa depan.
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

// Kita buat middleware super simpel agar controller bisa mengambil key dari header
export const idempotencyPlugin = new Elysia({
  name: "IdempotencyPlugin",
}).derive(({ headers }) => {
  return {
    idempotencyKey: headers["idempotency-key"],
  };
});
