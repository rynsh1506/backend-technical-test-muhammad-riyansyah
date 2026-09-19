import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { spread } from "@/utils/drizzle";
import { createPaginatedDto } from "@/utils/dto";
import { warehouses } from "@/modules/warehouse/entities/warehouses.schema";

/**
 * ==========================================
 * BASE SCHEMAS (Drizzle TypeBox)
 * ==========================================
 * Auto-generated TypeBox schemas directly from the database tables.
 */
export const insertWarehouseSchema = createInsertSchema(warehouses);
export const selectWarehouseSchema = createSelectSchema(warehouses);

const warehouseInsert = spread(warehouses, "insert");

/**
 * ==========================================
 * API DTOs (Elysia TypeBox)
 * ==========================================
 * Data Transfer Objects for API request/response validation.
 */
export const warehouseCreateDto = t.Object({
  code: warehouseInsert.code,
  name: warehouseInsert.name,
  location: warehouseInsert.location,
  isActive: warehouseInsert.isActive,
});

export const warehouseUpdateDto = t.Partial(
  t.Object({
    name: warehouseInsert.name,
    location: warehouseInsert.location,
    isActive: warehouseInsert.isActive,
  }),
);

export const warehouseResponseDto = selectWarehouseSchema;
export const warehouseListResponseDto = createPaginatedDto(
  selectWarehouseSchema,
);
