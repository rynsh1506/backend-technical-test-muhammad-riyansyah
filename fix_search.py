with open("src/modules/user/service.ts", "r") as f:
    content = f.read()

content = content.replace(
    'or(ilike(users.username, `%${search}%`), ilike(users.email, `%${search}%`)),',
    'ilike(users.username, `%${search}%`),'
)

with open("src/modules/user/service.ts", "w") as f:
    f.write(content)

with open("src/modules/user/index.test.ts", "r") as f:
    content = f.read()

content = content.replace(
    'if (status !== 200) console.error("ERROR DATA:", error?.value); expect(status).toBe(200);',
    'expect(status).toBe(200);'
)

with open("src/modules/user/index.test.ts", "w") as f:
    f.write(content)
