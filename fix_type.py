import os
import re

files = [
    ("src/modules/warehouse/index.test.ts", "api.warehouses.post"),
    ("src/modules/product/index.test.ts", "api.products.post"),
    ("src/modules/supplier/index.test.ts", "api.suppliers.post"),
    ("src/modules/auth/index.test.ts", "api.auth.login.post"),
]

for file, api in files:
    with open(file, "r") as f:
        content = f.read()

    # match `as unknown as { ... }` possibly across multiple lines
    pattern = r'as unknown as \{[^}]*\}'
    replacement = f'as unknown as Parameters<typeof {api}>[0]'
    
    new_content = re.sub(pattern, replacement, content)
    
    with open(file, "w") as f:
        f.write(new_content)
