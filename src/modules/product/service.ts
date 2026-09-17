import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { products } from "@/modules/product/model";
import type { ProductModelTypes } from "@/modules/product/model";

export abstract class ProductService {
  /**
   * Creates a new product record.
   *
   * @param data - The product creation payload.
   * @returns The newly created product.
   * @throws {500} If the database insert unexpectedly returns no data.
   */
  static async create(data: ProductModelTypes["create"]) {
    const result = await db.insert(products).values(data).returning();
    if (!result[0]) {
      throw status(500, {
        error: { code: "INTERNAL_ERROR", message: "Failed to create Product" },
      });
    }
    return result[0];
  }

  /**
   * Retrieves all products ordered by ID (ascending).
   *
   * @returns An array of all product records.
   */
  static async list() {
    return await db.select().from(products).orderBy(products.id);
  }

  /**
   * Retrieves a single product by its primary key.
   *
   * @param id - The numeric ID of the product.
   * @returns The matching product record.
   * @throws {404} If no product with the given ID exists.
   */
  static async getById(id: number) {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!result[0]) {
      throw status(404, {
        error: { code: "NOT_FOUND", message: "Product not found" },
      });
    }
    return result[0];
  }

  /**
   * Updates an existing product by its primary key.
   *
   * @param id - The numeric ID of the product to update.
   * @param data - The partial update payload.
   * @returns The updated product record.
   * @throws {404} If no product with the given ID exists.
   * @throws {500} If the database update unexpectedly returns no data.
   */
  static async update(id: number, data: ProductModelTypes["update"]) {
    await this.getById(id);
    const result = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    if (!result[0]) {
      throw status(500, {
        error: { code: "INTERNAL_ERROR", message: "Failed to update Product" },
      });
    }
    return result[0];
  }
}
