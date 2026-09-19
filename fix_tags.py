import re

# Fix PO
with open("src/modules/purchase-order/index.ts", "r") as f:
    po_content = f.read()

# Replace post("/")
po_content = re.sub(
    r'body: poCreateDto,\n\s*headers: t\.Object\(\{\n\s*"idempotency-key": t\.Optional\(t\.String\(\)\),\n\s*cookie: t\.Optional\(t\.String\(\)\),\n\s*\}\),\n\s*\}\)',
    'body: poCreateDto,\n      headers: t.Object({\n        "idempotency-key": t.Optional(t.String()),\n        cookie: t.Optional(t.String()),\n      }),\n      detail: { tags: ["Purchase Order"], summary: "Create PO from PR" }\n    }',
    po_content
)

# Replace get("/")
po_content = re.sub(
    r'query: t\.Object\(\{\n\s*page: t\.Optional\(t\.Numeric\(\)\),\n\s*limit: t\.Optional\(t\.Numeric\(\)\),\n\s*status: t\.Optional\(t\.String\(\)\),\n\s*\}\),\n\s*\}\)',
    'query: t.Object({\n        page: t.Optional(t.Numeric()),\n        limit: t.Optional(t.Numeric()),\n        status: t.Optional(t.String()),\n      }),\n      detail: { tags: ["Purchase Order"], summary: "List POs" }\n    }',
    po_content
)

# Replace get("/:id")
po_content = re.sub(
    r'\.get\("/:id", async \(\{ params: \{ id \} \}\) => \{\n\s*return await PurchaseOrderService\.getDetail\(Number\(id\)\);\n\s*\}\)',
    '.get("/:id", async ({ params: { id } }) => {\n    return await PurchaseOrderService.getDetail(Number(id));\n  },\n  {\n    detail: { tags: ["Purchase Order"], summary: "Get PO Details" }\n  })',
    po_content
)

# Replace post("/:id/order")
po_content = re.sub(
    r'headers: t\.Object\(\{\n\s*"idempotency-key": t\.Optional\(t\.String\(\)\),\n\s*cookie: t\.Optional\(t\.String\(\)\),\n\s*\}\),\n\s*\}\)',
    'headers: t.Object({\n        "idempotency-key": t.Optional(t.String()),\n        cookie: t.Optional(t.String()),\n      }),\n      detail: { tags: ["Purchase Order"], summary: "Mark PO as Ordered" }\n    }',
    po_content
)

with open("src/modules/purchase-order/index.ts", "w") as f:
    f.write(po_content)


# Fix GR
with open("src/modules/goods-receipt/index.ts", "r") as f:
    gr_content = f.read()

# Replace post("/")
gr_content = re.sub(
    r'body: grCreateDto,\n\s*headers: t\.Object\(\{\n\s*"idempotency-key": t\.Optional\(t\.String\(\)\),\n\s*cookie: t\.Optional\(t\.String\(\)\),\n\s*\}\),\n\s*\}\)',
    'body: grCreateDto,\n      headers: t.Object({\n        "idempotency-key": t.Optional(t.String()),\n        cookie: t.Optional(t.String()),\n      }),\n      detail: { tags: ["Goods Receipt"], summary: "Create Goods Receipt" }\n    }',
    gr_content
)

# Replace get("/:id")
gr_content = re.sub(
    r'\.get\("/:id", async \(\{ params: \{ id \} \}\) => \{\n\s*return await GoodsReceiptService\.getDetail\(Number\(id\)\);\n\s*\}\);',
    '.get("/:id", async ({ params: { id } }) => {\n    return await GoodsReceiptService.getDetail(Number(id));\n  },\n  {\n    detail: { tags: ["Goods Receipt"], summary: "Get GR Details" }\n  });',
    gr_content
)

with open("src/modules/goods-receipt/index.ts", "w") as f:
    f.write(gr_content)
