with open("src/modules/user/service.ts", "r") as f:
    content = f.read()

content = content.replace(
    'import { eq, desc, ilike, or } from "drizzle-orm";',
    'import { eq, desc, ilike, or, sql } from "drizzle-orm";'
)

old_logic = """    const results = await query;
    const countResult = await db.select({ count: users.id }).from(users);
    const total = countResult.length;

    return {
      data: results.map(({ passwordHash, ...u }) => u),
      meta: { limit, offset, total },
    };"""

new_logic = """    const results = await query;
    const countResult = await db.select({ count: sql`count(*)` }).from(users);
    const total = Number(countResult[0].count);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: results.map(({ passwordHash, ...u }) => u),
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    };"""

content = content.replace(old_logic, new_logic)

with open("src/modules/user/service.ts", "w") as f:
    f.write(content)
