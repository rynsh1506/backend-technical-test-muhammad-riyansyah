import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { createPaginatedDto } from "@/utils/dto";
import { products } from "./entities/products.schema";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

const productInsert = spread(products, "insert");

/**
 * ==========================================
 * 3. API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const productCreateDto = t.Object({
  sku: productInsert.sku,
  name: productInsert.name,
  unit: productInsert.unit,
  isActive: productInsert.isActive,
});

export const productUpdateDto = t.Partial(
  t.Object({
    name: productInsert.name,
    unit: productInsert.unit,
    isActive: productInsert.isActive,
  }),
);

export const productResponseDto = selectProductSchema;
export const productListResponseDto = createPaginatedDto(selectProductSchema);
