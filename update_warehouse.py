import re

# Update service.ts
with open("src/modules/warehouse/service.ts", "r") as f:
    content = f.read()

content = re.sub(
    r'import \{ eq \} from "drizzle-orm";',
    'import { eq, ilike, or, sql, desc } from "drizzle-orm";',
    content
)

list_replacement = '''  /**
   * Retrieves a paginated list of warehouses.
   *
   * @param page - The page number to retrieve.
   * @param limit - The maximum number of records per page.
   * @param search - Optional search string for name or code.
   * @returns Paginated warehouse records.
   */
  static async list(page = 1, limit = 10, search?: string) {
    const offset = (page - 1) * limit;

    let whereCondition = undefined;
    if (search) {
      whereCondition = or(
        ilike(warehouses.name, `%${search}%`),
        ilike(warehouses.code, `%${search}%`)
      );
    }

    const data = await db
      .select()
      .from(warehouses)
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(warehouses.id));

    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(warehouses)
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
    r'/\*\*[\s\*]*\* Retrieves all warehouses ordered by ID.*?static async list\(\) \{.*?\}' ,
    list_replacement,
    content,
    flags=re.DOTALL
)

with open("src/modules/warehouse/service.ts", "w") as f:
    f.write(content)

# Update model.ts
with open("src/modules/warehouse/model.ts", "r") as f:
    content = f.read()

new_list_response = '''listResponse: t.Object({
    data: t.Array(selectWarehouseSchema),
    meta: t.Object({
      page: t.Number(),
      limit: t.Number(),
      totalPages: t.Number(),
      totalRecords: t.Number(),
    }),
  }),'''

content = re.sub(r'listResponse: t\.Array\(selectWarehouseSchema\),', new_list_response, content)

with open("src/modules/warehouse/model.ts", "w") as f:
    f.write(content)


# Update index.ts
with open("src/modules/warehouse/index.ts", "r") as f:
    content = f.read()

new_get_route = '''  .get(
    "/",
    async ({ query }) => {
      const page = query.page ? parseInt(query.page as string, 10) : 1;
      const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
      return await WarehouseService.list(page, limit, query.search as string | undefined);
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      response: WarehouseModel.listResponse,
      detail: {
        tags: ["Master Data: Warehouse"],
        summary: "List all Warehouses",
      },
    },
  )'''

content = re.sub(
    r'\.get\(\s*"/",\s*async \(\) => \{\s*return await WarehouseService\.list\(\);\s*\},.*?\}\s*,\s*\)',
    new_get_route,
    content,
    flags=re.DOTALL
)

with open("src/modules/warehouse/index.ts", "w") as f:
    f.write(content)
