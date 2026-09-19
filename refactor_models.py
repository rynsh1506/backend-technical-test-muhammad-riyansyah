import os
import re

def flatten_auth():
    with open("src/modules/auth/model.ts", "r") as f:
        content = f.read()
    
    # Remove AuthModelTypes
    content = re.sub(r'export type AuthModelTypes = \{[\s\S]*?\};', '', content)
    
    # Replace AuthModel
    content = content.replace("export const AuthModel = {", "")
    content = content.replace("  loginBody: t.Pick(insertUserSchema, [\"username\", \"password\"]),", "export const loginBodyDto = t.Pick(insertUserSchema, [\"username\", \"password\"]);")
    content = content.replace("  loginResponse: t.Object({", "export const loginResponseDto = t.Object({")
    content = content.replace("    user: t.Pick(selectUserSchema, [\"id\", \"username\", \"role\"]),", "  user: t.Pick(selectUserSchema, [\"id\", \"username\", \"role\"]),")
    content = content.replace("  }),\n  loginInvalid: t.Object({", "});\nexport const loginInvalidDto = t.Object({")
    content = content.replace("    error: t.Object({ code: t.String(), message: t.String() }),\n  }),\n};", "  error: t.Object({ code: t.String(), message: t.String() }),\n});")
    
    with open("src/modules/auth/model.ts", "w") as f:
        f.write(content)
        
    # Fix Controller
    with open("src/modules/auth/index.ts", "r") as f:
        ctrl = f.read()
    ctrl = ctrl.replace("AuthModel.loginBody", "loginBodyDto")
    ctrl = ctrl.replace("AuthModel.loginResponse", "loginResponseDto")
    ctrl = ctrl.replace("AuthModel.loginInvalid", "loginInvalidDto")
    ctrl = ctrl.replace("AuthModel", "loginBodyDto, loginResponseDto, loginInvalidDto")
    with open("src/modules/auth/index.ts", "w") as f:
        f.write(ctrl)

def flatten_master(module, model_name):
    with open(f"src/modules/{module}/model.ts", "r") as f:
        content = f.read()
    
    content = re.sub(rf'export type {model_name}Types = \{{[\s\S]*?\}};\n?', '', content)
    
    content = content.replace(f"export const {model_name} = {{", "")
    
    # create
    content = re.sub(r'  create: (t\.Omit\(.*?\]\)),', rf'export const {module}CreateDto = \1;', content)
    # update (can be multiline, so just use basic replace for the key)
    content = re.sub(r'  update: (t\.Partial\([\s\S]*?\)),\n  response:', rf'export const {module}UpdateDto = \1;\n  response:', content)
    # response
    content = re.sub(r'  response: (select.*?Schema),', rf'export const {module}ResponseDto = \1;', content)
    # listResponse
    content = re.sub(r'  listResponse: t\.Object\(\{([\s\S]*?)\}\),\n\} as const;', rf'export const {module}ListResponseDto = t.Object({{\1}});', content)
    
    with open(f"src/modules/{module}/model.ts", "w") as f:
        f.write(content)
        
    # Fix Controller
    with open(f"src/modules/{module}/index.ts", "r") as f:
        ctrl = f.read()
    
    ctrl = ctrl.replace(f"{model_name}.create", f"{module}CreateDto")
    ctrl = ctrl.replace(f"{model_name}.update", f"{module}UpdateDto")
    ctrl = ctrl.replace(f"{model_name}.response", f"{module}ResponseDto")
    ctrl = ctrl.replace(f"{model_name}.listResponse", f"{module}ListResponseDto")
    ctrl = ctrl.replace(f"{model_name}", f"{module}CreateDto, {module}UpdateDto, {module}ResponseDto, {module}ListResponseDto")
    
    with open(f"src/modules/{module}/index.ts", "w") as f:
        f.write(ctrl)

flatten_auth()
flatten_master("product", "ProductModel")
flatten_master("supplier", "SupplierModel")
flatten_master("warehouse", "WarehouseModel")

