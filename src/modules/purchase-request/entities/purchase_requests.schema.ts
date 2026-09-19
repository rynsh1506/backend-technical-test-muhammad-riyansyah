import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  timestamp,
  integer,
  boolean,
  unique,
  check,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "@/modules/auth/entities/users.schema";
import { warehouses } from "@/modules/warehouse/entities/warehouses.schema";

export const purchaseRequestStatusEnum = pgEnum("purchase_request_status", [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
]);

export const purchaseRequests = pgTable("purchase_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),
  warehouseId: integer("warehouse_id")
    .references(() => warehouses.id)
    .notNull(),
  requestedBy: integer("requested_by")
    .references(() => users.id)
    .notNull(),
  status: purchaseRequestStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
