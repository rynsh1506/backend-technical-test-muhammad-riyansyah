import { db } from "@/utils/db";
import { sql, desc } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";

/**
 * Generates a unique document number in the format PREFIX-YYYY-XXXXXX.
 * Automatically finds the latest sequence for the current year and increments it.
 *
 * @param table - The Drizzle ORM table object.
 * @param column - The Drizzle ORM column object to check.
 * @param prefix - The document prefix (e.g., "PR", "PO", "GR").
 * @returns The generated document number as a string.
 */
export async function generateDocumentNumber(
  table: PgTable,
  column: AnyPgColumn,
  prefix: string,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefixPattern = `${prefix}-${year}-%`;

  const latest = await db
    .select({ docNumber: column })
    .from(table)
    .where(sql`${column} LIKE ${prefixPattern}`)
    .orderBy(desc(column))
    .limit(1);

  let sequence = 1;
  if (latest.length > 0) {
    const lastNum = parseInt(
      (latest[0]!.docNumber as string).split("-")[2] ?? "0",
      10,
    );
    if (!isNaN(lastNum)) {
      sequence = lastNum + 1;
    }
  }

  const paddedSequence = sequence.toString().padStart(6, "0");
  return `${prefix}-${year}-${paddedSequence}`;
}
