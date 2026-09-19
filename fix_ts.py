with open("src/modules/user/index.test.ts", "r") as f:
    content = f.read()

content = content.replace(
    'expect(data?.data[0].username.toLowerCase()).toContain("staff");',
    'expect(data?.data?.[0]?.username.toLowerCase()).toContain("staff");'
)

with open("src/modules/user/index.test.ts", "w") as f:
    f.write(content)

with open("src/modules/user/service.ts", "r") as f:
    content = f.read()

content = content.replace(
    'const total = Number(countResult[0].count);',
    'const total = Number(countResult[0]?.count || 0);'
)

with open("src/modules/user/service.ts", "w") as f:
    f.write(content)
