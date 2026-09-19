import os
import re

files = [
    "src/modules/warehouse/index.test.ts",
    "src/modules/product/index.test.ts",
    "src/modules/supplier/index.test.ts"
]

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # The broken pattern is:
    # const { status } = await api.<module>.post(
    #   const payload = ...;
    #   payload,
    
    # We will replace it using a regex.
    pattern = r'(const \{ status \} = await api\.[a-zA-Z]+\.post\(\s*)(const payload = [^;]+;\s*)(payload,)'
    replacement = r'\2\1\3'
    new_content = re.sub(pattern, replacement, content)
    
    with open(file, "w") as f:
        f.write(new_content)
