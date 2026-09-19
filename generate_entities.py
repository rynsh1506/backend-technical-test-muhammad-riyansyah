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
    
    # We will split db_part by "export const "
    # First, collect imports
    imports = []
    lines = db_part.split('\n')
    for line in lines:
        if line.startswith('import '):
            imports.append(line)
        elif line.startswith('} from "'):
            imports.append(line)
        elif 'from "' in line and 'import ' not in line:
            pass # multi-line import body, we'll just grab the whole import block with regex
            
    import_block = re.search(r'^(import .*?;\n)+', db_part, re.MULTILINE | re.DOTALL)
    imports_str = import_block.group(0) if import_block else ""
    
    # Let's just create ONE schema file per module first, named after the module, to see if that's easier.
    # No, the user explicitly asked for "1 domain butuh 2 bikin 2 ... sesuai nama table.schema.ts".
    
    # Actually, we can use ast or just use string splits.
    # "export const " is a good delimiter.
    
    blocks = re.split(r'\n(?=export const )', db_part)
    
    os.makedirs(f"src/modules/{mod}/entities", exist_ok=True)
    
    table_names = []
    
    for block in blocks:
        if not block.strip().startswith('export const'):
            continue
        
        # What is the exported name?
        m = re.match(r'export const (\w+) = (pgTable|pgEnum)\("([^"]+)"', block.strip())
        if not m:
            continue
            
        var_name = m.group(1)
        type_ = m.group(2)
        db_name = m.group(3)
        
        # We save this block to a file named {db_name}.schema.ts
        # Wait, if it's an enum, we probably want to keep it in the same file as the table that uses it,
        # or in its own file? "sesuai nama table.schema.ts". Enums aren't tables.
        # Let's put enums in the file of the table. How?
        pass

