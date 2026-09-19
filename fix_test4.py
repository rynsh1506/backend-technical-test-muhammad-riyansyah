import re

with open("src/modules/user/service.ts", "r") as f:
    content = f.read()
content = content.replace("users.name", "users.username")
with open("src/modules/user/service.ts", "w") as f:
    f.write(content)

with open("src/modules/user/index.test.ts", "r") as f:
    content = f.read()

content = content.replace("data?.meta?.total", "data?.meta?.totalRecords")
content = content.replace(
    'if (status !== 200) console.error("FAILED WITH:", status, data || await api.users.get({headers: {cookie: validCookie}}).then(r=>r.error)); expect(status).toBe(200);',
    'expect(status).toBe(200);'
)
content = content.replace(
    'const { status, data } = await api.users({ id: "nonexistentcuid2string" }).get({',
    'const { status, error } = await api.users({ id: "nonexistentcuid2string" }).get({'
)
content = content.replace(
    'expect(data?.error?.code).toBe("NOT_FOUND");',
    'expect((error?.value as any)?.error?.code).toBe("NOT_FOUND");'
)

with open("src/modules/user/index.test.ts", "w") as f:
    f.write(content)
