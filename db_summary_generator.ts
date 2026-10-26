import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        include: { images: true }
    });

    let output = 'Product | ID | Images | Image URLs\n';
    output += '---|---|---|---\n';
    for (const p of products) {
        const imgUrls = p.images.map(i => i.imageUrl).join(', ');
        output += `${p.name} | ${p.id} | ${p.images.length} | ${imgUrls}\n`;
    }

    fs.writeFileSync('db_summary.txt', output);
}

main().catch(console.error).finally(() => prisma.$disconnect());
