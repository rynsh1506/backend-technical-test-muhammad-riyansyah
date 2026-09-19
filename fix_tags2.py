import re

with open("src/modules/purchase-order/index.ts", "r") as f:
    content = f.read()

# For the post("/") and post("/:id/order")
content = re.sub(
    r'cookie: t\.Optional\(t\.String\(\)\),\n\s*\}\),\n\s*\}\)',
    'cookie: t.Optional(t.String()),\n      }),\n      detail: { tags: ["Purchase Order"] }\n    }',
    content
)

# For get("/")
content = re.sub(
    r'status: t\.Optional\(t\.String\(\)\),\n\s*\}\),\n\s*\}\)',
    'status: t.Optional(t.String()),\n      }),\n      detail: { tags: ["Purchase Order"] }\n    }',
    content
)

with open("src/modules/purchase-order/index.ts", "w") as f:
    f.write(content)

with open("src/modules/goods-receipt/index.ts", "r") as f:
    content = f.read()

content = re.sub(
    r'cookie: t\.Optional\(t\.String\(\)\),\n\s*\}\),\n\s*\}\)',
    'cookie: t.Optional(t.String()),\n      }),\n      detail: { tags: ["Goods Receipt"] }\n    }',
    content
)

with open("src/modules/goods-receipt/index.ts", "w") as f:
    f.write(content)
