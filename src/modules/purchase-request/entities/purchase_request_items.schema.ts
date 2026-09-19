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
import { products } from "@/modules/product/entities/products.schema";
import { purchaseRequests } from "@/modules/purchase-request/entities/purchase_requests.schema";

export const purchaseRequestItems = pgTable(
  "purchase_request_items",
  {
    id: serial("id").primaryKey(),
    purchaseRequestId: integer("purchase_request_id")
      .references(() => purchaseRequests.id, { onDelete: "cascade" })
      .notNull(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    unique("unq_pr_product").on(table.purchaseRequestId, table.productId),
    check("chk_quantity_gt_zero", sql`${table.quantity} > 0`),
  ],
);
