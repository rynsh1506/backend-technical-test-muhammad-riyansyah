import { createId } from "@paralleldrive/cuid2";
import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const warehouses = pgTable("warehouses", {
  id: varchar("id", { length: 24 })
    .$defaultFn(() => createId())
    .primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
