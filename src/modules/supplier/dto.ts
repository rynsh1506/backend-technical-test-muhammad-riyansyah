import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { createPaginatedDto } from "@/utils/dto";
import { suppliers } from "./entities/suppliers.schema";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertSupplierSchema = createInsertSchema(suppliers);
export const selectSupplierSchema = createSelectSchema(suppliers);

const supplierInsert = spread(suppliers, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const supplierCreateDto = t.Object({
  name: supplierInsert.name,
  email: supplierInsert.email,
  phone: supplierInsert.phone,
  isActive: supplierInsert.isActive,
});

export const supplierUpdateDto = t.Partial(
  t.Object({
    name: supplierInsert.name,
    email: supplierInsert.email,
    phone: supplierInsert.phone,
    isActive: supplierInsert.isActive,
  }),
);

export const supplierResponseDto = selectSupplierSchema;
export const supplierListResponseDto = createPaginatedDto(selectSupplierSchema);
