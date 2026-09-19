import re

files = [
    "src/modules/product/index.test.ts",
    "src/modules/supplier/index.test.ts",
    "src/modules/warehouse/index.test.ts"
]

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # We need to replace:
    # expect(Array.isArray(data)).toBe(true);
    # expect(data?.length).toBeGreaterThan(0);
    
    # with:
    # expect(data).toHaveProperty("data");
    # expect(data).toHaveProperty("meta");
    # expect(Array.isArray(data?.data)).toBe(true);
    # expect(data?.data.length).toBeGreaterThan(0);
    
    new_assertions = '''expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("meta");
      expect(Array.isArray(data?.data)).toBe(true);
      expect(data?.data.length).toBeGreaterThan(0);'''
      
    content = re.sub(
        r'expect\(Array\.isArray\(data\)\)\.toBe\(true\);\s*expect\(data\?\.length\)\.toBeGreaterThan\(0\);',
        new_assertions,
        content
    )
    
    with open(file, "w") as f:
        f.write(content)
