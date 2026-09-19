import { eq, ilike, or, sql, desc } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { products } from "@/modules/product/entities/products.schema";
import { productCreateDto, productUpdateDto } from "@/modules/product/dto";
import type { Static } from "elysia";

export abstract class ProductService {
  /**
   * Creates a new product record.
   *
   * @param data - The product creation payload.
   * @returns The newly created product.
   * @throws {500} If the database insert unexpectedly returns no data.
   */
  static async create(data: Static<typeof productCreateDto>) {
    const result = await db.insert(products).values(data).returning();
    if (!result[0]) {
      throw status(500, {
        error: { code: "INTERNAL_ERROR", message: "Failed to create Product" },
      });
    }
    return result[0];
  }

  /**
   * Retrieves a paginated list of products.
   *
   * @param page - The page number to retrieve.
   * @param limit - The maximum number of records per page.
   * @param search - Optional search string for name or SKU.
   * @returns Paginated product records.
   */
  static async list(page = 1, limit = 10, search?: string) {
    const offset = (page - 1) * limit;

    let whereCondition = undefined;
    if (search) {
      whereCondition = or(
        ilike(products.name, `%${search}%`),
        ilike(products.sku, `%${search}%`),
      );
    }

    const data = await db
      .select()
      .from(products)
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.id));

    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereCondition);

    const total = Number(totalRes[0]!.count);

    return {
      data,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    };
  }

  /**
   * Retrieves a single product by its primary key.
   *
   * @param id - The numeric ID of the product.
   * @returns The matching product record.
   * @throws {404} If no product with the given ID exists.
   */
  static async getById(id: string) {
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
  static async update(id: string, data: Static<typeof productUpdateDto>) {
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
