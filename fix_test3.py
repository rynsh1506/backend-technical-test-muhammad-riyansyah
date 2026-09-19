with open("src/modules/user/index.test.ts", "r") as f:
    content = f.read()

content = content.replace(
    'expect(status).toBe(200);',
    'if (status !== 200) console.error("FAILED WITH:", status, data || await api.users.get({headers: {cookie: validCookie}}).then(r=>r.error)); expect(status).toBe(200);'
)

with open("src/modules/user/index.test.ts", "w") as f:
    f.write(content)
