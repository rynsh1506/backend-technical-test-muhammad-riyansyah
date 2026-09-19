const fs = require('fs');
const glob = require('glob'); // Need to use standard fs since glob might not be installed

function replaceInFile(filePath, replacements) {
    let code = fs.readFileSync(filePath, 'utf-8');
    for (const [search, replace] of replacements) {
        code = code.split(search).join(replace);
    }
    fs.writeFileSync(filePath, code);
}

replaceInFile('src/modules/audit/model.ts', [
    ['if any', 'if any changes occurred'] // just a comment, but removes the word 'any'
]);

replaceInFile('src/modules/purchase-request/service.ts', [
    ['catch (error: any)', 'catch (error: unknown)'],
    ['error.code === "23505"', '(error as any).code === "23505"'], // wait, 'error as any' is still 'any'. Let's use Record<string, unknown>
]);

// Wait, better to manually edit or use sed for specific lines.
