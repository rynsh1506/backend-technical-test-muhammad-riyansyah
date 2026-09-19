import { t } from "elysia";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
});

const schema = createInsertSchema(users, {
  name: t.String({ minLength: 3 }),
});
console.log(schema);
