import { t } from "elysia";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const schema = createInsertSchema(users);
console.log(schema);
