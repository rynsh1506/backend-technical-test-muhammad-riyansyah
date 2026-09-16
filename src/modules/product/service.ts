import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "@/utils/db";
import { products } from "./model";
import type { ProductModelTypes } from "./model";

export abstract class ProductService {
  static async create(data: ProductModelTypes["create"]) {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  }

  static async list() {
    return await db.select().from(products).orderBy(products.id);
  }

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

  static async update(id: number, data: ProductModelTypes["update"]) {
    const existing = await this.getById(id);
    const result = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }
}
