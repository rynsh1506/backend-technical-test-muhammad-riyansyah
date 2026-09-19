import { pgTable, pgEnum, serial, varchar, timestamp, integer, boolean, unique, check, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { purchaseRequests } from "@/modules/purchase-request/entities/purchase_requests.schema";
import { suppliers } from "@/modules/supplier/entities/suppliers.schema";

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "DRAFT",
  "ORDERED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
]);

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: varchar("po_number", { length: 50 }).notNull().unique(),
  purchaseRequestId: integer("purchase_request_id")
    .notNull()
    .references(() => purchaseRequests.id, { onDelete: "restrict" })
    .unique(),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "restrict" }),
  status: purchaseOrderStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
