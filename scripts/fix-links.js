import fs from 'fs';
import path from 'path';

const docsDir = path.resolve(process.cwd(), 'docs');

function findAndFixIndexFiles(directory) {
    try {
        const items = fs.readdirSync(directory, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(directory, item.name);
            if (item.isDirectory()) {
                findAndFixIndexFiles(fullPath); // Recurse into subdirectories
            } else if (item.name === 'index.md') {
                fixLinksInFile(fullPath); // Fix the index.md file
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${directory}: ${error.message}`);
    }
}

function fixLinksInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Determine the language directory ('en' or 'zh')
        const lang = filePath.includes(path.join(docsDir, 'en')) ? 'en' : 'zh';

        // The incorrect prefix is always /en/en/ because the zh directory was copied from en
        const incorrectLinkPattern = /\(\/en\/en\//g;
        const correctLinkPrefix = `](/${lang}/`;

        if (incorrectLinkPattern.test(content)) {
            content = content.replace(incorrectLinkPattern, correctLinkPrefix);
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed dead links in: ${path.relative(process.cwd(), filePath)}`);
        }
    } catch (error) {
        console.error(`Failed to fix file ${filePath}: ${error.message}`);
    }
}

console.log('--- Starting to fix dead links in index.md files ---');
findAndFixIndexFiles(docsDir);
console.log('--- Finished fixing dead links. ---');
