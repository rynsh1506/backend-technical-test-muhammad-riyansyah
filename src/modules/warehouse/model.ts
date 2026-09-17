import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWarehouseSchema = createInsertSchema(warehouses);
export const selectWarehouseSchema = createSelectSchema(warehouses);

export const WarehouseModel = {
  create: t.Omit(insertWarehouseSchema, ["id", "createdAt", "updatedAt"]),
  update: t.Partial(
    t.Omit(insertWarehouseSchema, ["id", "code", "createdAt", "updatedAt"]),
  ),
  response: selectWarehouseSchema,
  listResponse: t.Array(selectWarehouseSchema),
} as const;

export type WarehouseModelTypes = {
  create: Static<typeof WarehouseModel.create>;
  update: Static<typeof WarehouseModel.update>;
};
