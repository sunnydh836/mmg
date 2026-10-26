import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({ include: { images: true } });

    let hasExternal = 0;
    let hasProductsLocal = 0;
    let hasUploadsLocal = 0;
    const notFoundFiles: string[] = [];

    products.forEach(p => {
        p.images.forEach(img => {
            const url = img.imageUrl;
            if (url.startsWith('http')) hasExternal++;
            if (url.startsWith('/products')) {
                hasProductsLocal++;
                const path = 'c:/Users/sunny/Desktop/MMG/mmg-web/public' + url;
                if (!fs.existsSync(path)) notFoundFiles.push(url);
            }
            if (url.startsWith('/uploads/products')) hasUploadsLocal++;
        });
    });

    console.log(`External HTTP URLs: ${hasExternal}`);
    console.log(`/products URLs: ${hasProductsLocal}`);
    console.log(`/uploads/products URLs: ${hasUploadsLocal}`);
    console.log(`Missing physical files: ${notFoundFiles.length}`);
    if (notFoundFiles.length > 0) {
        console.log(`Some missing files: ${notFoundFiles.slice(0, 5).join(', ')}`);
    } else {
        console.log('All local files exist!');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
