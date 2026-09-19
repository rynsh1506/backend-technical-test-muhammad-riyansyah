import { pgTable, serial, integer, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const testTableObject = pgTable(
  "test",
  {
    id: serial("id").primaryKey(),
    quantity: integer("quantity"),
  },
  (table) => ({
    chk: check("chk", sql`${table.quantity} > 0`),
  }),
);

export const testTableArray = pgTable(
  "test2",
  {
    id: serial("id").primaryKey(),
    quantity: integer("quantity"),
  },
  (table) => [check("chk", sql`${table.quantity} > 0`)],
);
