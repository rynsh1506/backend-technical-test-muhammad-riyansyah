import re

def fix_service(module, model_name, dtos):
    path = f"src/modules/{module}/service.ts"
    with open(path, "r") as f:
        content = f.read()
    
    # Replace import
    content = re.sub(rf'import type {{ {model_name}Types }} from "@/modules/{module}/model";', f'import {{ {", ".join(dtos)} }} from "@/modules/{module}/model";\nimport type {{ Static }} from "elysia";', content)
    
    # Replace usages
    if module == "auth":
        content = content.replace(f'{model_name}Types["loginBody"]', f'Static<typeof loginBodyDto>')
    else:
        content = content.replace(f'{model_name}Types["create"]', f'Static<typeof {module}CreateDto>')
        content = content.replace(f'{model_name}Types["update"]', f'Static<typeof {module}UpdateDto>')
        
    with open(path, "w") as f:
        f.write(content)

fix_service("auth", "AuthModel", ["loginBodyDto"])
fix_service("product", "ProductModel", ["productCreateDto", "productUpdateDto"])
fix_service("supplier", "SupplierModel", ["supplierCreateDto", "supplierUpdateDto"])
fix_service("warehouse", "WarehouseModel", ["warehouseCreateDto", "warehouseUpdateDto"])

