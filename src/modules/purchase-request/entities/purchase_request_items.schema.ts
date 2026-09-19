import { createId } from "@paralleldrive/cuid2";
import { pgTable, integer, unique, check, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "@/modules/product/entities/products.schema";
import { purchaseRequests } from "@/modules/purchase-request/entities/purchase_requests.schema";

export const purchaseRequestItems = pgTable(
  "purchase_request_items",
  {
    id: varchar("id", { length: 24 })
      .$defaultFn(() => createId())
      .primaryKey(),
    purchaseRequestId: varchar("purchase_request_id", { length: 24 })
      .references(() => purchaseRequests.id, { onDelete: "cascade" })
      .notNull(),
    productId: varchar("product_id", { length: 24 })
      .references(() => products.id)
      .notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    unique("unq_pr_product").on(table.purchaseRequestId, table.productId),
    check("chk_quantity_gt_zero", sql`${table.quantity} > 0`),
  ],
);
