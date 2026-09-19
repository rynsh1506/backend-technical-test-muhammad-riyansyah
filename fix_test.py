with open("src/modules/user/index.test.ts", "r") as f:
    content = f.read()

content = content.replace(
    'throw new Error("Failed to login for User Module tests");',
    'throw new Error("Failed to login: " + JSON.stringify(loginRes.error));'
)

with open("src/modules/user/index.test.ts", "w") as f:
    f.write(content)
