import { createSelectSchema } from "drizzle-typebox";
import { pgTable, jsonb } from "drizzle-orm/pg-core";
const t = pgTable("t", { c: jsonb("c") });
console.log(createSelectSchema(t));
