import re

# Update model.ts
with open("src/modules/product/model.ts", "r") as f:
    content = f.read()

new_list_response = '''listResponse: t.Object({
    data: t.Array(selectProductSchema),
    meta: t.Object({
      page: t.Number(),
      limit: t.Number(),
      totalPages: t.Number(),
      totalRecords: t.Number(),
    }),
  }),'''

content = re.sub(r'listResponse: t\.Array\(selectProductSchema\),', new_list_response, content)

with open("src/modules/product/model.ts", "w") as f:
    f.write(content)

# Update index.ts
with open("src/modules/product/index.ts", "r") as f:
    content = f.read()

new_get_route = '''  .get(
    "/",
    async ({ query }) => {
      const page = query.page ? parseInt(query.page as string, 10) : 1;
      const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
      return await ProductService.list(page, limit, query.search as string | undefined);
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      response: ProductModel.listResponse,
      detail: {
        tags: ["Master Data: Product"],
        summary: "List all Products",
      },
    },
  )'''

# find the get("/") block
# .get(
#    "/",
#    async () => {
#      return await ProductService.list();
#    },
#    {
#      response: ProductModel.listResponse,
#      detail: {
#        tags: ["Master Data: Product"],
#        summary: "List all Products",
#      },
#    },
#  )

content = re.sub(
    r'\.get\(\s*"/",\s*async \(\) => \{\s*return await ProductService\.list\(\);\s*\},.*?\}\s*,\s*\)',
    new_get_route,
    content,
    flags=re.DOTALL
)

with open("src/modules/product/index.ts", "w") as f:
    f.write(content)
