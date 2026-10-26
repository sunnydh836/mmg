const fs = require('fs');
const path = require('path');

const pages = [
    { p: 'about/page.tsx', title: 'About Us' },
    { p: 'contact/page.tsx', title: 'Contact Us' },
    { p: 'exchange/page.tsx', title: 'Phone Exchange' },
    { p: 'faq/page.tsx', title: 'FAQ' },
    { p: 'gallery/page.tsx', title: 'Gallery' },
    { p: 'pre-owned/page.tsx', title: 'Pre-Owned Phones' },
    { p: 'products/page.tsx', title: 'Mobile Collection' },
    { p: 'services/page.tsx', title: 'Repair Services' }
];

const basePath = path.join(__dirname, 'src/app/(public)');

for (const { p, title } of pages) {
    const filePath = path.join(basePath, p);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('export const metadata')) {
            const metaStr = `export const metadata = { title: '${title}' };\n`;
            // Find the first line that is not an import or 'use client'
            // To be safe, just inject after dynamic or 'force-dynamic' which is at line 1.
            if (content.startsWith("export const dynamic = 'force-dynamic';")) {
                content = content.replace("export const dynamic = 'force-dynamic';", "export const dynamic = 'force-dynamic';\n" + metaStr);
            } else {
                content = metaStr + content;
            }
            fs.writeFileSync(filePath, content);
            console.log('Added metadata to', p);
        }
    }
}
