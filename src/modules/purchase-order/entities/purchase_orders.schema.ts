import { createId } from "@paralleldrive/cuid2";
import { pgTable, pgEnum, varchar, timestamp } from "drizzle-orm/pg-core";
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
  id: varchar("id", { length: 24 })
    .$defaultFn(() => createId())
    .primaryKey(),
  poNumber: varchar("po_number", { length: 50 }).notNull().unique(),
  purchaseRequestId: varchar("purchase_request_id", { length: 24 })
    .notNull()
    .references(() => purchaseRequests.id, { onDelete: "restrict" })
    .unique(),
  supplierId: varchar("supplier_id", { length: 24 })
    .notNull()
    .references(() => suppliers.id, { onDelete: "restrict" }),
  status: purchaseOrderStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
