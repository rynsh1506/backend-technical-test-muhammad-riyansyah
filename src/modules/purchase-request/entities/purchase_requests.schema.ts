import { createId } from "@paralleldrive/cuid2";
import { pgTable, pgEnum, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/entities/users.schema";
import { warehouses } from "@/modules/warehouse/entities/warehouses.schema";

export const purchaseRequestStatusEnum = pgEnum("purchase_request_status", [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
]);

export const purchaseRequests = pgTable("purchase_requests", {
  id: varchar("id", { length: 24 })
    .$defaultFn(() => createId())
    .primaryKey(),
  requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),
  warehouseId: varchar("warehouse_id", { length: 24 })
    .references(() => warehouses.id)
    .notNull(),
  requestedBy: varchar("requested_by", { length: 24 })
    .references(() => users.id)
    .notNull(),
  status: purchaseRequestStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
