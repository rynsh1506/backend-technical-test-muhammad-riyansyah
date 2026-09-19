with open("src/modules/user/index.test.ts", "r") as f:
    content = f.read()

content = content.replace(
    'const { status, data } = await api.users.get({',
    'const { status, data, error } = await api.users.get({'
)

content = content.replace(
    'expect(status).toBe(200);',
    'if (status !== 200) console.error("ERROR DATA:", error?.value); expect(status).toBe(200);'
)

with open("src/modules/user/index.test.ts", "w") as f:
    f.write(content)
