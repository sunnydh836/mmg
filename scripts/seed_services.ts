import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
    {
        title: "Mobile Sales",
        description: "New smartphones from leading brands, with options across different budgets.",
        features: [
            "New smartphones",
            "Multiple brands",
            "Different price ranges",
            "In-store assistance"
        ],
        icon: "Smartphone",
        sortOrder: 1
    },
    {
        title: "Mobile Repairing",
        description: "Mobile repairing services available in-store. Contact us for device-specific repair requirements.",
        features: [
            "In-store mobile repairing",
            "Device evaluation",
            "Contact the shop for specific repair requirements"
        ],
        icon: "Wrench",
        sortOrder: 2
    },
    {
        title: "Mobile Accessories",
        description: "Mobile accessories available in-store for your everyday smartphone needs.",
        features: [
            "Mobile accessories",
            "In-store availability",
            "Contact the shop for current availability"
        ],
        icon: "Headphones",
        sortOrder: 3
    },
    {
        title: "Old Phone Purchase",
        description: "Looking to sell your old phone? Bring your device to the store for evaluation and purchase details.",
        features: [
            "Old phone purchase",
            "Device evaluation",
            "In-store enquiry"
        ],
        icon: "Banknote", // Using Banknote as purchase/money
        sortOrder: 4
    },
    {
        title: "Phone Exchange",
        description: "Exchange an eligible old phone when purchasing another device from the store.",
        features: [
            "Old phone exchange",
            "Device evaluation",
            "Upgrade to another phone",
            "In-store exchange enquiry"
        ],
        icon: "RefreshCw", // Two smartphones + exchange arrows equivalent
        sortOrder: 5
    },
    {
        title: "New & Pre-Owned Phones",
        description: "Explore brand-new and eligible pre-owned/refurbished smartphones available at the store.",
        features: [
            "Brand-new phones",
            "Pre-owned phones",
            "Refurbished phones",
            "Availability may vary"
        ],
        icon: "Smartphone", // Smartphone / mobile collection icon
        sortOrder: 6
    }
];

async function main() {
    console.log("Seeding services...");

    for (const service of services) {
        // Upsert by title since there's no unique constaint on title, we'll find first.
        const existing = await prisma.service.findFirst({
            where: { title: service.title }
        });

        if (existing) {
            await prisma.service.update({
                where: { id: existing.id },
                data: service
            });
            console.log(`Updated: ${service.title}`);
        } else {
            await prisma.service.create({
                data: service
            });
            console.log(`Created: ${service.title}`);
        }
    }

    // Deactivate any other services not in this list for safety, or leave them. 
    // We'll leave them as is.
    console.log("Services seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
