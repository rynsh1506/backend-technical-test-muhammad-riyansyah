import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

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

export const warehouseCreateDto = t.Omit(insertWarehouseSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);
export const warehouseUpdateDto = t.Partial(
  t.Omit(insertWarehouseSchema, ["id", "code", "createdAt", "updatedAt"]),
);
export const warehouseResponseDto = selectWarehouseSchema;
export const warehouseListResponseDto = t.Object({
  data: t.Array(selectWarehouseSchema),
  meta: t.Object({
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
    totalRecords: t.Number(),
  }),
});
