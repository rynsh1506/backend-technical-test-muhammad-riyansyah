const fs = require('fs');
let code = fs.readFileSync('src/modules/purchase-request/service.ts', 'utf-8');
code = code.replace(/\n  },\n/g, '\n  }\n');
code = code.replace(/\n  },\n\n/g, '\n  }\n\n');
code = code.replace(/\n};\n?$/, '\n}\n');
fs.writeFileSync('src/modules/purchase-request/service.ts', code);
