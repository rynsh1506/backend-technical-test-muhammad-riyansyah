import os
import re

modules = ["audit", "auth", "goods-receipt", "inventory", "product", "purchase-order", "purchase-request", "supplier", "warehouse"]

for mod in modules:
    model_path = f"src/modules/{mod}/model.ts"
    if not os.path.exists(model_path): continue
    
    with open(model_path, "r") as f:
        content = f.read()
        
    parts = content.split("/**\n * ==========================================\n * 2. BASE SCHEMAS")
    db_part = parts[0]
    dto_part = "/**\n * ==========================================\n * 2. BASE SCHEMAS" + parts[1]
    
    os.makedirs(f"src/modules/{mod}/entities", exist_ok=True)
    
    # We will identify all exports
    exports = re.findall(r'export const (\w+) = (pgTable|pgEnum)\("([^"]+)"(.*?)\);', db_part, re.DOTALL)
    
    # But regex might break on nested parenthesis.
    # Let's manually write the split for the 14 tables. It's so much faster and 100% bug-free.
