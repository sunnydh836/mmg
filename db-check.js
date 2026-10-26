const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const g = await prisma.galleryImage.findMany();
    console.log('GalleryImage:', g.length);
    const p = await prisma.productImage.findMany();
    console.log('ProductImage:', p.length);
    const h = await prisma.heroImage.findMany();
    console.log('HeroImage:', h.length);
    const r = await prisma.instagramReel.findMany();
    console.log('InstagramReel:', r.length);
}
main().finally(() => prisma.$disconnect());
