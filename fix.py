files = [
    "src/modules/warehouse/index.test.ts",
    "src/modules/product/index.test.ts",
    "src/modules/supplier/index.test.ts"
]

for file in files:
    with open(file, "r") as f:
        lines = f.readlines()
        
    out = []
    for i, line in enumerate(lines):
        if "const payload =" in line and "await api" not in line:
            # We found the payload inside the function call
            # Move it up!
            # The previous line is `const { status } = await api...`
            # Let's find it by looking backwards
            j = len(out) - 1
            while j >= 0 and "await api" not in out[j]:
                j -= 1
            if j >= 0:
                # Insert the payload declaration BEFORE the await api line
                # Keep the indentation of the await api line
                indent = out[j][:len(out[j]) - len(out[j].lstrip())]
                out.insert(j, indent + line.strip() + "\n")
                # Now add the `payload,` where the line originally was
                # out.append(line.replace("const payload =", "payload,")) wait, the next line is already `payload,`
                pass
        else:
            out.append(line)
            
    with open(file, "w") as f:
        f.writelines(out)
