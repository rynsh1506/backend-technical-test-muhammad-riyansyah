import re

with open("src/modules/product/service.ts", "r") as f:
    content = f.read()

# Add ilike, or, sql to imports
content = re.sub(
    r'import \{ eq \} from "drizzle-orm";',
    'import { eq, ilike, or, sql, desc } from "drizzle-orm";',
    content
)

# Replace the list() method
list_replacement = '''  /**
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
        ilike(products.sku, `%${search}%`)
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
  }'''

content = re.sub(
    r'/\*\*[\s\*]*\* Retrieves all products ordered by ID.*?static async list\(\) \{.*?\}' ,
    list_replacement,
    content,
    flags=re.DOTALL
)

with open("src/modules/product/service.ts", "w") as f:
    f.write(content)
