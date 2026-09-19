# Fix PO
with open("src/modules/purchase-order/index.ts", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "cookie: t.Optional(t.String())," in line:
        new_lines.append('      }),\n      detail: { tags: ["Purchase Order"] }\n')
        # Skip next 2 lines
        
# wait, skipping lines is tricky.

