with open("src/modules/user/index.test.ts", "r") as f:
    content = f.read()

content = content.replace('api.users.index.get', 'api.users.get')

with open("src/modules/user/index.test.ts", "w") as f:
    f.write(content)
