import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.adminUser.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
        },
    })

    // Master data: Brands
    const brandsToSeed = [
        "Apple", "Samsung", "OnePlus", "Oppo", "Vivo", "Realme",
        "Xiaomi", "Redmi", "Motorola", "Nothing", "Google",
        "Infinix", "Tecno", "Poco", "iQOO", "Other"
    ];

    for (const name of brandsToSeed) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.brand.upsert({
            where: { slug },
            update: {},
            create: { name, slug }
        });
    }

    // Master data: Categories
    const categoriesToSeed = [
        "Smartphones", "Feature Phones", "Tablets",
        "Accessories", "Smartwatches", "Audio", "Other"
    ];

    for (const name of categoriesToSeed) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.category.upsert({
            where: { slug },
            update: {},
            create: { name, slug }
        });
    }

    // Basic settings
    await prisma.storeSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            businessName: "Mahadev Mobile Gallery",
            displayName: "Mahadev Mobile Gallery",
            tagline: "Mobiles & Accessories",
            phone: "1234567890",
            whatsapp: "1234567890",
            address: "Gagol Rd, Sector 2, Meerut",
            mapsUrl: "https://maps.google.com",
            openingTime: "09:00",
            closingTime: "22:00",
            weeklyOff: "Tuesday",
            email: "info@example.com"
        }
    })

    console.log({ admin })
    console.log("Database seeded successfully with default Admin, Brands, and Categories.")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
